import { z } from 'zod';

export const createSubscriptionSchema = z.object({
    filters: z.any(),
    transport: z.enum(['EMAIL', 'TELEGRAM']),
});

export const updateSubscriptionSchema = z.object({
    filters: z.any().optional(),
    transport: z.enum(['EMAIL', 'TELEGRAM']).optional(),
});
