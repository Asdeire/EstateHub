<template>
    <header :class="['navbar', { transparent: !isScrolled, scrolled: isScrolled }]">
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
                    <div class="user-menu" ref="userMenuRef" @click="toggleUserMenu">
                        {{ authStore.user?.name }}
                        <img v-if="authStore.user?.role === 'Makler'" src="../assets/verify.png" alt="Agent"
                            class="agent-icon" />
                        <ul v-if="showUserMenu" class="dropdown-menu">
                            <li class="nav-item" @click="goTo('/profile')">Профіль</li>
                            <li class="nav-item" @click="goTo('/notifications')">Повідомлення</li>
                            <li class="nav-item" @click="goTo('/favourites')">Улюблені</li>
                            <li class="nav-item" @click="goTo('/mylistings')">Мої оголошення</li>
                            <li v-if="authStore.isAdmin" class="nav-item" @click="goTo('/admin')">Адмін-панель</li>
                            <li class="nav-item logout-item" @click="logout">Вийти</li>
                        </ul>
                    </div>
                </template>

                <template v-else>
                    <router-link to="/login">
                        <img src="../assets/user-icon.png" alt="User" class="icon" />
                    </router-link>
                </template>

                <img v-if="showMenuIcon" src="../assets/menu.png" alt="Menu" class="icon menu-icon"
                    @click="toggleMenu" />
            </div>
        </div>

        <nav v-if="showMenu" class="mobile-nav-links" ref="mobileMenuRef">
            <router-link to="/" class="nav-item" :class="{ active: isActive('/') }"
                @click="toggleMenu">Головна</router-link>
            <router-link to="/listings" class="nav-item" :class="{ active: isActive('/listings') }"
                @click="toggleMenu">Оголошення</router-link>
            <router-link to="/mysubscriptions" class="nav-item" :class="{ active: isActive('/subscription') }"
                @click="toggleMenu">Підписка</router-link>
            <router-link to="/about" class="nav-item" :class="{ active: isActive('/about') }" @click="toggleMenu">Про
                нас</router-link>
        </nav>
    </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authDataStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isActive = (path: string) => route.path === path;

const showMenu = ref(false);
const showMenuIcon = ref(window.innerWidth <= 1000);
const showUserMenu = ref(false);

const userMenuRef = ref<HTMLElement | null>(null);
const mobileMenuRef = ref<HTMLElement | null>(null);

const isScrolled = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', () => {
        showMenuIcon.value = window.innerWidth <= 1000;
    });
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll);
});


const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
};

const goTo = (path: string): void => {
    router.push(path);
    showUserMenu.value = false;
    showMenu.value = false;
};

const logout = () => {
    authStore.logout();
    router.push('/');
};

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.closest('.menu-icon')) return;

    if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(target)) {
        showUserMenu.value = false;
    }

    if (showMenu.value && mobileMenuRef.value && !mobileMenuRef.value.contains(target)) {
        showMenu.value = false;
    }
};


onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', () => {
        showMenuIcon.value = window.innerWidth <= 1000;
    });
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
