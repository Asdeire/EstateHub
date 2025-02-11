<template>
    <div class="container mx-auto p-6">
        <div v-if="loading" class="text-center text-lg">Loading...</div>
        <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
        <div v-else class="bg-white shadow-lg rounded-2xl p-6">
            <h1 class="text-3xl font-bold mb-4">{{ listing.title }}</h1>
            <div class="flex flex-col md:flex-row">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <img v-for="(photo, index) in listing.photos" :key="index" :src="photo"
                        :alt="`Listing Image ${index + 1}`" class="w-full h-auto rounded-2xl shadow-md" />
                </div>

                <div class="flex-1">
                    <p class="text-lg mb-4">{{ listing.description }}</p>
                    <p class="text-xl font-semibold">Price: ${{ listing.price }}</p>
                    <p class="text-md text-gray-600 mt-2">Location: {{ listing.location }}</p>
                </div>
            </div>

            <div class="mt-6">
                <h2 class="text-2xl font-semibold mb-2">All Listing Details</h2>
                <div v-for="(value, key) in listing" :key="key" class="border-b py-2">
                    <strong class="capitalize">{{ key }}:</strong>
                    <span>{{ value }}</span>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getListingById } from '../services/api';

const route = useRoute();
const listing = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchListing = async () => {
    try {
        const { id } = route.params;
        listing.value = await getListingById(id);
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load listing';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchListing);
</script>

<style scoped>
.container {
    max-width: 800px;
}
</style>