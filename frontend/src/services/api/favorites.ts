import { api } from './config';
import { getAuthHeaders } from './authHeaders';

export const getFavorites = async () => {
    try {
        const response = await api.get('/favorites', {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user-specific favorites:', error);
        throw error;
    }
};

export const addFavorite = async (listingId: string) => {
    try {
        const currentFavorites = await getFavorites();
        const favoriteCount = Array.isArray(currentFavorites) ? currentFavorites.length : 0;

        if (favoriteCount >= 12) {
            throw new Error('Ви досягли ліміту у 12 улюблених оголошень.');
        }

        await api.post(`/favorites/${listingId}`, {}, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

export const removeFavorite = async (listingId: string) => {
    try {
        await api.delete(`/favorites/${listingId}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};
