<template>
    <Header />
    <div v-if="authStore.isAuthenticated" class="notifications-container">
        <div v-if="loading" class="loading-message" role="status" aria-live="polite">Завантаження...</div>
        <div v-else-if="error" class="error-message" role="alert">{{ error }}</div>
        <div v-else class="notifications-content">
            <h1 class="notifications-title">Повідомлення</h1>
            <div class="table-container">
                <table class="notifications-table">
                    <thead>
                        <tr>
                            <th>Повідомлення</th>
                            <th>Підписка</th>
                            <th>Статус</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="notification in notifications" :key="notification.id">
                            <td>{{ notification.message }}</td>
                            <td>{{ subscriptionDisplay(notification.subscription) }}</td>
                            <td>{{ statusDisplay(notification.status) }}</td>
                            <td>{{ formatDate(notification.created_at) }}</td>
                        </tr>
                        <tr v-if="notifications.length === 0">
                            <td colspan="4" class="no-notifications">Немає повідомлень</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="actions">
                <button class="clear-button" @click="clearAllNotifications" :disabled="notifications.length === 0">
                    Очистити
                </button>
            </div>
        </div>
    </div>
    <div v-else class="error-message" role="alert">Будь ласка, увійдіть для перегляду повідомлень</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { getNotifications, clearNotifications } from '../services/api/index';
import Header from '../components/Header.vue';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const notifications = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchNotifications = async () => {
    try {
        loading.value = true;
        error.value = null;
        notifications.value = await getNotifications();
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося завантажити повідомлення';
    } finally {
        loading.value = false;
    }
};

const clearAllNotifications = async () => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Ви хочете очистити всі повідомлення? Цю дію не можна скасувати.',
        showCancelButton: true,
        confirmButtonText: 'Так, очистити',
        cancelButtonText: 'Скасувати',
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        await clearNotifications();
        notifications.value = [];
        await Swal.fire({
            icon: 'success',
            title: 'Успіх',
            text: 'Усі повідомлення успішно очищено',
        });
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося очистити повідомлення';
    }
};

const statusDisplay = (status) => {
    switch (status) {
        case 'SENT':
            return 'Відправлено';
        case 'DELIVERED':
            return 'Доставлено';
        case 'FAILED':
            return 'Помилка';
        default:
            return status;
    }
};

const subscriptionDisplay = (subscription) => {
    if (!subscription) return 'Н/Д';
    const { filters, transport } = subscription;
    let filterSummary = '';
    if (filters) {
        if (filters.location) filterSummary += `Місце: ${filters.location}`;
        if (filters.minPrice || filters.maxPrice) {
            filterSummary += filterSummary ? ', ' : '';
            filterSummary += `Ціна: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'} грн`;
        }
    }
    const transportText = transport === 'EMAIL' ? 'Email' : 'Telegram';
    return filterSummary ? `${filterSummary} (${transportText})` : transportText;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

onMounted(() => {
    if (authStore.isAuthenticated) {
        fetchNotifications();
    }
});
</script>