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
            <Listings :listings="paginatedListings" :goToListingDetail="goToListingDetail"
                :toggleFavorite="toggleFavorite" />
        </div>

        <div id="pagination">
            <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">Попередня</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages">Наступна</button>
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
const listingsPerPage = 12;
const totalPages = ref(0);

const fetchListings = async (page = 1, filters = {}) => {
    try {
        loading.value = true;
        const data = await getListings(page, listingsPerPage, filters);
        listings.value = data.listings;
        totalPages.value = data.totalPages;

        if (authStore.isAuthenticated) {
            const favData = await getFavorites();
            favorites.value = new Set(favData.map(fav => fav.listing_id));
            listings.value.forEach(listing => listing.isFavorite = favorites.value.has(listing.id));
        }

        loading.value = false;
    } catch (error) {
        console.error("Error loading listings:", error);
        error.value = "Не вдалося завантажити оголошення.";
        loading.value = false;
    }
};

const applyFilters = () => {
    const filters = {
        category: selectedCategory.value,
        minPrice: priceMin.value,
        maxPrice: priceMax.value,
        minArea: areaMin.value,
        maxArea: areaMax.value,
        status: 'Active',
        tags: selectedTags.value.map(tag => tag.name),
        search: searchQuery.value,
    };

    fetchListings(currentPage.value, filters);
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
        applyFilters(); 
    }
};

const uniqueTypes = computed(() => [...new Set(listings.value.map((item) => item.type))]);
const uniqueTags = computed(() => [...new Set(listings.value.flatMap((item) => item.tags))]);
const uniqueCategories = computed(() => [...new Set(listings.value.map((item) => item.category))]);

const paginatedListings = computed(() => listings.value);

onMounted(() => {
    fetchListings();
});
</script>
