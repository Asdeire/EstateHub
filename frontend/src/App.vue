<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authDataStore';
import { getUserIdFromToken } from './services/localStorageService';
import { NConfigProvider } from 'naive-ui';
import { ukUA } from 'naive-ui';

const locale = ukUA;
const themeOverrides = {
  common: {
    primaryColor: '#07484a',
  },
};

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
    <n-config-provider :locale="locale" :theme-overrides="themeOverrides">
      <router-view />
    </n-config-provider>
  </div>
</template>

<style lang="scss">
@import './styles/main.scss';
</style>
