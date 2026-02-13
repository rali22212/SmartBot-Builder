from flask_mail import Mail, Message
import random
import string
from datetime import datetime, timedelta

mail = Mail()

def generate_otp():
    """Generate a 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(recipient_email, otp_code, otp_type='verify'):
    """Send OTP email to user"""
    try:
        if otp_type == 'verify':
            subject = "SmartBot Builder - Verify Your Email"
            body = f"""
Welcome to SmartBot Builder! 🤖

Your verification code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
SmartBot Builder Team
"""
        else:  # reset
            subject = "SmartBot Builder - Password Reset"
            body = f"""
Password Reset Request 🔐

Your password reset code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
SmartBot Builder Team
"""
        
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            body=body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def get_otp_expiry():
    """Get OTP expiry time (10 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=10)
