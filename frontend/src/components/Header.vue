<template>
    <header class="navbar">
        <div class="navbar-container">
            <router-link to="/" class="logo-link">
                <img src="../assets/logo.png" alt="EstateHub" class="logo" />
            </router-link>

            <nav class="nav-links">
                <router-link to="/" class="nav-item" :class="{ active: isActive('/') }">Головна</router-link>
                <router-link to="/listings" class="nav-item"
                    :class="{ active: isActive('/listings') }">Оголошення</router-link>
                <router-link to="/mysubscriptions" class="nav-item"
                    :class="{ active: isActive('/mysubscriptions') }">Підписка</router-link>
                <router-link to="/about" class="nav-item" :class="{ active: isActive('/about') }">Про нас</router-link>
            </nav>

            <div class="user-actions">
                <template v-if="authStore.isAuthenticated">
                    <div class="user-menu" @click="toggleUserMenu">
                        {{ authStore.user?.name }}
                        <ul v-if="showUserMenu" class="dropdown-menu">
                            <li class="nav-item" @click="goTo('/profile')">Профіль</li>
                            <li class="nav-item" @click="goTo('/notifications')">Повідомлення</li>
                            <li class="nav-item" @click="goTo('/favourites')">Улюблені</li>
                            <li class="nav-item" @click="goTo('/mylistings')">Мої оголошення</li>
                            <li class="nav-item logout-item" @click="logout">Вийти</li>
                        </ul>
                    </div>
                </template>

                <template v-else>
                    <router-link to="/login">
                        <img src="../assets/user-icon.png" alt="User" class="icon" />
                    </router-link>
                </template>

                <img src="../assets/translate.png" alt="Translate" class="icon" />

                <img v-if="showMenuIcon" src="../assets/menu.png" alt="Menu" class="icon menu-icon"
                    @click="toggleMenu" />
            </div>
        </div>

        <nav v-if="showMenu" class="mobile-nav-links">
            <router-link to="/" class="nav-item" :class="{ active: isActive('/') }"
                @click="toggleMenu">Головна</router-link>
            <router-link to="/listings" class="nav-item" :class="{ active: isActive('/listings') }"
                @click="toggleMenu">Оголошення</router-link>
            <router-link to="/subscription" class="nav-item" :class="{ active: isActive('/subscription') }"
                @click="toggleMenu">Підписка</router-link>
            <router-link to="/about" class="nav-item" :class="{ active: isActive('/about') }" @click="toggleMenu">Про
                нас</router-link>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isActive = (path: string) => route.path === path;

const showMenu = ref(false);
const showMenuIcon = ref(window.innerWidth <= 1000);
const showUserMenu = ref(false);

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
};

const goTo = (path: string): void => {
    router.push(path);
};

const logout = () => {
    authStore.logout();
    router.push('/');
};

window.addEventListener('resize', () => {
    showMenuIcon.value = window.innerWidth <= 1000;
});
</script>