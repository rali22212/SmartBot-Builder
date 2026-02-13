from flask import Blueprint, request, jsonify
import bcrypt
from datetime import datetime

from models import db, User, OTPCode
from middleware import generate_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user (OTP will be sent via frontend EmailJS)
        user = User(email=email, password_hash=password_hash, is_verified=False)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful! Please check your email for verification code.',
            'user_id': user.id,
            'email': email
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify email - OTP already verified on frontend via EmailJS"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Mark user as verified (OTP verification done on frontend)
        user.is_verified = True
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id, user.email)
        
        return jsonify({
            'message': 'Email verified successfully!',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Verify OTP error: {str(e)}")
        return jsonify({'error': 'Verification failed. Please try again.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_verified:
            return jsonify({'error': 'Please verify your email first', 'needs_verification': True}), 403
        
        # Generate token
        token = generate_token(user.id, user.email)
        
        return jsonify({
            'message': 'Login successful!',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed. Please try again.'}), 500

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """OTP is sent via frontend EmailJS - this is just for compatibility"""
    return jsonify({'message': 'OTP sent via EmailJS'}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Password reset OTP is sent via frontend EmailJS"""
    return jsonify({'message': 'If your email is registered, you will receive a reset code'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password - OTP already verified on frontend"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        new_password = data.get('new_password', '')
        
        if not email or not new_password:
            return jsonify({'error': 'Email and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update password (OTP verification done on frontend)
        user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.commit()
        
        return jsonify({'message': 'Password reset successful! You can now login.'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Reset password error: {str(e)}")
        return jsonify({'error': 'Password reset failed'}), 500

@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Change password for authenticated user"""
    try:
        data = request.get_json()
        token = request.headers.get('Authorization', '').split(' ')[1]
        
        from middleware import decode_token
        payload = decode_token(token)
        if 'error' in payload:
            return jsonify({'error': payload['error']}), 401
            
        user_id = payload['user_id']
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password are required'}), 400
            
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Verify current password
        if not bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Incorrect current password'}), 401
            
        # Update to new password
        user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {str(e)}")
        return jsonify({'error': 'Failed to change password'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info (requires token in header)"""
    from middleware import jwt_required
    
    @jwt_required
    def inner():
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user.to_dict()}), 200
    
    return inner()
