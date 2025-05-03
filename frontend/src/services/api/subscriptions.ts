import { api } from './config';
import type { Subscription, CreateSubscriptionDto } from '../../types/subscription';
import { getAuthHeaders } from './authHeaders';

export const getSubscriptions = async (): Promise<Subscription[]> => {
    try {
        const response = await api.get('/subscriptions', { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
    }
};

export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
    try {
        const response = await api.get(`/subscriptions/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching subscription with ID ${id}:`, error);
        throw error;
    }
};

export const createSubscription = async (subscriptionData: CreateSubscriptionDto): Promise<Subscription> => {
    try {
        const response = await api.post('/subscriptions', subscriptionData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
};

export const deleteSubscription = async (id: string): Promise<Subscription> => {
    try {
        const response = await api.delete(`/subscriptions/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error deleting subscription with ID ${id}:`, error);
        throw error;
    }
};

export const getSubscriptionsByUser = async (userId: string): Promise<Subscription[]> => {
    try {
        const response = await api.get(`/subscriptions/user/${userId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching subscriptions for user ${userId}:`, error);
        throw error;
    }
};
