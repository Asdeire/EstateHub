<template>
    <Header />
    <div v-if="loading" class="loading-message" role="status" aria-live="polite">Завантаження...</div>
    <div v-else-if="listing" class="listing-container">
        <PhotoGallery :photos="listing.photos" :title="listing.title" :default-photo="defaultPhoto" />

        <div class="listing-content">
            <div class="listing-info">
                <h1 class="listing-title">{{ listing.title }}</h1>

                <div class="listing-tags" v-if="listing.tags.length">
                    <span v-for="(tag, index) in listing.tags" :key="index" class="tag" @click="filterByTag(tag)">
                        {{ tag.name }}
                    </span>
                </div>

                <div class="listing-price" @click="toggleCurrency">
                    {{ formattedPrice }}
                    <span class="favorite-icon" @click.stop="toggleFavorite">
                        <img :src="listing.isFavorite ? '/fav-filled.png' : '/fav.png'" alt="Позначити як улюблене"
                            class="icon" />
                    </span>
                </div>

                <p class="listing-area">Площа: {{ listing.area }} м²</p>
                <p class="listing-description">{{ listing.description }}</p>
            </div>

            <div class="listing-contact">
                <div class="user-info">
                    <img :src="userIcon" alt="Іконка користувача" class="user-icon" />
                    <div class="user-details">
                        <p class="user-name">{{ user?.name }}</p>
                        <p v-if="user?.role === 'Makler'" class="agent-status">Агент</p>
                    </div>
                </div>
                <button class="contact-button" @click="contactUser">Зв'язатись</button>
            </div>
        </div>

        <Map :current-listing="listing" :nearby-listings="nearbyListings" />
    </div>
    <div v-else-if="error" class="error-message" role="alert">{{ error }}</div>
    <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watch } from 'vue';
import { useAuthStore } from '../stores/authDataStore';
import {
    getListingById,
    getUserById,
    getFavorites,
    addFavorite,
    removeFavorite,
    getNearbyListings
} from '../services/api/index';
import axios from 'axios';
import Swal from 'sweetalert2';

import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import Map from '../components/listing/Map.vue';
import PhotoGallery from '../components/listing/PhotoGallery.vue';

import agentIcon from '../assets/agency.png';
import userIconDefault from '../assets/user-icon.png';
import defaultPhoto from '../assets/undefined.png';

const route = useRoute();
const router = useRouter();
const listing = ref(null);
const user = ref(null);
const nearbyListings = ref([]);
const loading = ref(true);
const error = ref(null);

const authStore = useAuthStore();
const favorites = ref(new Set());

const currency = ref('USD');
const exchangeRate = ref(1);

const fetchListing = async () => {
    try {
        const { id } = route.params;
        listing.value = await getListingById(id);

        const userId = listing.value.user_id;
        if (userId) {
            user.value = await getUserById(userId);
        }

        nearbyListings.value = await getNearbyListings(listing.value.location, id);

        if (authStore.isAuthenticated) {
            await fetchFavorites();
        }
        listing.value.isFavorite = favorites.value.has(listing.value.id);
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося завантажити оголошення';
    } finally {
        loading.value = false;
    }
};

const fetchFavorites = async () => {
    try {
        const favData = await getFavorites();
        favorites.value = new Set(favData.map(fav => fav.listing_id));
    } catch (error) {
        console.error('Error fetching favourites:', error);
    }
};

const toggleFavorite = async () => {
    if (!authStore.isAuthenticated) {
        await Swal.fire({
            icon: 'warning',
            title: 'Увійдіть',
            text: 'Будь ласка, увійдіть, щоб додати до улюблених!',
        });
        return;
    }
    try {
        if (favorites.value.has(listing.value.id)) {
            await removeFavorite(listing.value.id);
            favorites.value.delete(listing.value.id);
            listing.value.isFavorite = false;
        } else {
            await addFavorite(listing.value.id);
            favorites.value.add(listing.value.id);
            listing.value.isFavorite = true;
        }
    } catch (error) {
        console.error('Favourite status error:', error);
    }
};

const fetchExchangeRate = async () => {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        exchangeRate.value = response.data.rates.UAH;
    } catch (err) {
        console.error('Error:', err);
    }
};

const formattedPrice = computed(() => {
    if (!listing.value) return '';
    const price = currency.value === 'USD' ? listing.value.price : listing.value.price * exchangeRate.value;
    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: currency.value,
        minimumFractionDigits: 0,
    }).format(price);
});

const toggleCurrency = () => {
    currency.value = currency.value === 'USD' ? 'UAH' : 'USD';
};

const userIcon = computed(() => (user.value?.role === 'Makler' ? agentIcon : userIconDefault));

const contactUser = () => {
    if (!authStore.isAuthenticated) {
        Swal.fire({
            icon: 'warning',
            title: 'Увійдіть',
            text: "Будь ласка, увійдіть, щоб зв'язатися з власником!",
        });
        return;
    }
    Swal.fire({
        icon: 'info',
        title: 'Контакт',
        text: `Зв'язок із ${user.value?.name}`,
    });
};

const filterByTag = tag => {
    router.push({ name: 'Listings', query: { tag: tag.name } });
};

watch(() => route.params.id, async (newId) => {
    if (newId) {
        loading.value = true;
        await fetchListing();
    }
});

onMounted(async () => {
    await fetchListing();
    await fetchExchangeRate();
});
</script>