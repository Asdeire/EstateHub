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
}) => {
    const response = await api.post('/register', userData);
    return response.data;
};

export const loginUser = async (credentials: {
    email: string;
    password: string;
}) => {
    const response = await api.post('/login', credentials);
    return response.data; 
};