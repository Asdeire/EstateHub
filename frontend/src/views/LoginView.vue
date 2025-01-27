<template>
    <div class="login-page">
        <h1>Login</h1>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input v-model="form.email" type="email" id="email" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input v-model="form.password" type="password" id="password" required />
            </div>

            <button type="submit">Login</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>
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

        // Збереження токена у localStorage
        localStorage.setItem('authToken', response.token);

        error.value = null;
        router.push('/'); // Перенаправлення на головну сторінку після успішного входу
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Login failed';
    }
};
</script>

<style scoped>
.login-page {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>