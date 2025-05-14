<template>
    <Header />
    <div v-if="user" class="profile-container">
        <div v-if="loading" class="loading-message" role="status" aria-live="polite">Loading...</div>
        <div v-else-if="error" class="error-message" role="alert">{{ error }}</div>
        <div v-else class="profile-content">
            <h1 class="profile-title">Профіль користувача</h1>

            <div class="profile-info">
                <div class="user-details">
                    <img :src="userIcon" alt="Іконка користувача" class="user-icon" />
                    <div>
                        <p class="user-role">{{ user.role === 'Makler' ? 'Агент' : 'Користувач' }}</p>
                        <p class="user-name">Ім'я: {{ user.name || 'Без імені' }}</p>
                        <p class="user-email">Email: {{ user.email }}</p>
                        <p v-if="user.telegram_username" class="user-telegram">
                            Telegram: @{{ user.telegram_username }}
                        </p>
                        <p v-else class="user-telegram">Telegram не вказано</p>
                    </div>
                </div>

                <form @submit.prevent="updateProfile" class="profile-form">
                    <div class="form-group">
                        <label for="name">Ім'я</label>
                        <input id="name" v-model="form.name" type="text" placeholder="Введіть ім'я"
                            class="form-input" />
                    </div>
                    <div class="form-group">
                        <label for="telegram">Telegram Username</label>
                        <input id="telegram" v-model="form.telegram_username" type="text" placeholder="Введіть username"
                            class="form-input" />
                        <p v-if="telegramError" class="error-text">
                            Цей Telegram username вже зайнято
                        </p>
                    </div>
                    <div class="form-group">
                        <label for="password">Новий пароль</label>
                        <input id="password" v-model="form.password" type="password" placeholder="Введіть новий пароль"
                            class="form-input" />
                        <p v-if="passwordError" class="error-text">
                            Пароль має містити щонайменше 6 символів, одну велику літеру та одну цифру
                        </p>
                    </div>
                    <div v-if="form.password" class="form-group">
                        <label for="confirm-password">Підтвердження пароля</label>
                        <input id="confirm-password" v-model="form.confirmPassword" type="password"
                            placeholder="Підтвердіть пароль" class="form-input" />
                        <p v-ifRefresh="confirmPasswordError" class="error-text">
                            Паролі не збігаються
                        </p>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="save-button"
                            :disabled="passwordError || confirmPasswordError || telegramError">
                            Зберегти зміни
                        </button>
                        <button type="button" class="delete-button" @click="confirmDelete">
                            Видалити акаунт
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authDataStore';
import { getUserById, updateUser, deleteUser } from '../services/api/index';
import Header from '../components/Header.vue';
import Swal from 'sweetalert2';
import agentIcon from '../assets/agency.png';
import userIconDefault from '../assets/user-icon.png';

const router = useRouter();
const authStore = useAuthStore();

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const telegramError = ref(false);
const form = ref({
    name: '',
    telegram_username: '',
    password: '',
    confirmPassword: ''
});

const userIcon = computed(() => (user.value?.role === 'Makler' ? agentIcon : userIconDefault));

const passwordError = computed(() => {
    const password = form.value.password;
    if (!password) return false;
    const regex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return !regex.test(password);
});

const confirmPasswordError = computed(() => {
    if (!form.value.password) return false;
    return form.value.password !== form.value.confirmPassword;
});

const fetchUser = async () => {
    try {
        if (!authStore.isAuthenticated) {
            error.value = 'Будь ласка, увійдіть для перегляду профілю';
            return;
        }
        const userId = authStore.user.id;
        user.value = await getUserById(userId);
        form.value.name = user.value.name || '';
        form.value.telegram_username = user.value.telegram_username || '';
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося завантажити профіль';
    } finally {
        loading.value = false;
    }
};

const getUpdateData = () => {
    const updates = {};
    if (form.value.name !== (user.value.name || '')) updates.name = form.value.name;
    if (form.value.telegram_username !== (user.value.telegram_username || '')) updates.telegram_username = form.value.telegram_username;
    if (form.value.password) updates.password = form.value.password;
    return updates;
};

const updateProfile = async () => {
    if (form.value.password && (passwordError.value || confirmPasswordError.value)) {
        await Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Будь ласка, виправте помилки в паролі',
        });
        return;
    }

    const updateData = getUpdateData();
    if (Object.keys(updateData).length === 0) {
        await Swal.fire({
            icon: 'info',
            title: 'Без змін',
            text: 'Немає змін для збереження',
        });
        return;
    }

    try {
        telegramError.value = false;
        const userId = authStore.user.id;
        await updateUser(userId, updateData);
        user.value = await getUserById(userId);
        form.value.password = '';
        form.value.confirmPassword = '';
        await Swal.fire({
            icon: 'success',
            title: 'Успіх',
            text: 'Профіль успішно оновлено!',
        });
    } catch (err) {
        if ('telegram_username' in updateData) {
            telegramError.value = true;
        } else {
            error.value = err.response?.data?.message || 'Не вдалося оновити профіль';
        }
    }
};

const confirmDelete = async () => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Ви хочете видалити акаунт? Цю дію не можна скасувати.',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });

    if (!result.isConfirmed) {
        return;
    }

    const { value: currentPassword } = await Swal.fire({
        title: 'Підтвердження паролем',
        input: 'password',
        inputLabel: 'Введіть ваш поточний пароль для підтвердження видалення акаунту',
        inputPlaceholder: 'Введіть пароль',
        showCancelButton: true,
        confirmButtonText: 'Підтвердити',
        cancelButtonText: 'Скасувати',
        inputValidator: (value) => {
            if (!value) {
                return 'Пароль обов’язковий!';
            }
        },
    });

    if (!currentPassword) {
        await Swal.fire({
            icon: 'info',
            title: 'Скасовано',
            text: 'Підтвердження паролем скасовано',
        });
        return;
    }

    deleteAccount(currentPassword);
};

const deleteAccount = async (currentPassword) => {
    try {
        const userId = authStore.user.id;
        await deleteUser(userId, { currentPassword });
        authStore.logout();
        await Swal.fire({
            icon: 'success',
            title: 'Успіх',
            text: 'Акаунт успішно видалено',
        });
        router.push({ name: 'Home' });
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося видалити акаунт';
    }
};

onMounted(() => {
    if (authStore.user) {
        fetchUser();
    }
});

watch(() => authStore.user, (newVal) => {
    if (newVal && !user.value) {
        fetchUser();
    }
});

watch(() => form.value.telegram_username, () => {
    telegramError.value = false;
});
</script>