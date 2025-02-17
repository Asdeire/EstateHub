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
                <img src="../assets/user-icon.png" alt="User" class="icon" />
                <img src="../assets/translate.png" alt="Logout" class="icon" />
                <img v-if="showMenuIcon" src="../assets/menu.png" alt="Menu" class="icon menu-icon"
                    @click="toggleMenu" />
            </div>
        </div>

        <nav v-if="showMenu" class="mobile-nav-links">
            <router-link to="/" class="nav-item" :class="   { active: isActive('/') }"
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

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isActive = (path) => route.path === path;

const showMenu = ref(false);
const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};
const showMenuIcon = ref(window.innerWidth <= 1000);
window.addEventListener('resize', () => {
    showMenuIcon.value = window.innerWidth <= 1000;
});
</script>