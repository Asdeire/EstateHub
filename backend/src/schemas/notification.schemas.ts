import { z } from 'zod';

export const createNotificationSchema = z.object({
    subscription_id: z.string().uuid(),
    message: z.string().min(1),
    status: z.enum(['SENT', 'DELIVERED', 'FAILED']),
});

export const updateNotificationStatusSchema = z.object({
    status: z.enum(['SENT', 'DELIVERED', 'FAILED']),
});
