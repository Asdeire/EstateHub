import { api } from './config';

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

        const currentFavorites = await getFavorites();
        const favoriteCount = Array.isArray(currentFavorites) ? currentFavorites.length : 0;

        if (favoriteCount >= 12) {
            throw new Error('Ви досягли ліміту у 12 улюблених оголошень.');
        }

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
