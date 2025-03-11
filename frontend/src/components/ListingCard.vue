<template>
    <div v-if="listings.length > 0" class="listings-container">
        <div v-for="listing in listings" :key="listing.id" class="listing-card" @click="goToListingDetail(listing.id)">
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
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
    listings: Array,
    goToListingDetail: Function,
    toggleFavorite: Function
});
</script>