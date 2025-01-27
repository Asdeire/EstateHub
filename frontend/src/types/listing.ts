export interface Listing {
    id: string;
    user_id: string;
    is_agent_listing: boolean;
    type: string;
    location: string;
    price: number;
    area: number;
    description?: string;
    status: 'Active' | 'Archived';
    created_at: string;
    updated_at: string;
}
