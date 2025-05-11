export type Category = {
    id: string;
    name: string;
    description?: string;
    listings_count: number;
    created_at: string;
}

export type CreateCategoryDto ={
    name: string;
    description?: string;
}
