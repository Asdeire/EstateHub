<template>
    <Header />
    <div class="my-listings-container">
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
            <div v-if="archivedListings.length > 0">
                <h1>Архівовані оголошення</h1>
                <Listings :listings="archivedListings" :toggleListingStatus="toggleListingStatus" />
            </div>
            <div v-else-if="activeListings.length === 0 && archivedListings.length === 0">
                <div class="no-listings">Немає оголошень.</div>
            </div>
        </div>
    </div>
    <Footer />

    <CreateListing v-if="showModal" :showModal="showModal" @close="closeModal" @save="createNewListing" />
    <EditListing v-if="showEditModal" :showEditModal="showEditModal" :listing="currentListing" @close="closeEditModal"
        @save="handleUpdateListing" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authDataStore';
import { getListingsByUserId, createListing, deleteListing, getListingById, updateListing } from '../services/api/index'; // імпортуємо новий метод
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import CreateListing from '../components/listing/CreateListing.vue';
import EditListing from '../components/listing/EditListing.vue';
import Listings from '../components/listing/ListingCard.vue';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const showEditModal = ref(false);
const currentListing = ref(null);

const activeListings = ref([]);
const archivedListings = ref([]);

const fetchMyListings = async () => {
    try {
        const data = await getListingsByUserId(authStore.user.id);
        activeListings.value = data.filter(listing => listing.status === 'Active');
        archivedListings.value = data.filter(listing => listing.status === 'Archived');
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

const editListing = async (listing) => {
    try {
        const listingData = await getListingById(listing.id);
        currentListing.value = listingData;
        showEditModal.value = true;
    } catch (err) {
        console.error('Error loading listing data:', err);
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Не вдалося завантажити дані оголошення.',
        });
    }
};

const closeEditModal = () => {
    showEditModal.value = false;
    currentListing.value = null;
};

const handleUpdateListing = async (updatedListing) => {
    try {
        const index = activeListings.value.findIndex(listing => listing.id === updatedListing.id);
        if (index !== -1) {
            activeListings.value[index] = { ...activeListings.value[index], ...updatedListing };
        }

        await Swal.fire({
            icon: 'success',
            title: 'Оновлено!',
            text: 'Оголошення успішно оновлено!',
        });

        closeEditModal();
    } catch (err) {
        console.error('Error updating listing:', err);
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Не вдалося оновити оголошення.',
        });
    }
};

const createNewListing = async (newListing) => {
    try {
        activeListings.value.push(newListing);

        await Swal.fire({
            icon: 'success',
            title: 'Додано!',
            text: 'Оголошення успішно додано!',
        });

        closeModal();
    } catch (err) {
        console.error('Error in createNewListing:', err);
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Помилка при додаванні оголошення: ' + (err.message || 'Невідома помилка'),
        });
    }
};

const handleDeleteListing = async (id) => {
    const result = await Swal.fire({
        title: 'Ви впевнені?',
        text: 'Це оголошення буде видалено назавжди!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Так, видалити!',
        cancelButtonText: 'Скасувати',
    });

    if (!result.isConfirmed) return;

    try {
        await deleteListing(id);
        activeListings.value = activeListings.value.filter(listing => listing.id !== id);
        archivedListings.value = archivedListings.value.filter(listing => listing.id !== id);

        Swal.fire({
            icon: 'success',
            title: 'Видалено!',
            text: 'Оголошення успішно видалено!',
        });
    } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Не вдалося видалити оголошення.',
        });
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

        Swal.fire({
            icon: 'success',
            title: 'Статус змінено!',
            text: `Оголошення успішно ${newStatus === 'Active' ? 'активовано' : 'архівовано'}!`,
        });
    } catch (err) {
        console.error("Status error:", err);
        Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: 'Не вдалося змінити статус оголошення.',
        });
    }
};

onMounted(async () => {
    const waitForUser = () => new Promise(resolve => {
        const check = () => {
            if (authStore.user && authStore.user.id) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });

    await waitForUser();
    fetchMyListings();
});

</script>


<style scoped>
.my-listings-container {
    width: 100vw;
    justify-items: center;
}

.my-listings-header {
    margin: 70px 0 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    text-align: center;
}

.create-button {
    width: auto;
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
    height: 80vh;
}
</style>