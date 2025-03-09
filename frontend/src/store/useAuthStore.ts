import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserById } from '../services/api';
import type { User } from '../types/user';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = ref<boolean>(false);;

    const fetchUser = async (userId: string) => {
        try {
            if (!userId) throw new Error('User ID is required');

            const data = await getUserById(userId);
            user.value = data;
            isAuthenticated.value = true;
        } catch (error: any) {
            console.error('Failed to fetch user:', error.message || error);
            user.value = null;
            isAuthenticated.value = false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        user.value = null;
        isAuthenticated.value = false;
    };

    return { user, isAuthenticated, fetchUser, logout };
});
