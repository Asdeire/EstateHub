<template>
    <Header />
    <div v-if="listing" class="listing-container">
        <div v-if="loading" class="loading-message" role="status" aria-live="polite">Завантаження...</div>
        <div v-else-if="error" class="error-message" role="alert">{{ error }}</div>

        <div class="listing-gallery">
            <img v-if="listing?.photos?.length" :src="listing.photos[0]" alt="Main Image of {{ listing.title }}"
                class="main-image" loading="lazy" />
            <img v-else :src="defaultPhoto" alt="Default Image" class="main-image" loading="lazy" />

            <div class="thumbnail-container">
                <template v-if="listing?.photos?.length > 1">
                    <img v-for="(photo, index) in listing.photos.slice(1, 3)" :key="index" :src="photo"
                        class="thumbnail" loading="lazy" alt="Thumbnail {{ index + 1 }}" />
                    <div v-if="listing.photos.length > 4" class="thumbnail overlay" @click="openGallery">
                        <img :src="listing.photos[3]" class="thumbnail" loading="lazy" alt="Additional photos" />
                        <div class="overlay-text">+{{ listing.photos.length - 3 }} фото</div>
                    </div>
                </template>
                <template v-else>
                    <img :src="defaultPhoto" class="thumbnail" loading="lazy" alt="Default Thumbnail 1" />
                    <img :src="defaultPhoto" class="thumbnail" loading="lazy" alt="Default Thumbnail 2" />
                </template>
            </div>
            <button v-if="listing.photos.length > 4" class="gallery-button" @click="openGallery">+{{
                listing.photos.length - 1 }}
                фото</button>
        </div>

        <div v-if="showGallery" class="gallery-modal" @click.self="closeGallery">
            <div class="gallery-modal-content">
                <carousel :items-to-show="1" :wrap-around="true" v-model="currentSlide" class="carousel">
                    <slide v-for="(photo, index) in listing.photos" :key="index">
                        <img :src="photo" :alt="`Photo ${index + 1}`" class="carousel-image" loading="lazy">
                    </slide>

                    <template #addons>
                        <navigation />
                        <pagination />
                    </template>
                </carousel>
            </div>
        </div>

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
                            class="icon">
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

        <div class="listing-map">
            <h2 class="map-title">{{ listing.location }}</h2>
            <div v-if="coords" class="map-container">
                <l-map :zoom="13" :center="coords" class="map">
                    <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <l-marker :lat-lng="coords" @click="openMap"></l-marker>
                </l-map>
            </div>
            <p v-else class="no-location">Дані про місцезнаходження відсутні.</p>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { Carousel, Slide, Navigation, Pagination } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import { getListingById, getUserById, getFavorites, addFavorite, removeFavorite } from '../services/api/index';
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import axios from "axios";
import L from "leaflet";
import Header from '../components/Header.vue';
import agentIcon from '../assets/agency.png';
import userIconDefault from '../assets/user-icon.png';
import defaultPhoto from '../assets/undefined.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const route = useRoute();
const listing = ref(null);
const loading = ref(true);
const error = ref(null);
const coords = ref(null);
const user = ref(null);
const currency = ref('USD');
const exchangeRate = ref(1);

const authStore = useAuthStore();
const favorites = ref(new Set());

const showGallery = ref(false);
const currentSlide = ref(0);

const openGallery = () => {
    showGallery.value = true;
    currentSlide.value = 0;
};

const closeGallery = () => {
    showGallery.value = false;
};

const fetchListing = async () => {
    try {
        const { id } = route.params;
        listing.value = await getListingById(id);
        await fetchCoordinates(listing.value.location);
        const userId = listing.value.user_id;
        if (userId) {
            user.value = await getUserById(userId);
        }

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
        console.error("Помилка отримання улюблених:", error);
    }
};

const toggleFavorite = async () => {
    if (!authStore.isAuthenticated) {
        alert("Будь ласка, увійдіть, щоб додати до улюблених!");
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
        console.error("Помилка зміни статусу улюбленого:", error);
    }
};

const fetchExchangeRate = async () => {
    try {
        const response = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
        exchangeRate.value = response.data.rates.UAH;
    } catch (err) {
        console.error("Помилка отримання курсу валют:", err);
    }
};

const formattedPrice = computed(() => {
    if (!listing.value) return "";
    const price = currency.value === "USD"
        ? listing.value.price
        : listing.value.price * exchangeRate.value;

    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: currency.value,
        minimumFractionDigits: 0
    }).format(price);
});

const toggleCurrency = () => {
    currency.value = currency.value === "USD" ? "UAH" : "USD";
};

const userIcon = computed(() => user.value?.role === 'Makler' ? agentIcon : userIconDefault);

const contactUser = () => {
    if (!authStore.isAuthenticated) {
        alert("Будь ласка, увійдіть, щоб зв'язатися з власником!");
        return;
    }
    alert(`Зв'язок із ${user.value?.name}`);
};

const router = useRouter();

const filterByTag = (tag) => {
    router.push({ name: 'Listings', query: { tag: tag.name } });
};

const fetchCoordinates = async (address) => {
    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: address,
                format: "json",
                limit: 1
            }
        });

        if (response.data.length > 0) {
            coords.value = [
                parseFloat(response.data[0].lat),
                parseFloat(response.data[0].lon)
            ];
        } else {
            console.warn("Координати не знайдені");
        }
    } catch (err) {
        console.error("Помилка отримання координат:", err);
    }
};

const openMap = () => {
    if (coords.value) {
        const [lat, lon] = coords.value;
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
    }
};

onMounted(async () => {
    await fetchListing();
    await fetchExchangeRate();
});
</script>