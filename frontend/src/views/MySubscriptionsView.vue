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
            <div v-if="subscriptions.length > 0">
                <SubscriptionCard v-for="subscription in subscriptions" :key="subscription.id"
                    :subscription="subscription" @delete="handleDeleteSubscription" />

            </div>
            <div v-else>
                <div class="no-subscriptions">Немає підписок.</div>
            </div>
        </div>
    </div>

    <CreateSubscription v-if="showModal" :showModal="showModal" @close="closeModal" @save="createNewSubscription" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/useAuthStore';
import { getSubscriptionsByUser, createSubscription, deleteSubscription } from '../services/api/index';
import Header from '../components/Header.vue';
import CreateSubscription from '../components/subscription/CreateSubscription.vue';
import SubscriptionCard from '../components/subscription/SubscriptionCard.vue';

const authStore = useAuthStore();

const subscriptions = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);

const fetchSubscriptions = async () => {
    try {
        const data = await getSubscriptionsByUser(authStore.user.id);
        console.log('Fetched subscriptions:', data);
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
        alert("Підписку успішно додано!");
        closeModal();
    } catch (err) {
        console.error('Error creating subscription:', err);
        alert("Помилка при додаванні підписки.");
    }
};

const handleDeleteSubscription = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цю підписку?")) return;

    try {
        await deleteSubscription(id);
        subscriptions.value = subscriptions.value.filter(sub => sub.id !== id);
        alert("Підписку успішно видалено!");
    } catch (err) {
        console.error("Помилка видалення підписки:", err);
        alert("Помилка при видаленні підписки.");
    }
};

onMounted(fetchSubscriptions);
</script>

<style scoped>
.subscription-container{
    min-height: 90vh;
}
.my-subscriptions-header {
    margin: 60px 0 30px;
    display: block;
    text-align: center;
}

h1 {
    text-align: center;
}

.create-button {
    background: none;
    border: #07484A 3px dashed;
    color: #07484A;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
    margin-top: 20px;
    padding: 10px 20px;

    &:hover {
        transform: translateY(-5px);
    }
}

.loading-message,
.error-message,
.no-subscriptions {
    text-align: center;
    padding: 20px;
}
</style>