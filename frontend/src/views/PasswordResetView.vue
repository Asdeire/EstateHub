<template>
    <div class="auth-page">
        <div class="password-reset-container">
            <div class="logo">
                <a href="/">
                    <img src="../assets/logo.png" alt="Лого">
                </a>
            </div>
            <form @submit.prevent="submitForm">
                <div v-if="step === 1">
                    <div class="form-group">
                        <label for="email">Електронна пошта</label>
                        <input v-model="form.email" type="email" id="email" required />
                    </div>
                    <button type="submit" :disabled="isLoading">
                        {{ isLoading ? 'Завантаження...' : 'Відправити код для скидання паролю' }}
                    </button>

                </div>

                <div v-if="step === 2">
                    <div class="form-group">
                        <label for="verificationCode">Код підтвердження</label>
                        <input v-model="form.verificationCode" type="text" id="verificationCode" required />
                    </div>
                    <div class="form-group">
                        <label for="newPassword">Новий пароль</label>
                        <input v-model="form.newPassword" type="password" id="newPassword" required />
                        <p v-if="passwordError" class="error-text">Пароль повинен містити мінімум 6 символів, в тому
                            числі
                            одну цифру і одну велику літеру.</p>
                    </div>
                    <button type="submit" :disabled="passwordError || isLoading">
                        {{ isLoading ? 'Завантаження...' : 'Змінити пароль' }}
                    </button>
                </div>
            </form>

            <p class="terms">Пам'ятаєте пароль? <a href="login">Увійти</a></p>
        </div>
        <div class="translate-button">
            <img src="../assets/translate.png" alt="Лого">
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { requestPasswordReset, resetPassword } from '../services/api/index';
import Swal from 'sweetalert2';

const router = useRouter();
const form = ref({
    email: '',
    verificationCode: '',
    newPassword: '',
});

const passwordError = computed(() => {
    const password = form.value.newPassword;
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return password && !regex.test(password);
});

const step = ref(1);
const isLoading = ref(false);

const submitForm = async () => {
    isLoading.value = true;
    try {
        if (step.value === 1) {
            await requestPasswordReset(form.value.email);
            Swal.fire({
                icon: 'info',
                title: 'Код для скидання паролю',
                text: 'Код підтвердження надіслано на вашу електронну пошту.',
            });
            step.value = 2;
        } else if (step.value === 2) {
            await resetPassword({
                email: form.value.email,
                code: form.value.verificationCode,
                newPassword: form.value.newPassword,
            });
            Swal.fire({
                icon: 'success',
                title: 'Пароль успішно змінено!',
                text: 'Виконайте вхід за новим паролем.',
            }).then(() => {
                router.push('/login');
            });
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: err.response?.data?.message || 'Помилка скидання паролю!',
        });
    } finally {
        isLoading.value = false;
    }
};
</script>
