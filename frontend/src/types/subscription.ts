import type { User } from './user';

export type Filters = {
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: string;
    tags?: string[];
}

export type Subscription = {
    id: string;
    buyer_id: string;
    filters: Filters;
    transport: Transport;
    created_at: string;
    updated_at: string;
    buyer?: User;
    notifications?: Notification[];
}

export type CreateSubscriptionDto ={
    buyer_id: string;
    filters: Filters;
    transport: Transport;
}

enum Transport {
    EMAIL = 'EMAIL',
    TELEGRAM = 'TELEGRAM',
}
