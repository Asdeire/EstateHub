<template>
    <Header />
    <div class="favourite-container">
        <h1>Улюблені</h1>

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else-if="favoritesListings.length === 0" class="no-listings">
            У вас поки немає улюблених оголошень
        </div>

        <div v-else>
            <Listings :listings="favoritesListings" :goToListingDetail="goToListingDetail"
                :toggleFavorite="toggleFavorite" />
        </div>

    </div>
    <Footer />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authDataStore';
import Header from "../components/Header.vue";
import Footer from '../components/Footer.vue';
import Listings from "../components/listing/ListingCard.vue";
import {addFavorite, removeFavorite, getFavoriteListings } from "../services/api/index";
import Swal from 'sweetalert2';

const router = useRouter();
const authStore = useAuthStore();
const favoritesListings = ref([]);
const loading = ref(true);
const error = ref(null);

const currentPage = ref(1);
const listingsPerPage = 12;
const totalPages = ref(0);

const fetchFavorites = async (page = 1) => {
    try {
        loading.value = true;

        const favData = await getFavoriteListings(authStore.user.id);
        const favoriteIds = new Set(favData.map(fav => fav.id));

        favoritesListings.value = favData;

        favoritesListings.value.forEach(listing => listing.isFavorite = true);

        loading.value = false;
    } catch (error) {
        console.error("Error loading favorites:", error);
        error.value = "Не вдалося завантажити улюблені оголошення.";
        loading.value = false;
    }
};


const toggleFavorite = async (listing) => {
    if (!authStore.isAuthenticated) {
        await Swal.fire({
            icon: 'warning',
            title: 'Увійдіть',
            text: 'Будь ласка, увійдіть, щоб керувати улюбленими!',
        });
        return;
    }

    const originalState = listing.isFavorite;
    listing.isFavorite = !listing.isFavorite;

    try {
        if (originalState) {
            await removeFavorite(listing.id);
            favoritesListings.value = favoritesListings.value.filter(fav => fav.id !== listing.id);
        } else {
            await addFavorite(listing.id);
            fetchFavorites(currentPage.value);
        }
    } catch (error) {
        listing.isFavorite = originalState;
        console.error("Error toggling favorite:", error);
    }
};

const goToListingDetail = (listingId) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
};

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchFavorites(page);
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
    fetchFavorites();
});
</script>

<style scoped>
.favourite-container {
    margin-top: 60px;
    min-height: 90vh;
    width: 100vw;
    justify-items: center;

    h1 {
        text-align: center;
    }
}
</style>