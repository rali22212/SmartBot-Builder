from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from sqlalchemy import text
from datetime import datetime
from werkzeug.utils import secure_filename
import tempfile
from pathlib import Path

from groq import Groq
import pypdf
import docx2txt

from models import db, Organization, ChatHistory, WidgetConfig, User
from auth import auth_bp
from email_service import mail
from middleware import jwt_required, jwt_optional

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration - Neon PostgreSQL
# Database configuration - Neon PostgreSQL
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("Warning: DATABASE_URL not set in .env")

if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,      # Test connections before using (fixes Neon SSL drops)
    'pool_recycle': 300,         # Recycle connections every 5 minutes
    'pool_size': 5,              # Keep pool small for free tier
    'max_overflow': 2,           # Allow 2 extra connections under load
}
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret-key')

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

# Initialize extensions
db.init_app(app)
mail.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp)

# AI Configuration
groq_api_key = os.getenv("GROQ_API_KEY")
llm = None

if groq_api_key:
    llm = Groq(api_key=groq_api_key)

def get_context_text(org):
    """Extract context text from organization data for LLM queries."""
    if org.mode == 'automatic' and org.data and org.data.get('content'):
        return org.data['content']
    elif org.mode == 'manual' and org.data:
        d = org.data
        text = f"Organization Name: {d.get('name', '')}\n"
        text += f"Website: {d.get('website', '')}\n"
        text += f"Industry: {d.get('industry', '')}\n"
        text += f"About: {d.get('about', '')}\n\nEmployees:\n"
        for emp in d.get('employees', []):
            text += f"- {emp.get('name', '')}: {emp.get('role', '')}\n"
        text += "\nProducts:\n"
        for prod in d.get('products', []):
            text += f"- {prod.get('name', '')}: {prod.get('details', '')}\n"
        text += "\nServices:\n"
        for serv in d.get('services', []):
            text += f"- {serv.get('name', '')}: {serv.get('details', '')}\n"
        return text
    return ''

# Create tables
with app.app_context():
    db.create_all()
    # Migration for is_deleted
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE"))
            conn.commit()
            print("Migration checking complete")
    except Exception as e:
        print(f"Migration note: {e}")

@app.route('/')
def home():
    return jsonify({"message": "SmartBot Builder API is running!", "status": "ok"})

