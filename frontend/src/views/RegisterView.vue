<template>
    <div class="register-page">
        <div class="register-container">
            <div class="logo">
                <a href="/">
                    <img src="../assets/logo.png" alt="Лого">
                </a>
            </div>
            <form @submit.prevent="submitForm">
                <!-- Інформація для реєстрації -->
                <div v-if="step === 1">
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
                        <p v-if="passwordError" class="error-text">Пароль повинен містити мінімум 6 символів, в тому
                            числі
                            одну цифру і одну велику літеру.</p>
                    </div>

                    <div class="checkbox-group">
                        <input v-model="form.isAgent" type="checkbox" id="isAgent" />
                        <label for="isAgent">Я посередник</label>
                    </div>

                    <button type="submit" :disabled="passwordError">Зареєструватись</button>
                </div>

                <!-- Крок введення коду підтвердження -->
                <div v-if="step === 2">
                    <div class="form-group">
                        <label for="verificationCode">Код підтвердження</label>
                        <input v-model="form.verificationCode" type="text" id="verificationCode" required />
                    </div>
                    <button type="submit">Підтвердити</button>
                </div>
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
import { registerUser, verifyCode } from '../services/api';

const router = useRouter();
const form = ref({
    name: '',
    email: '',
    password: '',
    isAgent: false,
    verificationCode: '', // Додали поле для коду підтвердження
});

const passwordError = computed(() => {
    const password = form.value.password;
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return password && !regex.test(password);
});

const step = ref(1); // Крок реєстрації: 1 - основна форма, 2 - форма підтвердження

const submitForm = async () => {
    try {
        if (step.value === 1) {
            // Крок 1: реєстрація
            await registerUser({
                name: form.value.name,
                email: form.value.email,
                password: form.value.password,
                role: form.value.isAgent ? 'Makler' : 'User',
            });
            console.log('Код підтвердження відправлено на пошту ' + form.value.email);
            // Переходимо на крок введення коду
            step.value = 2;
        } else if (step.value === 2) {
            // Крок 2: перевірка коду підтвердження
            await verifyCode({
                email: form.value.email,
                code: form.value.verificationCode,
                name: form.value.name,
                password: form.value.password,
                role: form.value.isAgent ? 'Makler' : 'User',
            });
            // Переходимо на сторінку входу після успішної реєстрації
            router.push('/login');
        }
    } catch (err) {
        alert('Помилка реєстрації або підтвердження коду!');
    }
};
</script>
