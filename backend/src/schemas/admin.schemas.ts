import { z } from 'zod';

export const idParamsSchema = z.object({
    id: z.string().uuid(),
});

export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['User', 'Makler', 'Admin']).optional(),
});

export const updateListingSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    status: z.enum(['Active', 'Archived']).optional(),
    is_agent_listing: z.boolean().optional(),
    type: z.string().optional(),
    location: z.string().optional(),
    area: z.number().optional(),
    photos: z.array(z.string()).optional(),
    category_id: z.string().uuid().optional(),
});

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
});

export const createTagSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export const updateTagSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
});