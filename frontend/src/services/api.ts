import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

export const getListings = async () => {
    try {
        const response = await api.get('/listings');
        return response.data;
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }
};

export const createListing = async (listingData: any) => {
    try {
        const response = await api.post('/listings', listingData);
        return response.data;
    } catch (error) {
        console.error('Error creating listing:', error);
        throw error;
    }
};

export const registerUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'User' | 'Makler';
}) => {
    try {
    const response = await api.post('/register', userData);
    return response.data;
    }
    catch(error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const verifyCode = async (verificationData: {
    email: string;
    code: string;
    name: string;
    password: string;
    role: 'User' | 'Makler';
}) => {
    const response = await api.post('/verify', verificationData);
    return response.data;
};

export const loginUser = async (credentials: {
    email: string;
    password: string;
}) => {
    const response = await api.post('/login', credentials);
    return response.data;
};

export const getListingById = async (id: string) => {
    try {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching listing with ID ${id}:`, error);
        throw error;
    }
};

export const getUserById = async (userId: string) => {
    try {
        const response = await api.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        throw error;
    }
};
