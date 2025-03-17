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
            <div v-if="activeListings.length > 0">
                <Listings :listings="activeListings" :goToListingDetail="goToListingDetail" :editListing="editListing"
                    :toggleListingStatus="toggleListingStatus" :deleteListing="handleDeleteListing" />
            </div>
            <div v-else>
                <div class="no-listings">Немає активних оголошень.</div>
            </div>

            <div v-if="archivedListings.length > 0">
                <h1>Архівовані оголошення</h1>
                <Listings :listings="archivedListings" :toggleListingStatus="toggleListingStatus" />
            </div>
            <div v-else>
                <div class="no-listings">Немає архівованих оголошень.</div>
            </div>

        </div>
    </div>

    <CreateListing v-if="showModal" :showModal="showModal" @close="closeModal" @save="createNewListing" />
    <EditListing v-if="showEditModal" :showEditModal="showEditModal" :listingId="currentListingId"
        @close="closeEditModal" @save="handleUpdateListing" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import { getListings, createListing, deleteListing, getListingById, updateListing } from '../services/api/index';
import Header from '../components/Header.vue';
import CreateListing from '../components/listing/CreateListing.vue';
import EditListing from '../components/listing/EditListing.vue';
import Listings from '../components/listing/ListingCard.vue';

const authStore = useAuthStore();
const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const showEditModal = ref(false);
const currentListingId = ref(null);

const activeListings = ref([]);
const archivedListings = ref([]);

const fetchMyListings = async () => {
    try {
        const data = await getListings();
        const userListings = data.filter(listing => listing.user_id === authStore.user.id);
        activeListings.value = userListings.filter(listing => listing.status === 'Active');
        archivedListings.value = userListings.filter(listing => listing.status === 'Archived');
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

const editListing = (listing) => {
    currentListingId.value = listing.id;
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    currentListing.value = null;
};

const createNewListing = async (newListing) => {
    try {
        const createdListing = await createListing({ ...newListing, user_id: authStore.user.id });
        activeListings.value.push(createdListing);
        alert("Оголошення успішно додано!");
        closeModal();
    } catch (err) {
        console.error('Error creating listing:', err);
        alert("Помилка при створенні оголошення.");
    }
};

const handleUpdateListing = async (updatedListing) => {
    try {
        await updateListing(updatedListing.id, updatedListing);

        const index = activeListings.value.findIndex(listing => listing.id === updatedListing.id);
        if (index !== -1) {
            activeListings.value[index] = { ...activeListings.value[index], ...updatedListing };
        }

        alert("Оголошення успішно оновлено!");
        closeEditModal();
    } catch (err) {
        console.error('Error updating listing:', err);
        alert("Помилка при оновленні оголошення.");
    }
};

const handleDeleteListing = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити це оголошення?")) return;

    try {
        await deleteListing(id);
        activeListings.value = activeListings.value.filter(listing => listing.id !== id);
        archivedListings.value = archivedListings.value.filter(listing => listing.id !== id);
        alert("Оголошення успішно видалено!");
    } catch (err) {
        console.error("Помилка видалення оголошення:", err);
        alert("Помилка при видаленні оголошення.");
    }
};

const toggleListingStatus = async (listing) => {
    const newStatus = listing.status === 'Active' ? 'Archived' : 'Active';
    try {
        await updateListing(listing.id, { status: newStatus });
        listing.status = newStatus;

        if (newStatus === 'Active') {
            archivedListings.value = archivedListings.value.filter(l => l.id !== listing.id);
            activeListings.value.push(listing);
        } else {
            activeListings.value = activeListings.value.filter(l => l.id !== listing.id);
            archivedListings.value.push(listing);
        }

        alert(`Оголошення успішно ${newStatus === 'Active' ? 'активовано' : 'архівовано'}!`);
    } catch (err) {
        console.error("Помилка зміни статусу:", err);
        alert("Помилка при зміні статусу оголошення.");
    }
};

onMounted(fetchMyListings);
</script>

<style scoped>
.my-listings-header {
    margin: 60px 0 30px;
    display: block;
    align-items: center;
    justify-content: center;
    align-items: center;
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

    &:hover {
        transform: translateY(-5px);
    }
}

.loading-message,
.error-message,
.no-listings {
    text-align: center;
    padding: 20px;
}
</style>