export type Listing ={
    id: string;
    user_id: string;
    is_agent_listing: boolean;
    is_verified: boolean;
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
    updated_at: string;
    isFavorite: boolean;
}

export type CreateListingDto ={
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