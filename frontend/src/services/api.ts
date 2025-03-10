import axios from 'axios';
import type { User } from '../types/user';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export const getListings = async () => {
    try {
        const response = await api.get('/listings');
        return response.data;
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
};

export const createListing = async (listingData: any) => {
    try {
        const response = await api.post('/listings', listingData);
        return response.data;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

export const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Makler';
}) => {
    try {
        const response = await api.post('/register', userData);
        return response.data;
    } catch (error) {
        const err = error as any;
        console.error('Помилка при реєстрації:', err.response?.data || err.message);
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

export const getListingById = async (id: string) => {
    try {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching listing with ID ${id}:`, error);
        throw error;
    }
};

export const getUserById = async (userId: string): Promise<User> => {
    try {
        const response = await api.get<User>(`/user/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching user with ID ${userId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
};

export const getFavorites = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User is not authenticated');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await api.get('/favorites', { headers });

        return response.data;
    } catch (error) {
        console.error('Error fetching user-specific favorites:', error);
        throw error;
    }
};

export const addFavorite = async (listingId: string) => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User is not authenticated');

        await api.post(`/favorites/${listingId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};


export const removeFavorite = async (listingId: string) => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User is not authenticated');

        await api.delete(`/favorites/${listingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};