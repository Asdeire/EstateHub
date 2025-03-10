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
                <router-link to="/subscription" class="nav-item"
                    :class="{ active: isActive('/subscription') }">Підписка</router-link>
                <router-link to="/about" class="nav-item" :class="{ active: isActive('/about') }">Про нас</router-link>
            </nav>

            <div class="user-actions">
                <template v-if="authStore.isAuthenticated">
                    <div class="user-menu" @click="toggleUserMenu">
                        {{ authStore.user?.name }}
                        <ul v-if="showUserMenu" class="dropdown-menu">
                            <li><router-link to="/profile">Профіль</router-link></li>
                            <li><router-link to="/subscription">Підписка</router-link></li>
                            <li><router-link to="/favourite">Улюблені</router-link></li>
                            <li><router-link to="/mylistings">Мої оголошення</router-link></li>
                            <li @click="logout">Вийти</li>
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

const logout = () => {
    authStore.logout();
    router.push('/');
};

window.addEventListener('resize', () => {
    showMenuIcon.value = window.innerWidth <= 1000;
});
</script>