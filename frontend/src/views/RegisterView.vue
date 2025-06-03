<template>
    <div class="auth-page">
        <div class="register-container">
            <div class="logo">
                <a href="/">
                    <img src="../assets/logo.png" alt="Лого">
                </a>
            </div>
            <form @submit.prevent="submitForm">
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
                        <p v-if="passwordError" class="error-text">
                            Пароль повинен містити мінімум 6 символів, в тому числі одну цифру і одну велику літеру.
                        </p>
                    </div>

                    <div class="checkbox-group">
                        <input v-model="form.isAgent" type="checkbox" id="isAgent" />
                        <label for="isAgent">Я посередник</label>
                    </div>

                    <div v-if="form.isAgent" class="form-group">
                        <label for="fopCode">ІПН або ЄДРПОУ</label>
                        <input v-model="form.fopCode" type="text" id="fopCode" required />
                    </div>

                    <button type="submit" :disabled="passwordError || isLoading">
                        {{ isLoading ? 'Завантаження...' : 'Зареєструватись' }}
                    </button>
                </div>

                <div v-if="step === 2">
                    <div class="form-group">
                        <label for="verificationCode">Код підтвердження</label>
                        <input v-model="form.verificationCode" type="text" id="verificationCode" required />
                    </div>
                    <button type="submit" :disabled="isLoading">
                        {{ isLoading ? 'Завантаження...' : 'Підтвердити' }}
                    </button>
                </div>
            </form>

            <p class="terms">Вже є аккаунт? <a href="login">Увійти</a></p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser, verifyCode } from '../services/api/index';
import Swal from 'sweetalert2';

const router = useRouter();

const form = ref({
    name: '',
    email: '',
    password: '',
    isAgent: false,
    verificationCode: '',
    fopCode: '',
});

const step = ref(1);
const isLoading = ref(false);

const passwordError = computed(() => {
    const password = form.value.password;
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return password && !regex.test(password);
});

const fopCodeError = computed(() => {
    if (!form.value.isAgent) return false;
    const code = form.value.fopCode.trim();
    return !(code.length === 8 || code.length === 10) || !/^\d+$/.test(code);
});

const submitForm = async () => {
    isLoading.value = true;

    try {
        if (step.value === 1) {
            if (form.value.isAgent && fopCodeError.value) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Невірний ІПН або ЄДРПОУ',
                    text: 'Введіть коректний ІПН (10 цифр) або ЄДРПОУ (8 цифр).',
                });
                isLoading.value = false;
                return;
            }

            await registerUser({
                name: form.value.name,
                email: form.value.email,
                password: form.value.password,
                role: form.value.isAgent ? 'Makler' : 'User',
                fopCode: form.value.isAgent ? form.value.fopCode : undefined,
            });

            Swal.fire({
                icon: 'info',
                title: 'Підтвердження',
                text: 'Код підтвердження надіслано на вашу електронну пошту.',
            });

            step.value = 2;
        } else if (step.value === 2) {
            await verifyCode({
                email: form.value.email,
                code: form.value.verificationCode,
                name: form.value.name,
                password: form.value.password,
                role: form.value.isAgent ? 'Makler' : 'User',
                fopCode: form.value.isAgent ? form.value.fopCode : undefined,
            });

            Swal.fire({
                icon: 'success',
                title: 'Успішно!',
                text: 'Ваш акаунт підтверджено. Виконайте вхід.',
            }).then(() => {
                router.push('/login');
            });
        }
    } catch (err) {
        if (err.response?.data?.message === 'Email is already in use') {
            Swal.fire({
                icon: 'error',
                title: 'Помилка',
                text: 'Ця електронна пошта вже використовується. Спробуйте іншу.',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Помилка',
                text: 'Помилка реєстрації або підтвердження коду!',
            });
        }
    } finally {
        isLoading.value = false;
    }
};
</script>
