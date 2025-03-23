<template>
    <Header />
    <div class="container">
        <div class="top-container">
            <div class="search-container">
                <input v-model="searchQuery" type="text" placeholder="Введіть напрямок" class="search-box"
                    @input="debouncedApplyFilters" />
            </div>

            <select v-model="sortBy" @change="applyFilters">
                <option value="newest">Новіші</option>
                <option value="oldest">Старіші</option>
                <option value="a-z">A-Я</option>
                <option value="z-a">Я-A</option>
            </select>

            <button @click="showFilters = !showFilters">Фільтри</button>
        </div>

        <div v-if="showFilters" class="modal-overlay" @click="showFilters = false">
            <div class="modal" @click.stop>
                <h2>Фільтри</h2>
                <div class="filter-options">
                    <label>
                        Тип нерухомості:
                        <select v-model="selectedType">
                            <option value="">Всі</option>
                            <option value="квартира">Квартира</option>
                            <option value="будинок">Будинок</option>
                            <option value="комерційна">Комерційна</option>
                        </select>
                    </label>

                    <label>Категорія</label>
                    <select v-model="selectedCategory">
                        <option value="">Всі</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>

                    <label>Теги</label>
                    <div class="tag-container">
                        <div v-for="tag in tags" :key="tag.id" class="tag-item"
                            :class="{ selected: selectedTags.includes(tag.id) }" @click="toggleTag(tag.id)">
                            {{ tag.name }}
                        </div>
                    </div>

                    <label>Мінімальна ціна</label>
                    <input type="number" v-model="priceMin" placeholder="Введіть мінімальну ціну" />

                    <label>Максимальна ціна</label>
                    <input type="number" v-model="priceMax" placeholder="Введіть максимальну ціну" />

                    <label>Мінімальна площа</label>
                    <input type="number" v-model="areaMin" placeholder="Введіть мінімальну площу" />

                    <label>Максимальна площа</label>
                    <input type="number" v-model="areaMax" placeholder="Введіть максимальну площу" />

                    <div class="filter-buttons">
                        <button @click="applyAndClose">Застосувати</button>
                        <button @click="clearFilters">Очистити</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="loading-message">Завантаження...</div>
        <div v-else-if="error" class="error-message">{{ error }}</div>

        <div v-else>
            <Listings :listings="sortedListings" :goToListingDetail="goToListingDetail"
                :toggleFavorite="toggleFavorite" />
        </div>

        <div class="pagination-container" v-if="totalPages > 1">
            <button class="pagination-button" @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1">Попередня</button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button class="pagination-button" @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages">Наступна</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/useAuthStore';
import Header from "../components/Header.vue";
import Listings from "../components/listing/ListingCard.vue";
import { getListings, getCategories, getTags, addFavorite, removeFavorite, getFavorites } from "../services/api/index";
import { debounce } from 'lodash';

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
const selectedStatus = ref('Active');

const isAuthenticated = ref(!!localStorage.getItem('token'));
const favorites = ref(new Set());
const authStore = useAuthStore();

const currentPage = ref(1);
const listingsPerPage = 12;
const totalPages = ref(0);

const categories = ref([]);
const tags = ref([]);

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

const toggleFavorite = async (listing) => {
    if (!authStore.isAuthenticated) {
        alert("Будь ласка, увійдіть, щоб додати до улюблених!");
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
    } catch (error) {
        listing.isFavorite = originalState;
        console.error("Error toggling favorite:", error);
        if (error.message === 'Ви досягли ліміту у 12 улюблених оголошень.') {
            alert(error.message);
        } else {
            alert("Сталася помилка при зміні улюблених.");
        }
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

const sortedListings = computed(() => {
    let filtered = listings.value.filter(listing =>
        listing.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    );

    switch (sortBy.value) {
        case 'newest':
            return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'a-z':
            return filtered.sort((a, b) => a.title.localeCompare(b.title));
        case 'z-a':
            return filtered.sort((a, b) => b.title.localeCompare(a.title));
        default:
            return filtered;
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
        status: selectedStatus.value,
        tags: selectedTags.value,
    };
    fetchListings(currentPage.value, filters);
};

const debouncedApplyFilters = debounce(applyFilters, 300);

const applyAndClose = () => {
    applyFilters();
    showFilters.value = false;
};

const clearFilters = () => {
    selectedType.value = '';
    selectedCategory.value = '';
    selectedTags.value = [];
    priceMin.value = null;
    priceMax.value = null;
    areaMin.value = null;
    areaMax.value = null;
    showFilters.value = false;
    applyFilters();
};

const toggleTag = (tagId) => {
    if (selectedTags.value.includes(tagId)) {
        selectedTags.value = selectedTags.value.filter(id => id !== tagId);
    } else {
        selectedTags.value.push(tagId);
    }
    applyFilters();
};

onMounted(async () => {
    categories.value = await getCategories();
    tags.value = await getTags();
    fetchListings();
});
</script>