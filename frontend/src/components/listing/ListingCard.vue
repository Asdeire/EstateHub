<template>
    <div v-if="listings && listings.length > 0" class="listings-container">
        <div v-for="listing in listings" :key="listing.id" class="listing-card"
            @click="goToListingDetail && goToListingDetail(listing.id)">

            <img :src="listing.photos[0]" alt="Image {{ listing.title }}" class="listing-image" />

            <div class="listing-info">
                <div class="title-and-favorite">
                    <h2>{{ listing.title }}</h2>
                    <span v-if="toggleFavorite" class="favorite-icon" @click.stop="toggleFavorite(listing)">
                        <img :src="listing.isFavorite ? '/fav-filled.png' : '/fav.png'" alt="Улюблене" />
                    </span>
                </div>
                <p class="listing-location">{{ listing.location }}</p>
                <h2 class="listing-price">{{ listing.price }}$</h2>

                <div v-if="editListing || toggleListingStatus || deleteListing" class="actions">
                    <span v-if="editListing" @click.stop="editListing(listing)" class="button">
                        <img src="/edit.png" alt="Редагувати" />
                    </span>
                    <span v-if="toggleListingStatus" @click.stop="toggleListingStatus(listing)" class="button">
                        <img :src="listing.status === 'Active' ? '/archive.png' : '/unarchive.png'"
                            alt="Змінити статус" />
                    </span>
                    <span v-if="deleteListing" @click.stop="deleteListing(listing.id)" class="button">
                        <img src="/delete.png" alt="Видалити" />
                    </span>
                </div>

            </div>
        </div>
    </div>
    <div v-else class="no-listings">Немає доступних оголошень.</div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    listings: {
        type: Array,
        required: true,
    },
    goToListingDetail: {
        type: Function,
        required: false,
    },
    toggleFavorite: {
        type: Function,
        required: false,
    },
    editListing: {
        type: Function,
        required: false,
    },
    toggleListingStatus: {
        type: Function,
        required: false,
    },
    deleteListing: {
        type: Function,
        required: false,
    }
});
</script>