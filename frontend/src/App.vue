<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './store/useAuthStore';

const authStore = useAuthStore();

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      await authStore.fetchUser(userId);
    } catch (error) {
      console.error('Помилка при завантаженні користувача:', error);
      localStorage.removeItem('authToken'); 
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
