from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    tier = db.Column(db.String(20), default='free')  # free, pro
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    organizations = db.relationship('Organization', backref='owner', lazy=True, cascade='all, delete-orphan')
    otp_codes = db.relationship('OTPCode', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_verified': self.is_verified,
            'tier': self.tier,
            'created_at': self.created_at.isoformat()
        }

class OTPCode(db.Model):
    __tablename__ = 'otp_codes'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    otp_type = db.Column(db.String(20), nullable=False)  # verify, reset
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Organization(db.Model):
    __tablename__ = 'organizations'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    mode = db.Column(db.String(20), nullable=False)  # automatic, manual
    data = db.Column(db.JSON)  # Stores PDF name or manual org data
    message_count = db.Column(db.Integer, default=0)
    location = db.Column(db.String(100), default='Global')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationships
    chat_history = db.relationship('ChatHistory', backref='organization', lazy=True, cascade='all, delete-orphan')
    widget_config = db.relationship('WidgetConfig', backref='organization', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'mode': self.mode,
            'data': self.data,
            'message_count': self.message_count,
            'location': self.location,
            'created_at': self.created_at.isoformat()
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey('organizations.id'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)  # Nullable for widget users
    query = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    source_ip = db.Column(db.String(45))  # For widget tracking
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'query': self.query,
            'response': self.response,
            'timestamp': self.timestamp.isoformat()
        }

class WidgetConfig(db.Model):
    __tablename__ = 'widget_configs'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey('organizations.id'), nullable=False, unique=True)
    theme = db.Column(db.String(20), default='dark')  # dark, light
    position = db.Column(db.String(20), default='bottom-right')
    welcome_message = db.Column(db.String(500), default='Hello! How can I help you today?')
    primary_color = db.Column(db.String(7), default='#8B5CF6')  # Hex color
    
    def to_dict(self):
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'theme': self.theme,
            'position': self.position,
            'welcome_message': self.welcome_message,
            'primary_color': self.primary_color
        }
