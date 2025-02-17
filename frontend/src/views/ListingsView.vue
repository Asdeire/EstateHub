<template>
    <Header />
    <div>
        <h1>Listings</h1>
        <div v-for="listing in listings" :key="listing.id">
            <RouterLink :to="`/listings/${listing.id}`">
                <p>{{ listing.location }} - ${{ listing.price }}</p>
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getListings } from '../services/api';
import type { Listing } from '../types/listing';
import Header from '../components/Header.vue';

const listings = ref<Listing[]>([]);

onMounted(async () => {
    try {
        listings.value = await getListings();
    } catch (error) {
        console.error('Failed to load listings', error);
    }
});
</script>
