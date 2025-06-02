import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserById } from '../services/api/user';
import type { User } from '../types/user';
import { refreshAccessToken } from '../services/api/index';
import { api } from '../services/api/index';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const isAuthenticated = ref<boolean>(false);

    const isAdmin = computed(() => user.value?.role === 'Admin');

    const isTokenValid = (): boolean => {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
    };

    const fetchUser = async (userId: string) => {
        try {
            if (!userId) {
                logout();
                return;
            }

            let tokenToUse = localStorage.getItem('authToken');

            if (!isTokenValid()) {
                const newToken = await refreshAccessToken();
                if (!newToken) {
                    logout();
                    return;
                }

                tokenToUse = newToken;
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${tokenToUse}`;

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

    return { user, isAuthenticated, fetchUser, logout, isAdmin };
});
