import { api } from './config';
import type { Listing, CreateListingDto } from '../../types/listing';

export const getListings = async (): Promise<Listing[]> => {
    try {
        const response = await api.get('/listings');
        return response.data;
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
};

export const createListing = async (listingData: CreateListingDto): Promise<Listing> => {
    try {
        const response = await api.post('/listings', listingData);
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

export const updateListing = async (id: string, listingData: CreateListingDto): Promise<Listing> => {
    try {
        const response = await api.put(`/listings/${id}`, listingData);
        return response.data;
    } catch (error) {
        console.error(`Error updating listing with ID ${id}:`, error);
        throw error;
    }
};

export const deleteListing = async (id: string): Promise<Listing> => {
    try {
        const response = await api.delete(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting listing with ID ${id}:`, error);
        throw error;
    }
};
