import type { User } from './user';

export interface Filters {
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: string;
    tags?: string[];
}

export interface Subscription {
    id: string;
    buyer_id: string;
    filters: Filters;
    transport: Transport;
    created_at: string;
    updated_at: string;
    buyer?: User;
    notifications?: Notification[];
}

export interface CreateSubscriptionDto {
    buyer_id: string;
    filters: Filters;
    transport: Transport;
}

enum Transport {
    EMAIL = 'EMAIL',
    TELEGRAM = 'TELEGRAM',
}
