<template>
    <Header />
    <div class="home-page">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">Estate Hub</h1>
            <nav>
                <ul class="flex gap-4">
                    <li><router-link to="/login" class="hover:underline">Login</router-link></li>
                    <li><router-link to="/register" class="hover:underline">Register</router-link></li>
                    <li><router-link to="/listings" class="hover:underline">Listings</router-link></li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue';
</script>