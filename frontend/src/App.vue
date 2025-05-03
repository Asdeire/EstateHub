<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { getUserIdFromToken } from './services/localStorageService';

const authStore = useAuthStore();

onMounted(async () => {
  const userId: string | null = getUserIdFromToken();
  if (userId) {
    try {
      await authStore.fetchUser(userId);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
});
</script>

<template>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import './styles/main.scss';
</style>
