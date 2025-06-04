<template>
    <Header />
    <div class="container">
        <div class="top-container">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="Введіть напрямок" class="search-box"
                    @input="onSearchInput" />
            </div>

            <div class="divider"></div>

            <div class="view-toggle">
                <button @click="toggleViewMode" :class="viewMode">
                    {{ viewMode === 'list' ? 'Перейти до карти' : 'Перейти до списку' }}
                </button>
            </div>

            <select v-model="selectedSort" @change="applyFilters">
                <option value="updated_at:desc">Новіші</option>
                <option value="updated_at:asc">Старіші</option>
                <option value="title:asc">A-Я</option>
                <option value="title:desc">Я-A</option>
            </select>

            <span @click="showFilters = !showFilters"><img src="../assets/filter.png"></span>
        </div>

        <FilterModal v-if="showFilters" :categories="dataStore.categories" :tags="dataStore.tags"
            :currency="selectedCurrency" :selected-type="selectedType" :selected-category="selectedCategory"
            :selected-tags="selectedTags" :selected-is-verified="isVerified" :price-min="priceMin" :price-max="priceMax"
            :area-min="areaMin" :area-max="areaMax" @close="showFilters = false" @apply="handleApplyFilters"
            @clear="clearFilters" />

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>

        <div v-else>
            <div v-if="viewMode === 'list'">
                <Listings :listings="listings" :goToListingDetail="goToListingDetail" :toggleFavorite="toggleFavorite"
                    :currency="selectedCurrency" />

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

            <div v-else-if="viewMode === 'map'" class="map-container">
                <MapView :nearbyListings="listings" style-variant="default" />
            </div>
        </div>
    </div>
    <Footer />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authDataStore';
import { useDataStore } from '../stores/dataStore';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import MapView from '../components/listing/Map.vue';
import Listings from '../components/listing/ListingCard.vue';
import FilterModal from '../components/listing/FilterModal.vue';
import { getActiveListings, addFavorite, removeFavorite, getFavorites } from '../services/api/index';
import Swal from 'sweetalert2';
import type { Listing } from '../types/listing';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const dataStore = useDataStore();

const listings = ref<Listing[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref('');
const selectedType = ref('');
const selectedTags = ref<string[]>([]);
const selectedCategory = ref('');
const priceMin = ref<number | null>(null);
const priceMax = ref<number | null>(null);
const areaMin = ref<number | null>(null);
const areaMax = ref<number | null>(null);
const isVerified = ref<string>('');
const selectedSort = ref('updated_at:desc');
const selectedCurrency = ref<'USD' | 'UAH'>('UAH');

const viewMode = ref<'list' | 'map'>('list');
const currentPage = ref(1);
const listingsPerPage = 12;
const totalPages = ref(0);

const favorites = ref<Set<string>>(new Set());
const showFilters = ref(false);

const onSearchInput = () => {
    currentPage.value = 1;
    applyFilters();
};

const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'list' ? 'map' : 'list';
};

const updateFavorites = async () => {
    if (!authStore.isAuthenticated) return;
    try {
        const favData = await getFavorites();
        favorites.value = new Set(favData.map((fav: { listing_id: string }) => fav.listing_id));
        listings.value.forEach((listing) => (listing.isFavorite = favorites.value.has(listing.id)));
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
};

const fetchListings = async (page = 1, filters: Record<string, any> = {}) => {
    try {
        loading.value = true;

        const [sortBy, sortOrder] = selectedSort.value.split(':');

        const data = await getActiveListings(page, listingsPerPage, {
            ...filters,
            sortBy,
            sortOrder: sortOrder as 'asc' | 'desc' | undefined,
        });

        listings.value = data.listings;
        totalPages.value = data.totalPages;

        if (authStore.isAuthenticated) {
            await updateFavorites();
        }
    } catch (err) {
        console.error('Error loading listings:', err);
        error.value = 'Не вдалося завантажити оголошення.';
    } finally {
        loading.value = false;
    }
};

const toggleFavorite = async (listing: Listing) => {
    if (!authStore.isAuthenticated) {
        await Swal.fire({
            icon: 'warning',
            title: 'Увійдіть',
            text: 'Будь ласка, увійдіть, щоб додати до улюблених!',
        });
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
        await Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: error.message || 'Сталася помилка при зміні улюблених.',
        });
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
        is_verified: isVerified.value === '' ? undefined : isVerified.value === 'true',
        currency: selectedCurrency.value,
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
    isVerified.value = filters.is_verified !== undefined ? String(filters.is_verified) : '';
    selectedCurrency.value = filters.currency || 'UAH';
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
    selectedCurrency.value = 'UAH';
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

    const { location, price, area, type, currency } = route.query;

    if (location) searchQuery.value = location as string;
    if (price) priceMax.value = Number(price);
    if (area) areaMax.value = Number(area);
    if (type) selectedType.value = type as string;
    if (currency === 'UAH' || currency === 'USD') selectedCurrency.value = currency;
    if (route.query.currency) {
        selectedCurrency.value = route.query.currency as 'UAH' | 'USD';
    }

    applyFilters();
});
</script>
