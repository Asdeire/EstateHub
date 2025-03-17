<template>
    <Header />
    <div class="container">
        <div class="top-container">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="Введіть напрямок" class="search-box" />
            </div>
            <div class="filters">
                <FilterModal :show="showFilters" :selectedType="selectedType" :selectedTags="selectedTags"
                    :selectedCategory="selectedCategory" :uniqueTypes="uniqueTypes" :uniqueTags="uniqueTags"
                    :uniqueCategories="uniqueCategories" :priceMin="priceMin" :priceMax="priceMax" :areaMin="areaMin"
                    :areaMax="areaMax" @update:show="showFilters = $event" @update:selectedType="selectedType = $event"
                    @update:selectedTags="selectedTags = $event" @update:selectedCategory="selectedCategory = $event"
                    @update:selectedMinPrice="priceMin = $event" @update:selectedMaxPrice="priceMax = $event"
                    @update:selectedMinArea="areaMin = $event" @update:selectedMaxArea="areaMax = $event" />
            </div>
            <div class="controls">
                <button @click="showFilters = true" class="filter-button">Фільтри</button>
                <select v-model="sortBy">
                    <option value="newest">Новіші</option>
                    <option value="oldest">Старіші</option>
                    <option value="a-z">A-Я</option>
                    <option value="z-a">Я-A</option>
                </select>
            </div>
        </div>
        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>
        <div v-else>
            <Listings :listings="filteredListings" :goToListingDetail="goToListingDetail"
                :toggleFavorite="toggleFavorite" />
            <div id="pagination">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">Попередня</button>
                <span>{{ currentPage }} / {{ totalPages }}</span>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages">Наступна</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import Header from "../components/Header.vue";
import Listings from "../components/listing/ListingCard.vue";
import FilterModal from "../components/listing/ModalFilter.vue";
import { getListings, addFavorite, removeFavorite, getFavorites } from "../services/api/index";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);

const searchQuery = ref('');
const selectedType = ref('');
const selectedTags = ref([]);
const selectedCategory = ref('');
const priceMin = ref(null);
const priceMax = ref(null);
const areaMin = ref(null);
const areaMax = ref(null);
const sortBy = ref('newest');
const showFilters = ref(false);

const isAuthenticated = ref(!!localStorage.getItem('token'));
const favorites = ref(new Set());
const authStore = useAuthStore();

const currentPage = ref(1);
const totalPages = ref(1);
const listingsPerPage = 12;
const cache = ref(new Map());

const fetchListings = async () => {
    try {
        if (cache.value.has(currentPage.value)) {
            listings.value = cache.value.get(currentPage.value);
            loading.value = false;
            return;
        }

        const data = await getListings(currentPage.value, listingsPerPage);
        listings.value = data.listings;
        totalPages.value = data.totalPages;

        cache.value.set(currentPage.value, data.listings);

        if (authStore.isAuthenticated) {
            const favData = await getFavorites();
            favorites.value = new Set(favData.map(fav => fav.listing_id));
            listings.value.forEach(listing => listing.isFavorite = favorites.value.has(listing.id));
        }

        loading.value = false;
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

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchListings();
    }
};

const uniqueTypes = computed(() => [...new Set(listings.value.map((item) => item.type))]);
const uniqueTags = computed(() => [...new Set(listings.value.flatMap((item) => item.tags))]);
const uniqueCategories = computed(() => [...new Set(listings.value.map((item) => item.category))]);

const filteredListings = computed(() => {
    let result = listings.value.filter(listing => listing.status === 'Active');

    if (searchQuery.value) {
        result = result.filter((listing) =>
            listing.location.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
    }

    if (selectedType.value) {
        result = result.filter((listing) => listing.type === selectedType.value);
    }

    if (selectedTags.value.length) {
        result = result.filter((listing) => {
            const listingTagIds = listing.tags.map(tag => tag.id);
            return selectedTags.value.every(tag => listingTagIds.includes(tag));
        });
    }

    if (selectedCategory.value) {
        result = result.filter((listing) =>
            listing.category === selectedCategory.value ||
            listing.category?.id === selectedCategory.value
        );
    }

    if (priceMin.value !== null) {
        result = result.filter((listing) => Number(listing.price) >= Number(priceMin.value));
    }

    if (priceMax.value !== null) {
        result = result.filter((listing) => Number(listing.price) <= Number(priceMax.value));
    }

    if (areaMin.value !== null) {
        result = result.filter((listing) => Number(listing.area) >= Number(areaMin.value));
    }

    if (areaMax.value !== null) {
        result = result.filter((listing) => Number(listing.area) <= Number(areaMax.value));
    }

    const sortingMethods = {
        newest: (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
        oldest: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
        "a-z": (a, b) => a.title.localeCompare(b.title),
        "z-a": (a, b) => b.title.localeCompare(a.title),
    };

    if (sortingMethods[sortBy.value]) {
        result = result.sort(sortingMethods[sortBy.value]);
    }

    return result;
});

onMounted(() => {
    fetchListings();
});
</script>