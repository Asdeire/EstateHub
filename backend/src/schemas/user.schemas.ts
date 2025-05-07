import { z } from 'zod';

export const userIdParamSchema = z.object({
    id: z.string().uuid({ message: 'Invalid user ID format (must be UUID)' }),
});

export const updateUserBodySchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    telegram_username: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
