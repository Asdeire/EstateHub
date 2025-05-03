import { getItem } from '../localStorageService';

export const getAuthHeaders = () => {
    const token = getItem('authToken') || localStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated');
    return { Authorization: `Bearer ${token}` };
};
