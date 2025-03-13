import { api } from '../api';

export const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Makler';
}) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error: any) {
        console.error('Помилка при реєстрації:', error.response?.data || error.message);
        throw error;
    }
};

export const verifyCode = async (verificationData: {
    email: string;
    code: string;
    name: string;
    password: string;
    role: 'User' | 'Makler';
}) => {
    const response = await api.post('/verify', verificationData);
    return response.data;
};

export const loginUser = async (credentials: {
    email: string;
    password: string;
}) => {
    const response = await api.post('/login', credentials);
    return response.data;
};
