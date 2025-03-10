<template>
    <Header />
    <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="Введіть напрямок" class="search-box" />
        <select v-model="selectedType">
            <option value="">Усі типи</option>
            <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select v-model="selectedTag">
            <option value="">Усі теги</option>
            <option v-for="tag in uniqueTags" :key="tag" :value="tag">{{ tag.name }}</option>
        </select>
        <select v-model="selectedCategory">
            <option value="">Усі категорії</option>
            <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category.name }}</option>
        </select>
        <select v-model="sortBy">
            <option value="newest">Новіші</option>
            <option value="oldest">Старіші</option>
            <option value="a-z">A-Я</option>
            <option value="z-a">Я-A</option>
        </select>
    </div>

    <div v-if="loading" class="loading-message">Завантаження...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
        <div v-if="filteredListings.length > 0" class="listings-container">
            <div v-for="listing in filteredListings" :key="listing.id" class="listing-card"
                @click="goToListingDetail(listing.id)">
                <img :src="listing.photos[0]" alt="Image {{ listing.title }}" class="listing-image" />
                <div class="listing-info">
                    <div class="title-and-favorite">
                        <h2>{{ listing.title }}</h2>
                        <span class="favorite-icon" @click.stop="toggleFavorite(listing)">
                            <img :src="listing.isFavorite ? '/fav-filled.png' : '/fav.png'" alt="Улюблене" />
                        </span>
                    </div>
                    <p class="listing-location">{{ listing.location }}</p>
                    <h2 class="listing-price">{{ listing.price }}$</h2>
                </div>
            </div>
        </div>
        <div v-else class="no-listings">Немає доступних оголошень.</div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import Header from "../components/Header.vue";
import { getListings, addFavorite, removeFavorite, getFavorites } from "../services/api";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedType = ref('');
const selectedTag = ref('');
const selectedCategory = ref('');
const sortBy = ref('newest');
const isAuthenticated = ref(!!localStorage.getItem('token'));
const favorites = ref(new Set());
const authStore = useAuthStore();

const fetchListings = async () => {
    console.log("Loading listings...");
    try {
        const data = await getListings();
        console.log("Listings loaded:", data);
        listings.value = data;
        loading.value = false;

        if (authStore.isAuthenticated) {
            console.log("User is authenticated, fetching favorites...");
            try {
                const favData = await getFavorites();
                console.log("Favorites fetched:", favData);
                favorites.value = new Set(favData.map(fav => fav.listing_id));
            } catch (error) {
                console.error("Error fetching favorites:", error);
            }
        }

        listings.value.forEach(listing => {
            listing.isFavorite = favorites.value.has(listing.id);
        });
    } catch (error) {
        console.error("Error loading listings:", error);
        loading.value = false;
    }
};

const toggleFavorite = async (listing) => {
    if (!authStore.isAuthenticated) {
        alert("Будь ласка, увійдіть, щоб додати до улюблених!");
        return;
    }
    try {
        if (favorites.value.has(listing.id)) {
            await removeFavorite(listing.id);
            favorites.value.delete(listing.id);
            listing.isFavorite = false;
        } else {
            await addFavorite(listing.id);
            favorites.value.add(listing.id);
            listing.isFavorite = true;
        }
    } catch (error) {
        console.error("Error toggling favorite status:", error);
    }
};

const goToListingDetail = (listingId) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
};

const uniqueTypes = computed(() => [...new Set(listings.value.map((item) => item.type))]);
const uniqueTags = computed(() => [...new Set(listings.value.flatMap((item) => item.tags))]);
const uniqueCategories = computed(() => [...new Set(listings.value.map((item) => item.category))]);

const filteredListings = computed(() => {
    let result = listings.value;

    if (searchQuery.value) {
        result = result.filter((listing) =>
            listing.location.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    if (selectedType.value) {
        result = result.filter((listing) => listing.type === selectedType.value);
    }

    if (selectedTag.value) {
        result = result.filter((listing) => listing.tags.includes(selectedTag.value));
    }

    if (selectedCategory.value) {
        result = result.filter((listing) => listing.category === selectedCategory.value);
    }

    if (sortBy.value === 'newest') {
        result = result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy.value === 'oldest') {
        result = result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy.value === 'a-z') {
        result = result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy.value === 'z-a') {
        result = result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
});

onMounted(fetchListings);
</script>
