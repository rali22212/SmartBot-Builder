import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email for verification
 */
export const sendVerificationOTP = async (email: string, otpCode: string): Promise<boolean> => {
    try {
        // Common EmailJS template variables - adjust based on your template
        const templateParams = {
            // Try multiple common variable names that templates might use
            to_email: email,
            user_email: email,
            email: email,
            to_name: email.split('@')[0],
            from_name: 'SmartBot Builder',
            reply_to: 'noreply@smartbot.com',
            // OTP code
            otp_code: otpCode,
            otp: otpCode,
            code: otpCode,
            passcode: otpCode,
            // Message
            message: `Welcome to SmartBot Builder! 🤖

Your email verification code is:

${otpCode}

This code expires in 10 minutes.

If you didn't create an account, please ignore this email.

Best regards,
SmartBot Builder Team`,
            // Subject (if template supports it)
            subject: 'SmartBot Builder - Verify Your Email',
            title: 'Email Verification',
        };

        console.log('Sending verification email to:', email);
        console.log('Template params:', templateParams);

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('Verification email sent successfully:', response.status, response.text);
        return response.status === 200;
    } catch (error: any) {
        console.error('Failed to send verification email:', error);
        console.error('Error details:', error?.text || error?.message || error);
        return false;
    }
};

/**
 * Send OTP email for password reset
 */
export const sendPasswordResetOTP = async (email: string, otpCode: string): Promise<boolean> => {
    try {
        const templateParams = {
            to_email: email,
            user_email: email,
            email: email,
            to_name: email.split('@')[0],
            from_name: 'SmartBot Builder',
            reply_to: 'noreply@smartbot.com',
            otp_code: otpCode,
            otp: otpCode,
            code: otpCode,
            passcode: otpCode,
            message: `Password Reset Request 🔑

You requested to reset your password.

Your reset code is:

${otpCode}

This code expires in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
SmartBot Builder Team`,
            subject: 'SmartBot Builder - Password Reset Code',
            title: 'Password Reset',
        };

        console.log('Sending password reset email to:', email);

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('Password reset email sent successfully:', response.status, response.text);
        return response.status === 200;
    } catch (error: any) {
        console.error('Failed to send password reset email:', error);
        console.error('Error details:', error?.text || error?.message || error);
        return false;
    }
};

// Store OTP in sessionStorage with expiry
export const storeOTP = (email: string, code: string, type: 'verify' | 'reset'): void => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const otpData = { code, expiresAt, type };
    sessionStorage.setItem(`otp_${email}_${type}`, JSON.stringify(otpData));
};

// Verify OTP from sessionStorage
export const verifyStoredOTP = (email: string, code: string, type: 'verify' | 'reset'): boolean => {
    const stored = sessionStorage.getItem(`otp_${email}_${type}`);
    if (!stored) return false;

    try {
        const otpData = JSON.parse(stored);
        if (Date.now() > otpData.expiresAt) {
            sessionStorage.removeItem(`otp_${email}_${type}`);
            return false;
        }
        if (otpData.code === code) {
            sessionStorage.removeItem(`otp_${email}_${type}`);
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

// Clear OTP
export const clearOTP = (email: string, type: 'verify' | 'reset'): void => {
    sessionStorage.removeItem(`otp_${email}_${type}`);
};
