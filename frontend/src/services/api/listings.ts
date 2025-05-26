import { api } from './config';
import { getAuthHeaders } from './authHeaders';
import type { Listing, CreateListingDto } from '../../types/listing';

export const getActiveListings = async (
    page = 1,
    limit = 12,
    filters: {
        category?: string,
        type?: string,
        minPrice?: number,
        maxPrice?: number,
        minArea?: number,
        maxArea?: number,
        tags?: string[],
        search?: string,
    } = {}
): Promise<{ listings: Listing[], totalPages: number }> => {
    const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters.category && { category: filters.category }),
        ...(filters.type && { type: filters.type }),
        ...(filters.minPrice && { minPrice: String(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: String(filters.maxPrice) }),
        ...(filters.minArea && { minArea: String(filters.minArea) }),
        ...(filters.maxArea && { maxArea: String(filters.maxArea) }),
        ...(filters.tags?.length && { tags: filters.tags.join(',') }),
        ...(filters.search && { location: filters.search }),
    });

    try {
        const response = await api.get(`/listings/active?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active listings:', error);
        throw error;
    }
};

export const createListing = async (listingData: CreateListingDto): Promise<Listing> => {
    try {
        const response = await api.post('/listings', listingData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

export const getListingById = async (id: string): Promise<Listing | null> => {
    try {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching listing with ID ${id}:`, error);
        throw error;
    }
};

export const getActiveListingsByUserId = async (userId: string) => {
    const response = await api.get(`/listings/${userId}/active`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const getArchivedListingsByUserId = async (userId: string) => {
    const response = await api.get(`/listings/${userId}/archived`, {
        headers: getAuthHeaders(),
    });
    return response.data;
};

export const updateListing = async (id: string, listingData: CreateListingDto): Promise<Listing> => {
    try {
        const response = await api.put(`/listings/${id}`, listingData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating listing with ID ${id}:`, error);
        throw error;
    }
};

export const deleteListing = async (id: string): Promise<Listing> => {
    try {
        const response = await api.delete(`/listings/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting listing with ID ${id}:`, error);
        throw error;
    }
};

export const getFavoriteListings = async (user_id: string): Promise<Listing[]> => {
    try {
        const response = await api.get(`/listings/favorites/${user_id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching favorite listings for user ${user_id}:`, error);
        throw error;
    }
};