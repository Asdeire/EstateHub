import { api } from '../api';
import { setItem, getUserIdFromToken, removeItem } from '../localStorageService';

export const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Makler';
    fop_code?: string;
}) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error: any) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    }
};

export const verifyCode = async (verificationData: {
    email: string;
    code: string;
    name: string;
    password: string;
    role: 'User' | 'Makler';
    fop_code?: string;
}) => {
    const response = await api.post('/verify', verificationData);
    return response.data;
};

export const loginUser = async (credentials: {
    email: string;
    password: string;
}) => {
    const response = await api.post('/login', credentials);
    const token = response.data.token;

    setItem('authToken', token);

    const userId = getUserIdFromToken();
    if (!userId) {
        throw new Error('Не вдалося отримати ID користувача з токена');
    }

    return { userId };
};

export const requestPasswordReset = async (email: string) => {
    try {
        const response = await api.post('/password-reset', { email });
        return response.data;
    } catch (error: any) {
        console.error('Password reset request error:', error.response?.data || error.message);
        throw error;
    }
};

export const resetPassword = async (resetData: {
    email: string;
    code: string;
    newPassword: string;
}) => {
    try {
        const response = await api.post('/password-reset/confirm', resetData);
        return response.data;
    } catch (error: any) {
        console.error('Password reset error:', error.response?.data || error.message);
        throw error;
    }
};

export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const response = await api.post('/refresh', {}, {
            withCredentials: true
        });

        const accessToken = response.data.token;
        if (accessToken) {
            setItem('authToken', accessToken);
            return accessToken;
        }

        return null;
    } catch (error) {
        console.error('Refresh token failed:', error);
        removeItem('authToken');
        return null;
    }
};
