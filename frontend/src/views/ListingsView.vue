<template>
    <Header />
    <div class="container">
        <div class="top-container">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="Введіть напрямок" class="search-box"
                    @input="onSearchInput" />
            </div>

            <select v-model="sortBy">
                <option value="newest">Новіші</option>
                <option value="oldest">Старіші</option>
                <option value="a-z">A-Я</option>
                <option value="z-a">Я-A</option>
            </select>

            <span @click="showFilters = !showFilters"><img src="../assets/filter.png"></span>
        </div>

        <FilterModal v-if="showFilters" :categories="dataStore.categories" :tags="dataStore.tags"
            :selected-type="selectedType" :selected-category="selectedCategory" :selected-tags="selectedTags"
            :price-min="priceMin" :price-max="priceMax" :area-min="areaMin" :area-max="areaMax"
            @close="showFilters = false" @apply="handleApplyFilters" @clear="clearFilters" />

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>

        <div v-else>
            <Listings :listings="sortedListings" :goToListingDetail="goToListingDetail"
                :toggleFavorite="toggleFavorite" />
        </div>

        <div class="pagination-container" v-if="totalPages > 1">
            <button class="pagination-button" @click="changePage(currentPage - 1)" :disabled="currentPage <= 1">
                Попередня
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button class="pagination-button" @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages">
                Наступна
            </button>
        </div>
    </div>
    <Footer />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import Listings from '../components/listing/ListingCard.vue';
import FilterModal from '../components/listing/FilterModal.vue';
import { getListings, addFavorite, removeFavorite, getFavorites } from '../services/api/index';
import type { Listing } from '../types/listing';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const dataStore = useDataStore();

const listings = ref<Listing[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const searchQuery = ref<string>('');
const selectedType = ref<string>('');
const selectedTags = ref<string[]>([]);
const selectedCategory = ref<string>('');
const priceMin = ref<number | null>(null);
const priceMax = ref<number | null>(null);
const areaMin = ref<number | null>(null);
const areaMax = ref<number | null>(null);
const sortBy = ref<string>('newest');
const showFilters = ref<boolean>(false);
const selectedStatus = ref<string>('Active');

const currentPage = ref<number>(1);
const listingsPerPage = 12;
const totalPages = ref<number>(0);

const favorites = ref<Set<string>>(new Set());

const onSearchInput = () => {
    currentPage.value = 1;
    applyFilters();
};

const updateFavorites = async () => {
    if (!authStore.isAuthenticated) return;
    const favData = await getFavorites();
    favorites.value = new Set(favData.map((fav: { listing_id: string }) => fav.listing_id));
    listings.value.forEach((listing) => (listing.isFavorite = favorites.value.has(listing.id)));
};

const cache = ref<Map<string, { listings: Listing[], totalPages: number }>>(new Map());

const fetchListings = async (page: number = 1, filters: Record<string, any> = {}) => {
    const cacheKey = JSON.stringify({ page, filters });
    if (cache.value.has(cacheKey)) {
        const cached = cache.value.get(cacheKey)!;
        listings.value = cached.listings;
        totalPages.value = cached.totalPages;
        loading.value = false;
        return;
    }
    try {
        loading.value = true;
        filters.status = selectedStatus.value;
        const data = await getListings(page, listingsPerPage, filters);
        cache.value.set(cacheKey, data);
        listings.value = data.listings;
        totalPages.value = data.totalPages;
        await updateFavorites();
    } catch (err) {
        console.error('Error loading listings:', err);
        error.value = 'Не вдалося завантажити оголошення.';
    } finally {
        loading.value = false;
    }
};

const toggleFavorite = async (listing: Listing) => {
    if (!authStore.isAuthenticated) {
        alert('Будь ласка, увійдіть, щоб додати до улюблених!');
        return;
    }

    const originalState = listing.isFavorite;
    listing.isFavorite = !listing.isFavorite;

    try {
        if (originalState) {
            await removeFavorite(listing.id);
            favorites.value.delete(listing.id);
        } else {
            await addFavorite(listing.id);
            favorites.value.add(listing.id);
        }
    } catch (error: any) {
        listing.isFavorite = originalState;
        console.error('Error toggling favorite:', error);
        alert(error.message || 'Сталася помилка при зміні улюблених.');
    }
};

const goToListingDetail = (listingId: string) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
};

const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        applyFilters();
    }
};

const sortedListings = computed(() => {
    const sorted = [...listings.value];
    switch (sortBy.value) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        case 'a-z':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'z-a':
            return sorted.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return sorted;
    }
});

const applyFilters = () => {
    const filters = {
        category: selectedCategory.value,
        type: selectedType.value,
        minPrice: priceMin.value,
        maxPrice: priceMax.value,
        minArea: areaMin.value,
        maxArea: areaMax.value,
        tags: selectedTags.value,
        search: searchQuery.value.trim(),
    };
    fetchListings(currentPage.value, filters);
};

const handleApplyFilters = (filters: Record<string, any>) => {
    selectedType.value = filters.type;
    selectedCategory.value = filters.category;
    selectedTags.value = filters.tags;
    priceMin.value = filters.minPrice;
    priceMax.value = filters.maxPrice;
    areaMin.value = filters.minArea;
    areaMax.value = filters.maxArea;
    searchQuery.value = filters.search || '';
    applyFilters();
};


const clearFilters = () => {
    selectedType.value = '';
    selectedCategory.value = '';
    selectedTags.value = [];
    priceMin.value = null;
    priceMax.value = null;
    areaMin.value = null;
    areaMax.value = null;
    applyFilters();
};

onMounted(async () => {
    await dataStore.loadData();

    const tagFromUrl = route.query.tag;
    if (tagFromUrl) {
        const tag = dataStore.tags.find(t => t.name === tagFromUrl);
        if (tag) {
            selectedTags.value = [tag.id];
        }
    }

    const { location, price, area, type } = route.query;

    if (location) searchQuery.value = location as string;
    if (price) priceMax.value = Number(price);
    if (area) areaMax.value = Number(area);
    if (type) selectedType.value = type as string;

    applyFilters();
});
</script>