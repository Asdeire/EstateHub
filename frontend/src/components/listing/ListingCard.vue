<template>
    <div v-if="listings && listings.length > 0" class="listings-container">
        <div v-for="listing in listings" :key="listing.id" class="listing-card"
            @click="goToListingDetail && goToListingDetail(listing.id)">

            <img :src="listing.photos?.[0] || '/house.png'" alt="Image {{ listing.title }}" class="listing-image"
                loading="lazy" />

            <div class="listing-info">
                <div class="title-and-favorite">
                    <h2>{{ listing.title }}</h2>
                    <span v-if="toggleFavorite" class="favorite-icon" @click.stop="toggleFavorite(listing)">
                        <img :src="listing.isFavorite ? '/fav-filled.png' : '/fav.png'" alt="Улюблене" />
                    </span>
                </div>
                <p class="listing-location">{{ listing.location }}</p>
                <h2 class="listing-price">{{ listing.price }}$</h2>

                <div v-if="hasActions" class="actions">
                    <span v-if="props.editListing" @click.stop="props.editListing(listing)" class="button">
                        <img src="/edit.png" alt="Редагувати" />
                    </span>
                    <span v-if="props.toggleListingStatus" @click.stop="props.toggleListingStatus(listing)"
                        class="button">
                        <img :src="listing.status === 'Active' ? '/archive.png' : '/unarchive.png'"
                            alt="Змінити статус" />
                    </span>
                    <span v-if="props.deleteListing" @click.stop="props.deleteListing(listing.id)" class="button">
                        <img src="/delete.png" alt="Видалити" />
                    </span>
                </div>

            </div>
        </div>
    </div>
    <div v-else class="no-listings">Немає доступних оголошень.</div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
    listings: { type: Array, required: true },
    goToListingDetail: { type: Function, default: null },
    toggleFavorite: { type: Function, default: null },
    editListing: { type: Function, default: null },
    toggleListingStatus: { type: Function, default: null },
    deleteListing: { type: Function, default: null },
});

const hasActions = computed(() => props.editListing || props.toggleListingStatus || props.deleteListing);
</script>