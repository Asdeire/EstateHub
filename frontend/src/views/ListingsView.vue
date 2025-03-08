<template>
    <Header />
    <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="Ввести напрямок" class="search-box" />
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
            <option value="a-z">А-Я</option>
            <option value="z-a">Я-А</option>
        </select>
    </div>

    <div v-if="loading" class="loading-message">Завантаження...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
        <div v-if="filteredListings.length > 0" class="listings-container">
            <div v-for="listing in filteredListings" :key="listing.id" class="listing-card"
                @click="goToListingDetail(listing.id)">
                <img :src="listing.photos[0]" alt="Зображення {{ listing.title }}" class="listing-image" />
                <div class="listing-info">
                    <div class="title-and-favorite">
                        <h2>{{ listing.title }}</h2>
                        <span class="favorite-icon" @click.stop="toggleFavorite(listing)">
                            <img src="../assets/fav.png" alt="Лайк" />
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
import Header from "../components/Header.vue";
import { getListings } from "../services/api";

const router = useRouter();
const listings = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedType = ref('');
const selectedTag = ref('');
const selectedCategory = ref('');
const sortBy = ref('newest');

const fetchListings = async () => {
    try {
        const data = await getListings();
        listings.value = data;
    } catch (err) {
        error.value = err.response?.data?.message || 'Не вдалося завантажити оголошення';
    } finally {
        loading.value = false;
    }
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

const toggleFavorite = (listing) => {
    listing.isFavorite = !listing.isFavorite;
};

const goToListingDetail = (listingId) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
};

onMounted(fetchListings);
</script>
