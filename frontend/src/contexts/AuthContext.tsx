import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    generateOTP,
    sendVerificationOTP,
    sendPasswordResetOTP,
    storeOTP,
    verifyStoredOTP
} from '@/services/emailService';

interface User {
    id: string;
    email: string;
    is_verified: boolean;
    tier: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needs_verification?: boolean }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    verifyOTP: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    sendOTP: (email: string, type: 'verify' | 'reset') => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5050/api`;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('smartbot_token');
        const storedUser = localStorage.getItem('smartbot_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error,
                    needs_verification: data.needs_verification
                };
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('smartbot_token', data.token);
            localStorage.setItem('smartbot_user', JSON.stringify(data.user));

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const register = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error };
            }

            // Send OTP via EmailJS
            const otpCode = generateOTP();
            storeOTP(email, otpCode, 'verify');
            const emailSent = await sendVerificationOTP(email, otpCode);

            if (!emailSent) {
                console.warn('Email sending failed, but registration succeeded');
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const verifyOTP = async (email: string, code: string) => {
        try {
            // Verify OTP locally first
            const isValid = verifyStoredOTP(email, code, 'verify');

            if (!isValid) {
                return { success: false, error: 'Invalid or expired code' };
            }

            // Call backend to mark user as verified and get token
            const response = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            // Even if backend doesn't have the OTP, we verified locally
            // So we'll try to login instead
            if (!response.ok) {
                // Try marking as verified via a special endpoint or just proceed
                const loginResult = await login(email, sessionStorage.getItem('temp_password_' + email) || '');
                if (loginResult.success) {
                    return { success: true };
                }
                return { success: false, error: data.error || 'Verification failed' };
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('smartbot_token', data.token);
            localStorage.setItem('smartbot_user', JSON.stringify(data.user));

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const sendOTP = async (email: string, type: 'verify' | 'reset') => {
        try {
            const otpCode = generateOTP();
            storeOTP(email, otpCode, type);

            let emailSent: boolean;
            if (type === 'verify') {
                emailSent = await sendVerificationOTP(email, otpCode);
            } else {
                emailSent = await sendPasswordResetOTP(email, otpCode);
            }

            if (!emailSent) {
                return { success: false, error: 'Failed to send email. Please try again.' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to send OTP' };
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            // Generate and send OTP via EmailJS
            const otpCode = generateOTP();
            storeOTP(email, otpCode, 'reset');
            const emailSent = await sendPasswordResetOTP(email, otpCode);

            if (!emailSent) {
                return { success: false, error: 'Failed to send email' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const resetPassword = async (email: string, code: string, newPassword: string) => {
        try {
            // Verify OTP locally
            const isValid = verifyStoredOTP(email, code, 'reset');

            if (!isValid) {
                return { success: false, error: 'Invalid or expired code' };
            }

            // Call backend to reset password
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, new_password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const response = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('smartbot_token');
        localStorage.removeItem('smartbot_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isAuthenticated: !!token && !!user,
            login,
            register,
            verifyOTP,
            sendOTP,
            forgotPassword,
            resetPassword,
            changePassword,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function getAuthHeader() {
    const token = localStorage.getItem('smartbot_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}
