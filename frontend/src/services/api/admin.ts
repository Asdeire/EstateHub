import { api } from './config';
import { getAuthHeaders } from './authHeaders';
import type { User } from '../../types/user';
import type { Listing } from '../../types/listing';
import type { Category, CreateCategoryDto } from '../../types/category';
import type { Tag } from '../../types/tag';
import type { Notification } from '../../types/notification';
import type { Subscription } from '../../types/subscription';

export const getAdminUsers = async (): Promise<User[]> => {
    const res = await api.get('/admin/users', { headers: getAuthHeaders() });
    return res.data;
};

export const updateAdminUser = async (id: string, data: Partial<User>): Promise<User> => {
    const res = await api.put(`/admin/users/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminUser = async (id: string): Promise<User> => {
    const res = await api.delete(`/admin/users/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const getAdminListings = async (): Promise<Listing[]> => {
    const res = await api.get('/admin/listings', { headers: getAuthHeaders() });
    return res.data;
};

export const updateAdminListing = async (id: string, data: Partial<Listing>): Promise<Listing> => {
    const res = await api.put(`/admin/listings/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminListing = async (id: string): Promise<Listing> => {
    const res = await api.delete(`/admin/listings/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const getAdminCategories = async (): Promise<Category[]> => {
    const res = await api.get('/admin/categories', { headers: getAuthHeaders() });
    return res.data;
};

export const createAdminCategory = async (data: CreateCategoryDto): Promise<Category> => {
    const res = await api.post('/admin/categories', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateAdminCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
    const res = await api.put(`/admin/categories/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminCategory = async (id: string): Promise<Category> => {
    const res = await api.delete(`/admin/categories/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const getAdminTags = async (): Promise<Tag[]> => {
    const res = await api.get('/admin/tags', { headers: getAuthHeaders() });
    return res.data;
};

export const createAdminTag = async (data: { name: string }): Promise<Tag> => {
    const res = await api.post('/admin/tags', data, { headers: getAuthHeaders() });
    return res.data;
};

export const updateAdminTag = async (id: string, data: { name: string }): Promise<Tag> => {
    const res = await api.put(`/admin/tags/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminTag = async (id: string): Promise<Tag> => {
    const res = await api.delete(`/admin/tags/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const getAdminSubscriptions = async (): Promise<Subscription[]> => {
    const res = await api.get('/admin/subscriptions', { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminSubscription = async (id: string): Promise<Subscription> => {
    const res = await api.delete(`/admin/subscriptions/${id}`, { headers: getAuthHeaders() });
    return res.data;
};

export const getAdminNotifications = async (): Promise<Notification[]> => {
    const res = await api.get('/admin/notifications', { headers: getAuthHeaders() });
    return res.data;
};

export const deleteAdminNotification = async (id: string): Promise<Notification> => {
    const res = await api.delete(`/admin/notifications/${id}`, { headers: getAuthHeaders() });
    return res.data;
};