@app.route('/api/user/me', methods=['GET'])
@jwt_required
def get_current_user():
    """Get current authenticated user"""
    user = User.query.get(request.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200

@app.route('/api/organizations', methods=['GET'])
@jwt_required
def get_organizations():
    """Get all organizations for the authenticated user"""
    orgs = Organization.query.filter_by(user_id=request.user_id, is_deleted=False).order_by(Organization.created_at.desc()).all()
    return jsonify([org.to_dict() for org in orgs])

@app.route('/api/organizations/<org_id>', methods=['GET'])
@jwt_required
def get_organization(org_id):
    """Get a single organization"""
    org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
    if not org:
        return jsonify({'error': 'Organization not found'}), 404
    return jsonify(org.to_dict())

@app.route('/api/create-bot', methods=['POST'])
@jwt_required
def create_bot():
    """Create a new chatbot"""
    try:
        mode = request.form.get('mode')
        bot_name = request.form.get('botName')
        bot_description = request.form.get('botDescription')

        if not bot_name or not bot_description:
            return jsonify({"error": "Bot name and description are required"}), 400

        # Check bot limit for free tier
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({"error": "User not found. Please login again."}), 401
            
        if user.tier == 'free':
            bot_count = Organization.query.filter_by(user_id=request.user_id, is_deleted=False).count()
            if bot_count >= 3:
                return jsonify({"error": "Free tier limit reached (3 bots). Upgrade to Pro for unlimited bots."}), 403

        org_data = {}

        if mode == 'automatic':
            if 'pdfFile' not in request.files:
                return jsonify({"error": "Document file is required for automatic mode"}), 400

            doc_file = request.files['pdfFile']
            if doc_file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            # Get file extension
            filename = secure_filename(doc_file.filename)
            file_ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
            
            if file_ext not in ['pdf', 'docx', 'doc']:
                return jsonify({"error": "Only PDF and DOCX files are supported"}), 400

            # Create temp file with correct extension
            suffix = f'.{file_ext}' if file_ext else '.pdf'
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                doc_file.save(tmp_file.name)
                tmp_path = tmp_file.name

            try:
                # Extract text based on file type
                if file_ext == 'pdf':
                    reader = pypdf.PdfReader(tmp_path)
                    pages = [page.extract_text() or '' for page in reader.pages]
                    full_text = "\n\n".join(pages)
                else:
                    full_text = docx2txt.process(tmp_path)

                org_data = {
                    "file_name": filename,
                    "file_type": file_ext.upper(),
                    "content": full_text
                }

            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        elif mode == 'manual':
            org_name = request.form.get('orgName')
            org_website = request.form.get('orgWebsite', '')
            org_industry = request.form.get('orgIndustry', '')
            org_about = request.form.get('orgAbout', '')

            import json
            employees = json.loads(request.form.get('employees', '[]'))
            products = json.loads(request.form.get('products', '[]'))
            services = json.loads(request.form.get('services', '[]'))

            if not org_name:
                return jsonify({"error": "Organization name is required"}), 400

            text_content = f"""
Organization Name: {org_name}
Website: {org_website}
Industry: {org_industry}
About: {org_about}

Employees:
"""
            for emp in employees:
                text_content += f"- {emp['name']}: {emp['role']}\n"

            text_content += "\nProducts:\n"
            for prod in products:
                text_content += f"- {prod['name']}: {prod['details']}\n"

            text_content += "\nServices:\n"
            for serv in services:
                text_content += f"- {serv['name']}: {serv['details']}\n"

            # Text content is stored in org_data below

            org_data = {
                "name": org_name,
                "website": org_website,
                "industry": org_industry,
                "about": org_about,
                "employees": employees,
                "products": products,
                "services": services
            }

        else:
            return jsonify({"error": "Invalid mode"}), 400

        # Create organization in database
        organization = Organization(
            user_id=request.user_id,
            name=bot_name,
            description=bot_description,
            mode=mode,
            data=org_data,
            location="Global"
        )
        db.session.add(organization)
        db.session.commit()

        # Create default widget config
        widget_config = WidgetConfig(organization_id=organization.id)
        db.session.add(widget_config)
        db.session.commit()

        return jsonify({
            "message": "Chatbot created successfully!",
            "organization_id": organization.id,
            "name": bot_name
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating bot: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/bot/<org_id>/settings', methods=['GET'])
@jwt_required
def get_bot_settings(org_id):
    """Get bot widget settings"""
    org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
    if not org:
        return jsonify({'error': 'Organization not found'}), 404
    
    config = WidgetConfig.query.filter_by(organization_id=org_id).first()
    if not config:
        config = WidgetConfig(organization_id=org_id)
        db.session.add(config)
        db.session.commit()
    
    return jsonify({
        'organization': org.to_dict(),
        'widget_config': config.to_dict()
    })

@app.route('/api/bot/<org_id>/settings', methods=['PUT'])
@jwt_required
def update_bot_settings(org_id):
    """Update bot widget settings"""
    org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
    if not org:
        return jsonify({'error': 'Organization not found'}), 404
    
    data = request.get_json()
    config = WidgetConfig.query.filter_by(organization_id=org_id).first()
    
    if config:
        if 'theme' in data:
            config.theme = data['theme']
        if 'position' in data:
            config.position = data['position']
        if 'welcome_message' in data:
            config.welcome_message = data['welcome_message']
        if 'primary_color' in data:
            config.primary_color = data['primary_color']
        db.session.commit()
    
    return jsonify({'message': 'Settings updated', 'widget_config': config.to_dict()})

@app.route('/api/bot/<org_id>/analytics', methods=['GET'])
@jwt_required
def get_bot_analytics(org_id):
    """Get analytics for a bot"""
    org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
    if not org:
        return jsonify({'error': 'Organization not found'}), 404
    
    total_messages = db.session.query(ChatHistory).filter_by(organization_id=org_id).count()
    
    # Get messages from last 7 days
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_messages = db.session.query(ChatHistory).filter(
        ChatHistory.organization_id == org_id,
        ChatHistory.timestamp >= week_ago
    ).count()
    
    # Get recent chat history
    recent_chats = db.session.query(ChatHistory).filter_by(organization_id=org_id)\
        .order_by(ChatHistory.timestamp.desc()).limit(10).all()
    
    return jsonify({
        'total_messages': total_messages,
        'messages_this_week': recent_messages,
        'recent_chats': [chat.to_dict() for chat in recent_chats]
    })

@app.route('/api/bot/<org_id>/embed', methods=['GET'])
@jwt_required
def get_embed_code(org_id):
    """Get embed code for a bot"""
    org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
    if not org:
        return jsonify({'error': 'Organization not found'}), 404
    
    config = WidgetConfig.query.filter_by(organization_id=org_id).first()
    
    # Generate embed code
    base_url = request.host_url.rstrip('/')
    embed_code = f'''<!-- SmartBot Widget -->
<script>
  (function() {{
    var script = document.createElement('script');
    script.src = '{base_url}/widget.js';
    script.setAttribute('data-bot-id', '{org_id}');
    script.setAttribute('data-theme', '{config.theme if config else "dark"}');
    script.setAttribute('data-position', '{config.position if config else "bottom-right"}');
    script.setAttribute('data-color', '{config.primary_color if config else "#8B5CF6"}');
    document.body.appendChild(script);
  }})();
</script>'''
    
    return jsonify({
        'embed_code': embed_code,
        'bot_id': org_id
    })

@app.route('/api/query/<org_id>', methods=['POST'])
@jwt_optional
def query_organization(org_id):
    """Query a chatbot (works for both authenticated users and widget)"""
    try:
        data = request.get_json()
        query = data.get('query')

        if not query:
            return jsonify({"error": "Query is required"}), 400

        org = Organization.query.get(org_id)
        if not org:
            return jsonify({"error": "Organization not found"}), 404

        # Get context text from stored data
        context_text = get_context_text(org)
        if not context_text:
            return jsonify({
                "error": "Bot data not available. Please recreate the bot.",
                "code": "NO_DATA"
            }), 500

        if not llm:
            return jsonify({"error": "AI service not configured"}), 500

        # Query Groq LLM directly with context (no local ML model needed)
        system_prompt = f"""You are a helpful AI assistant for the organization described below. Answer questions based ONLY on the provided information. If the answer is not in the information, say you don't have that information.

Organization Information:
{context_text}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ]
        llm_response = llm.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
        )
        response = llm_response.choices[0].message.content

        # Save chat history
        chat_entry = ChatHistory(
            organization_id=org_id,
            user_id=request.user_id if hasattr(request, 'user_id') else None,
            query=query,
            response=str(response),
            source_ip=request.remote_addr
        )
        db.session.add(chat_entry)
        
        # Update message count
        org.message_count = (org.message_count or 0) + 1
        db.session.commit()

        return jsonify({
            "response": str(response),
            "chat_id": chat_entry.id,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Error querying: {str(e)}")
        return jsonify({"error": str(e)}), 500



@app.route('/api/bot/<org_id>', methods=['DELETE'])
@jwt_required
def delete_bot(org_id):
    """Delete a chatbot"""
    try:
        org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Organization not found'}), 404
        
        # Soft delete
        org.is_deleted = True
        db.session.commit()
        
        return jsonify({'message': 'Bot deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Widget script endpoint
@app.route('/widget.js')
def widget_script():
    """Serve the embeddable widget JavaScript"""
    script = '''
(function() {
    var botId = document.currentScript.getAttribute('data-bot-id');
    var theme = document.currentScript.getAttribute('data-theme') || 'dark';
    var position = document.currentScript.getAttribute('data-position') || 'bottom-right';
    var color = document.currentScript.getAttribute('data-color') || '#8B5CF6';
    
    var container = document.createElement('div');
    container.id = 'smartbot-widget';
    container.innerHTML = `
        <style>
            #smartbot-widget { font-family: system-ui, -apple-system, sans-serif; }
            #smartbot-btn { position: fixed; ${position.includes('right') ? 'right: 20px' : 'left: 20px'}; bottom: 20px; width: 60px; height: 60px; border-radius: 50%; background: ${color}; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999; display: flex; align-items: center; justify-content: center; }
            #smartbot-btn svg { width: 28px; height: 28px; fill: white; }
            #smartbot-chat { position: fixed; ${position.includes('right') ? 'right: 20px' : 'left: 20px'}; bottom: 90px; width: 380px; height: 500px; background: ${theme === 'dark' ? '#1a1a2e' : '#fff'}; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 9999; display: none; flex-direction: column; overflow: hidden; }
            #smartbot-header { background: ${color}; color: white; padding: 16px; font-weight: 600; }
            #smartbot-messages { flex: 1; overflow-y: auto; padding: 16px; }
            #smartbot-input { display: flex; padding: 12px; border-top: 1px solid ${theme === 'dark' ? '#333' : '#eee'}; }
            #smartbot-input input { flex: 1; padding: 10px; border: 1px solid ${theme === 'dark' ? '#444' : '#ddd'}; border-radius: 8px; background: ${theme === 'dark' ? '#2a2a3e' : '#f5f5f5'}; color: ${theme === 'dark' ? '#fff' : '#000'}; }
            #smartbot-input button { margin-left: 8px; padding: 10px 16px; background: ${color}; color: white; border: none; border-radius: 8px; cursor: pointer; }
            .smartbot-msg { margin-bottom: 12px; padding: 10px 14px; border-radius: 12px; max-width: 80%; }
            .smartbot-bot { background: ${theme === 'dark' ? '#2a2a3e' : '#f0f0f0'}; color: ${theme === 'dark' ? '#fff' : '#000'}; }
            .smartbot-user { background: ${color}; color: white; margin-left: auto; }
        </style>
        <button id="smartbot-btn"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg></button>
        <div id="smartbot-chat">
            <div id="smartbot-header">SmartBot Assistant</div>
            <div id="smartbot-messages"></div>
            <div id="smartbot-input"><input type="text" placeholder="Type a message..."><button>Send</button></div>
        </div>
    `;
    document.body.appendChild(container);
    
    var btn = document.getElementById('smartbot-btn');
    var chat = document.getElementById('smartbot-chat');
    var input = chat.querySelector('input');
    var sendBtn = chat.querySelector('button');
    var messages = document.getElementById('smartbot-messages');
    
    btn.onclick = function() { chat.style.display = chat.style.display === 'none' ? 'flex' : 'none'; };
    
    function addMsg(text, isUser) {
        var div = document.createElement('div');
        div.className = 'smartbot-msg ' + (isUser ? 'smartbot-user' : 'smartbot-bot');
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
    
    function send() {
        var q = input.value.trim();
        if (!q) return;
        addMsg(q, true);
        input.value = '';
        fetch(window.location.origin + '/api/query/' + botId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q })
        }).then(r => r.json()).then(d => addMsg(d.response || d.error, false));
    }
    
    sendBtn.onclick = send;
    input.onkeypress = function(e) { if (e.key === 'Enter') send(); };
    
    addMsg('Hello! How can I help you today?', false);
})();
'''
    return script, 200, {'Content-Type': 'application/javascript'}

# ============ EXPORT/IMPORT CHATBOT ============

@app.route('/api/bot/<org_id>/export', methods=['GET'])
@jwt_required
def export_bot(org_id):
    """Export a chatbot as .smartbot JSON file"""
    try:
        org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Bot not found'}), 404
        
        export_data = {
            'version': '1.0',
            'type': 'smartbot_export',
            'exported_at': datetime.utcnow().isoformat(),
            'bot': {
                'name': org.name,
                'description': org.description,
                'mode': org.mode,
                'data': org.data,
                'location': org.location,
            }
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        print(f"Export error: {str(e)}")
        return jsonify({'error': 'Failed to export bot'}), 500

@app.route('/api/bot/import', methods=['POST'])
@jwt_required
def import_bot():
    """Import a chatbot from .smartbot JSON file"""
    try:
        data = request.get_json()
        
        if not data or data.get('type') != 'smartbot_export':
            return jsonify({'error': 'Invalid .smartbot file format'}), 400
        
        bot_data = data.get('bot', {})
        
        if not bot_data.get('name'):
            return jsonify({'error': 'Bot name is required'}), 400
        
        # Check bot limit for free tier
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found. Please login again.'}), 401
            
        if user.tier == 'free':
            bot_count = Organization.query.filter_by(user_id=request.user_id, is_deleted=False).count()
            if bot_count >= 3:
                return jsonify({'error': 'Free tier limit reached (3 bots). Delete a bot first or upgrade to Pro.'}), 403
        
        # Create new organization from imported data
        org = Organization(
            user_id=request.user_id,
            name=bot_data.get('name'),
            description=bot_data.get('description', ''),
            mode=bot_data.get('mode', 'manual'),
            data=bot_data.get('data', {}),
            location=bot_data.get('location', 'Imported')
        )
        
        db.session.add(org)
        db.session.commit()
        
        # Data is stored in org.data, no index rebuild needed
        
        return jsonify({
            'message': 'Bot imported successfully!',
            'id': org.id,
            'name': org.name
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Import error: {str(e)}")
        return jsonify({'error': 'Failed to import bot'}), 500

@app.route('/api/bot/<org_id>/chat-history', methods=['GET'])
@jwt_required
def get_chat_history(org_id):
    """Get chat history for a bot (with optional format parameter)"""
    try:
        org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Bot not found'}), 404
        
        # Get all history for this bot (user owns the bot, so can see all its history)
        history = db.session.query(ChatHistory).filter_by(organization_id=org_id).order_by(ChatHistory.timestamp.desc()).all()
        
        return jsonify({
            'bot_name': org.name,
            'total_messages': len(history),
            'history': [h.to_dict() for h in history]
        }), 200
        
    except Exception as e:
        print(f"Chat history error: {str(e)}")
        return jsonify({'error': f'Failed to get chat history: {str(e)}'}), 500

@app.route('/api/bot/<org_id>/chat-history/export', methods=['GET'])
@jwt_required
def export_chat_history(org_id):
    """Export chat history as JSON"""
    try:
        org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Bot not found'}), 404
        
        history = db.session.query(ChatHistory).filter_by(organization_id=org_id).order_by(ChatHistory.timestamp).all()
        
        export_data = {
            'version': '1.0',
            'type': 'smartbot_chat_export',
            'exported_at': datetime.utcnow().isoformat(),
            'bot_name': org.name,
            'total_messages': len(history),
            'conversations': [{
                'query': h.query,
                'response': h.response,
                'timestamp': h.timestamp.isoformat() if h.timestamp else None
            } for h in history]
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        print(f"Chat export error: {str(e)}")
        return jsonify({'error': 'Failed to export chat history'}), 500

@app.route('/api/bot/<org_id>/chat-history', methods=['DELETE'])
@jwt_required
def clear_chat_history(org_id):
    """Clear all chat history for a bot"""
    try:
        org = Organization.query.filter_by(id=org_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Bot not found'}), 404
        
        # Delete all history for this bot (user owns it)
        db.session.query(ChatHistory).filter_by(organization_id=org_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Chat history cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Clear history error: {str(e)}")
        return jsonify({'error': 'Failed to clear chat history'}), 500

@app.route('/api/chat-history/<message_id>', methods=['DELETE'])
@jwt_required
def delete_chat_message(message_id):
    """Delete a single chat message"""
    try:
        # Find the message and verify user owns the parent organization
        message = db.session.query(ChatHistory).get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Verify user owns the organization this message belongs to
        org = Organization.query.filter_by(id=message.organization_id, user_id=request.user_id).first()
        if not org:
            return jsonify({'error': 'Not authorized'}), 403
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete message error: {str(e)}")
        return jsonify({'error': 'Failed to delete message'}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5050))
    app.run(debug=True, host='0.0.0.0', port=port)
