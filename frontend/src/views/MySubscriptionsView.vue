<template>
    <Header />
    <div class="subscription-container">
        <div class="my-subscriptions-header">
            <h1>Мої підписки</h1>
            <button @click="openCreateModal" class="create-button">Додати нову підписку</button>
        </div>

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else>
            <div v-if="subscriptions.length > 0" class="subscriptions-list">
                <SubscriptionCard v-for="subscription in subscriptions" :key="subscription.id"
                    :subscription="subscription" @delete="handleDeleteSubscription" />
            </div>
            <div v-else class="no-subscriptions">
                Немає підписок.
            </div>
        </div>

    </div>

    <CreateSubscription v-if="showModal" :showModal="showModal" @close="closeModal" @save="createNewSubscription" />

    <Footer />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/authDataStore';
import { getSubscriptionsByUser, createSubscription, deleteSubscription } from '../services/api/index';
import Header from '../components/Header.vue';
import CreateSubscription from '../components/subscription/CreateSubscription.vue';
import SubscriptionCard from '../components/subscription/SubscriptionCard.vue';
import Footer from '../components/Footer.vue';
import Swal from 'sweetalert2';

const authStore = useAuthStore();

const subscriptions = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);

const fetchSubscriptions = async () => {
    if (!authStore.user || !authStore.user.id) {
        console.warn('User is not ready yet');
        return;
    }
    try {
        const data = await getSubscriptionsByUser(authStore.user.id);
        subscriptions.value = data;
    } catch (err) {
        console.error('Error loading subscriptions:', err);
        error.value = 'Помилка завантаження підписок.';
    } finally {
        loading.value = false;
    }
};

const openCreateModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const createNewSubscription = async (newSubscription) => {
    try {
        subscriptions.value.push(newSubscription);
        await Swal.fire({
            icon: 'success',
            title: 'Успіх',
            text: 'Підписку успішно додано!',
        });
        closeModal();
    } catch (err) {
        console.error('Error creating subscription:', err);
        await Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Помилка при додаванні підписки.',
        });
    }
};

const handleDeleteSubscription = async (id) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Ви хочете видалити цю підписку?',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });

    if (!result.isConfirmed) return;

    try {
        await deleteSubscription(id);
        subscriptions.value = subscriptions.value.filter(sub => sub.id !== id);
        await Swal.fire({
            icon: 'success',
            title: 'Успіх',
            text: 'Підписку успішно видалено!',
        });
    } catch (err) {
        console.error("Помилка видалення підписки:", err);
        await Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Помилка при видаленні підписки.',
        });
    }
};

onMounted(() => {
    watch(
        () => authStore.user,
        (newUser) => {
            if (newUser && newUser.id) {
                fetchSubscriptions();
            }
        },
        { immediate: true }
    );
});
</script>