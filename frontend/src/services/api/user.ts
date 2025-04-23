import { api } from './config';

export const getUserById = async (id: string) => {
    try {
        const response = await api.get(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
    }
};

export const updateUser = async (
    id: string,
    data: {
        name?: string;
        email?: string;
        password?: string;
        telegram_username?: string;
    }
) => {
    try {
        const response = await api.put(`/user/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating user with ID ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id: string) => {
    try {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error);
        throw error;
    }
};
