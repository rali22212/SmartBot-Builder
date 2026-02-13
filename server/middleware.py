from functools import wraps
from flask import request, jsonify
import jwt
import os
import datetime

# Use a consistent JWT secret - hardcoded fallback for development
JWT_SECRET = os.getenv('JWT_SECRET', 'smartbot-secret-key-2024')

def get_token_from_header():
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        print("JWT Error: Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"JWT Error: Invalid token - {str(e)}")
        return None

def jwt_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        
        if not token:
            return jsonify({'error': 'Authorization token is missing', 'code': 'TOKEN_MISSING'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token. Please login again.', 'code': 'TOKEN_INVALID'}), 401
        
        # Add user info to request context
        request.user_id = payload.get('user_id')
        request.user_email = payload.get('email')
        
        return f(*args, **kwargs)
    return decorated

def jwt_optional(f):
    """Decorator for routes where auth is optional (e.g., widget queries)"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_header()
        
        if token:
            payload = decode_token(token)
            if payload:
                request.user_id = payload.get('user_id')
                request.user_email = payload.get('email')
            else:
                request.user_id = None
                request.user_email = None
        else:
            request.user_id = None
            request.user_email = None
        
        return f(*args, **kwargs)
    return decorated

def generate_token(user_id, email):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')
