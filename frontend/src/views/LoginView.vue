<template>
    <div class="login-page">
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

                <button type="submit">Увійти</button>
            </form>
            <p class="terms">Якщо ви ще не маєте аккаунту <a href="register">зареєструйтесь</a></p>

            <p v-if="error" class="error-text">{{ error }}</p>
        </div>
        <div class="translate-button">
            <img src="../assets/translate.png" alt="Лого">
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../services/api';

const router = useRouter();

const form = ref({
    email: '',
    password: '',
});

const error = ref<string | null>(null);

const submitForm = async () => {
    try {
        const response = await loginUser({
            email: form.value.email,
            password: form.value.password,
        });

        localStorage.setItem('authToken', response.token);

        error.value = null; 
        router.push('/listings');
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Помилка входу';
    }
};
</script>