<template>
    <div class="auth-page">
        <div class="login-container">
            <div class="logo">
                <a href="/">
                    <img src="../assets/logo.png" alt="Лого">
                </a>
            </div>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="email">Електронна пошта</label>
                    <input v-model="form.email" type="email" id="email" required />
                </div>

                <div class="form-group">
                    <label for="password">Пароль</label>
                    <input v-model="form.password" type="password" id="password" required />
                </div>

                <button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Завантаження...' : 'Увійти' }}
                </button>

            </form>
            <p class="terms">Якщо ви ще не маєте аккаунту <a href="register">зареєструйтесь</a><br>Забули пароль? <a
                    href="password-reset">Скинути</a></p>

            <p v-if="error" class="error-text">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../services/api/index';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    email: '',
    password: '',
});

const error = ref<string | null>(null);

const isLoading = ref(false);

const submitForm = async () => {
    isLoading.value = true;
    try {
        const { userId } = await loginUser(form.value);
        await authStore.fetchUser(userId);
        error.value = null;
        router.push('/');
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Помилка входу';
    } finally {
        isLoading.value = false;
    }
};

</script>