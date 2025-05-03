import { api } from './config';
import { getAuthHeaders } from './authHeaders';

export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications', {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        throw error;
    }
};

export const clearNotifications = async () => {
    try {
        await api.delete('/notifications', {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error clearing user notifications:', error);
        throw error;
    }
};
