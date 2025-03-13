import { api } from './config';
import type { User } from '../../types/user';

export const getUserById = async (userId: string): Promise<User> => {
    try {
        const response = await api.get<User>(`/user/${userId}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error fetching user with ID ${userId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
};
