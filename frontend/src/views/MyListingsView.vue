<template>
    <Header />
    <div class="container">
        <div class="my-listings-header">
            <h1>Мої оголошення</h1>
            <button @click="openCreateModal" class="create-button">Додати нове оголошення</button>
        </div>

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else>
            <div v-if="listings.length > 0" class="listings-container">
                <div v-for="listing in listings" :key="listing.id" class="listing-card"
                    @click="goToListingDetail(listing.id)">
                    <img :src="listing.photos[0]" alt="Image {{ listing.title }}" class="listing-image" />
                    <div class="listing-info">
                        <h2>{{ listing.title }}</h2>
                        <p class="listing-location">{{ listing.location }}</p>
                        <h3 class="listing-price">{{ listing.price }}$</h3>
                        <button @click.stop="deleteListing(listing.id)" class="delete-button">Видалити</button>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { getListings, createListing, deleteListing as apiDeleteListing, getListingById } from '../services/api/index';
import Header from '../components/Header.vue';
import CreateListing from '../components/listing/CreateListing.vue';

const authStore = useAuthStore();
const router = useRouter();
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

const goToListingDetail = (listingId) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
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
        alert("Оголошення успішно додано!");
        closeModal();
    } catch (err) {
        console.error('Error creating listing:', err);
        alert("Помилка при створенні оголошення.");
    }
};

const deleteListing = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити це оголошення?")) return;

    try {
        const listing = await getListingById(id);
        if (!listing || !listing.photos) {
            console.error("Фото не знайдені або помилка отримання оголошення.");
            return;
        }

        const storage = getStorage();

        await Promise.all(
            listing.photos.map(async (photoUrl) => {
                const photoPath = getFirebasePathFromUrl(photoUrl);
                const photoRef = storageRef(storage, photoPath);
                try {
                    await deleteObject(photoRef);
                } catch (err) {
                    console.error(`Помилка видалення фото ${photoUrl}:`, err);
                }
            })
        );

        await apiDeleteListing(id);
        listings.value = listings.value.filter(listing => listing.id !== id);
        alert("Оголошення успішно видалено!");
    } catch (err) {
        console.error("Помилка видалення оголошення:", err);
        alert("Помилка при видаленні оголошення.");
    }
};

const getFirebasePathFromUrl = (url) => {
    try {
        const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/`;
        if (!url.startsWith(baseUrl)) return null;

        const decodedPath = decodeURIComponent(url.split(baseUrl)[1].split("?")[0]);
        return decodedPath;
    } catch (error) {
        console.error("Помилка обробки URL:", error);
        return null;
    }
};

onMounted(fetchMyListings);
</script>

<style scoped>
.my-listings-header {
    margin-top: 60px;
    display: block;
    align-items: center;
    text-align: center;
    justify-content: center;
    align-items: center;
}

.listings-container {
    margin-top: 40px;

    .listing-card {
        height: 550px;
    }
}


.create-button {
    background: none;
    border: #07484A 3px dashed;
    color: #07484A;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: translateY(-5px);
    }
}

.delete-button {
    background-color: darkred;
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