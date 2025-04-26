import { api } from './config';

export const getNotifications = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User is not authenticated');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await api.get('/notifications', { headers });

        return response.data;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        throw error;
    }
};

export const clearNotifications = async () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('User is not authenticated');
        const headers = { Authorization: `Bearer ${token}` };

        await api.delete('/notifications', { headers });
    } catch (error) {
        console.error('Error clearing user notifications:', error);
        throw error;
    }
};