<template>
    <div class="register-page">
        <div class="register-container">
            <div class="logo">
                <a href="/">
                    <img src="../assets/logo.png" alt="Лого">
                </a>
            </div>
            <form @submit.prevent="submitForm">
                <div class="form-group">    
                    <label for="name">Ім'я</label>
                    <input v-model="form.name" type="text" id="name" required />
                </div>

                <div class="form-group">
                    <label for="email">Електронна пошта</label>
                    <input v-model="form.email" type="email" id="email" required />
                </div>

                <div class="form-group">
                    <label for="password">Пароль</label>
                    <input v-model="form.password" type="password" id="password" required />
                    <p v-if="passwordError" class="error-text">Пароль повинен містити мінімум 6 символів, в тому числі
                        одну цифру і одну велику літеру.</p>
                </div>

                <div class="form-group checkbox-group">
                    <input v-model="form.isAgent" type="checkbox" id="isAgent" />
                    <label for="isAgent">Я посередник</label>
                </div>

                <button type="submit" :disabled="passwordError">Зареєструватись</button>
            </form>

            <p class="terms">Вже є аккаунт? <a href="login">Увійти</a></p>

        </div>
        <div class="translate-button">
            <img src="../assets/translate.png" alt="Лого">
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/api';

const router = useRouter();
const form = ref({
    name: '',
    email: '',
    password: '',
    isAgent: false,
});

const passwordError = computed(() => {
    const password = form.value.password;
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return password && !regex.test(password);
});

const submitForm = async () => {
    try {
        await registerUser({
            name: form.value.name,
            email: form.value.email,
            password: form.value.password,
            role: form.value.isAgent ? 'Makler' : 'User',
        });
        router.push('/login');
    } catch (err) {
        alert('Помилка реєстрації!');
    }
};
</script>