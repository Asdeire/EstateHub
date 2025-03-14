import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserById } from '../services/api/user';
import type { User } from '../types/user';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = ref<boolean>(false);

    const isTokenValid = (): boolean => {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
    };

    const fetchUser = async (userId: string) => {
        try {
            if (!userId || !isTokenValid()) {
                logout(); 
                return;
            }

            const data = await getUserById(userId);
            user.value = data;
            isAuthenticated.value = true;
        } catch (error: any) {
            console.error('Failed to fetch user:', error.message || error);
            logout(); 
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        user.value = null;
        isAuthenticated.value = false;
    };

    return { user, isAuthenticated, fetchUser, logout };
});
