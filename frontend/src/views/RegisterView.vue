<template>
    <div class="register-page">
        <h1>Register</h1>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input v-model="form.name" type="text" id="name" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input v-model="form.email" type="email" id="email" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input v-model="form.password" type="password" id="password" required />
            </div>

            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input v-model="form.confirmPassword" type="password" id="confirmPassword" required />
            </div>

            <button type="submit">Register</button>
        </form>

        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/api';

const router = useRouter();

const form = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
});

const error = ref<string | null>(null);

const submitForm = async () => {
    if (form.value.password !== form.value.confirmPassword) {
        error.value = 'Passwords do not match';
        return;
    }

    try {
        await registerUser({
            name: form.value.name,
            email: form.value.email,
            password: form.value.password,
        });

        error.value = null;
        router.push('/login'); 
    } catch (err: any) {
        error.value = err.response?.data?.message || 'Registration failed';
    }
};
</script>

<style scoped>
.register-page {
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