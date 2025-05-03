import { z } from 'zod';

export const createListingSchema = z.object({
    user_id: z.string().uuid(),
    is_agent_listing: z.boolean(),
    type: z.string().min(1, 'Type is required'),
    location: z.string().min(1, 'Location is required').max(255),
    price: z.number().positive('Price must be positive'),
    area: z.number().positive('Area must be positive'),
    description: z.string().optional(),
    photos: z.array(z.string().url('Invalid URL')),
    status: z.enum(['Active', 'Archived']),
    category_id: z.string().uuid().optional(),
    tags: z.array(z.string().uuid('Invalid tag ID')),
    title: z.string().min(1, 'Title is required').max(255),
});

export const getAllFiltersSchema = z.object({
    page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
    limit: z.coerce.number().int().positive('Limit must be a positive integer').default(12),
    category: z.string().uuid('Invalid category ID').optional(),
    type: z.string().optional(),
    minPrice: z.coerce.number().positive('minPrice must be positive').optional(),
    maxPrice: z.coerce.number().positive('maxPrice must be positive').optional(),
    minArea: z.coerce.number().positive('minArea must be positive').optional(),
    maxArea: z.coerce.number().positive('maxArea must be positive').optional(),
    status: z.string().optional(),
    tags: z.string().optional(),
    location: z.string().optional(),
});

export const updateListingSchema = z.object({
    user_id: z.string().uuid('Invalid user ID').optional(),
    is_agent_listing: z.boolean().optional(),
    type: z.string().min(1, 'Type is required').optional(),
    location: z.string().min(1, 'Location is required').max(255).optional(),
    price: z.number().positive('Price must be positive').optional(),
    area: z.number().positive('Area must be positive').optional(),
    description: z.string().optional(),
    photos: z.array(z.string().url('Invalid URL')).min(1, 'At least one photo is required').optional(),
    status: z.enum(['Active', 'Archived']).optional(),
    category_id: z.string().uuid('Invalid category ID').optional(),
    tags: z.array(z.string().uuid('Invalid tag ID')).optional(),
    title: z.string().min(1, 'Title is required').max(255).optional(),
});

export type CreateListingDto = z.infer<typeof createListingSchema>;
export type GetAllFiltersDto = z.infer<typeof getAllFiltersSchema>;
export type UpdateListingDto = z.infer<typeof updateListingSchema>;
