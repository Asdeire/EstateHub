<template>
    <div class="home-page">
        <header class="bg-blue-600 text-white p-4 shadow-md">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-2xl font-bold">Estate Hub</h1>
                <nav>
                    <ul class="flex gap-4">
                        <li><router-link to="/login" class="hover:underline">Login</router-link></li>
                        <li><router-link to="/register" class="hover:underline">Register</router-link></li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class="container mx-auto py-8">
            <div class="search-bar mb-8">
                <h2 class="text-xl font-semibold mb-4">Find Your Dream Property</h2>
                <form @submit.prevent="searchProperties" class="flex gap-4">
                    <input v-model="searchQuery" type="text" placeholder="Search by location or keyword..."
                        class="flex-1 p-2 border border-gray-300 rounded-md" />
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md">Search</button>
                </form>
            </div>

            <section class="property-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="listing in filteredListings" :key="listing.id"
                    class="property-card border rounded-lg shadow-md p-4">
                    <img :src="listing.photos[0] || placeholderImage" alt="Property photo"
                        class="w-full h-48 object-cover rounded-md mb-4" />
                    <h3 class="text-lg font-bold mb-2">{{ listing.type }} - {{ listing.location }}</h3>
                    <p class="text-gray-600">Price: ${{ listing.price }}</p>
                    <p class="text-gray-600">Area: {{ listing.area }} sq ft</p>
                    <router-link :to="`/listings/${listing.id}`" class="text-blue-600 hover:underline mt-2 block">
                        View Details
                    </router-link>
                </div>
            </section>
        </main>

        <footer class="bg-gray-800 text-white py-4 mt-8">
            <div class="container mx-auto text-center">
                <p>&copy; 2025 Estate Hub. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Placeholder data for listings
const listings = ref([
    {
        id: '1',
        type: 'Apartment',
        location: 'New York, NY',
        price: 500000,
        area: 1200,
        photos: ['https://via.placeholder.com/400x300'],
    },
    {
        id: '2',
        type: 'House',
        location: 'Los Angeles, CA',
        price: 1200000,
        area: 2500,
        photos: ['https://via.placeholder.com/400x300'],
    },
    {
        id: '3',
        type: 'Commercial',
        location: 'Chicago, IL',
        price: 800000,
        area: 3000,
        photos: ['https://via.placeholder.com/400x300'],
    },
]);

const searchQuery = ref('');
const placeholderImage = 'https://via.placeholder.com/400x300';

// Filtered listings based on search query
const filteredListings = computed(() => {
    if (!searchQuery.value) return listings.value;
    return listings.value.filter(
        (listing) =>
            listing.location.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            listing.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Search action (currently just filters the local data)
const searchProperties = () => {
    console.log('Searching properties for:', searchQuery.value);
};
</script>

<style scoped>
.home-page {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.property-card img {
    transition: transform 0.3s;
}

.property-card img:hover {
    transform: scale(1.05);
}
</style>