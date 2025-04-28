export interface Listing {
    id: string;
    user_id: string;
    is_agent_listing: boolean;
    type: string;
    location: string;
    price: number;
    area: number;
    description?: string;
    photos: string[];
    status: 'Active' | 'Archived';
    category_id?: string;
    tags: string[];
    title: string;
    created_at: string;
}

export interface CreateListingDto {
    user_id: string;
    is_agent_listing: boolean;
    type: string;
    location: string;
    price: number;
    area: number;
    description?: string;
    photos: string[];
    status: 'Active' | 'Archived';
    category_id?: string;
    tags: string[];
    title: string;
}