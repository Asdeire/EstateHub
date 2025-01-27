export interface User {
    id: string;
    name: string;
    email: string;
    role: 'User' | 'Makler' | 'Admin';
    created_at: string;
    updated_at: string;
}