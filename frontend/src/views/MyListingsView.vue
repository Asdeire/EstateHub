<template>
    <Header />
    <div class="container">
        <div class="my-listings-header">
            <h1>Мої оголошення</h1>
            <button @click="openCreateModal">Додати нове оголошення</button>
        </div>

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else>
            <div v-if="listings.length > 0" class="listings-container">
                <div v-for="listing in listings" :key="listing.id" class="listing-card">
                    <img :src="listing.photos[0]" alt="Image {{ listing.title }}" class="listing-image" />
                    <div class="listing-info">
                        <h2>{{ listing.title }}</h2>
                        <p class="listing-location">{{ listing.location }}</p>
                        <h3 class="listing-price">{{ listing.price }}$</h3>
                        <button @click="deleteListing(listing.id)" class="delete-button">Видалити</button>
                    </div>
                </div>
            </div>
            <div v-else class="no-listings">Немає ваших оголошень.</div>
        </div>
    </div>

    <CreateListing v-if="showModal" :showModal="showModal" @close="closeModal" @save="createNewListing" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/useAuthStore';
import { getListings, createListing, deleteListing as apiDeleteListing } from '../services/api/index';
import Header from '../components/Header.vue';
import CreateListing from '../components/listing/CreateListing.vue';

const authStore = useAuthStore();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);

const fetchMyListings = async () => {
    try {
        const data = await getListings();
        listings.value = data.filter(listing => listing.user_id === authStore.user.id);
    } catch (err) {
        console.error('Error loading listings:', err);
        error.value = 'Помилка завантаження оголошень.';
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

const createNewListing = async (newListing) => {
    try {
        const createdListing = await createListing({ ...newListing, user_id: authStore.user.id });
        listings.value.push(createdListing);
        closeModal();
    } catch (err) {
        console.error('Error creating listing:', err);
    }
};

const deleteListing = async (id) => {
    try {
        await apiDeleteListing(id);
        listings.value = listings.value.filter(listing => listing.id !== id);
    } catch (err) {
        console.error('Error deleting listing:', err);
    }
};

onMounted(fetchMyListings);
</script>

<style scoped>
.container {
    padding: 20px;
}

.my-listings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.listings-container {
    display: grid;
    gap: 20px;
}

.listing-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
}

.listing-image {
    width: 150px;
    height: 150px;
    object-fit: cover;
}

.listing-info {
    padding: 15px;
}

.delete-button {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
}

.delete-button:hover {
    background-color: #ff1a1a;
}

.loading-message,
.error-message,
.no-listings {
    text-align: center;
    padding: 20px;
}
</style>