<template>
    <div :class="mapContainerClass">
        <h2 class="map-title">{{ currentListing?.location }}</h2>

        <div v-if="isLoading" class="loading">
            Завантаження карти...
        </div>

        <div v-else-if="mapCenter" :class="mapClass">
            <l-map :zoom="13" :center="mapCenter" class="leaflet-map">
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <l-marker v-if="mainCoords" :lat-lng="mainCoords" :icon="customIcon" @click="openMap(mainCoords)">
                    <l-tooltip>Поточне</l-tooltip>
                </l-marker>

                <l-marker v-for="listing in nearbyCoords" :key="listing.id" :lat-lng="listing.coords"
                    :icon="customSecondIcon" @click="goToListing(listing.id)">
                    <l-tooltip>
                        <div style="max-width: 220px;">
                            <strong>{{ listing.title }}</strong>
                            <p>{{ listing.price }} грн</p>
                            <p style="font-size: 0.9em;">
                                {{ listing.area }} м² &mdash; {{ listing.type }}
                            </p>
                            <p style="font-size: 0.85em; color: #666;">{{ listing.location }}</p>
                        </div>
                    </l-tooltip>
                </l-marker>
            </l-map>
        </div>

        <p v-else class="no-location">Дані про місцезнаходження відсутні.</p>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LTooltip } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import axios from 'axios';

import LocationIcon from '../../assets/loc-light.png';
import SecondaryLocationIcon from '../../assets/loc.png';

const props = defineProps({
    currentListing: Object,
    nearbyListings: Array,
    styleVariant: {
        type: String,
        default: 'default',
    },
});

const customIcon = L.icon({
    iconUrl: LocationIcon,
    iconSize: [24, 24],
    popupAnchor: [0, -14],
});

const customSecondIcon = L.icon({
    iconUrl: SecondaryLocationIcon,
    iconSize: [24, 24],
    popupAnchor: [0, -14],
});

const mainCoords = ref(null);
const nearbyCoords = ref([]);
const isLoading = ref(true);
const router = useRouter();

const fetchCoords = async (address) => {
    if (!address) return null;
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
        const res = await axios.get(url);
        if (res.data.features && res.data.features.length > 0) {
            const coords = res.data.features[0].geometry.coordinates;
            return [coords[1], coords[0]];
        }
        return null;
    } catch (error) {
        console.error('Помилка при fetchCoords Photon:', error);
        return null;
    }
};

const loadAllCoordinates = async () => {
    isLoading.value = true;

    if (props.currentListing?.location) {
        mainCoords.value = await fetchCoords(props.currentListing.location);
    } else {
        mainCoords.value = null;
    }

    const nearby = await Promise.all(
        props.nearbyListings.map(async (item) => {
            const coords = await fetchCoords(item.location);
            return coords
                ? {
                    id: item.id,
                    title: item.title,
                    coords,
                    price: item.price,
                    area: item.area,
                    type: item.type,
                    location: item.location,
                }
                : null;
        })
    );

    nearbyCoords.value = nearby.filter(Boolean);
    isLoading.value = false;
};

watch(
    () => [props.currentListing, props.nearbyListings],
    loadAllCoordinates,
    { immediate: true }
);

const mapCenter = computed(() => {
    if (mainCoords.value) return mainCoords.value;
    if (nearbyCoords.value.length > 0) return nearbyCoords.value[0].coords;
    return null;
});

const mapContainerClass = computed(() =>
    props.styleVariant === 'compact' ? 'map-container compact' : 'map-container default'
);

const mapClass = computed(() =>
    props.styleVariant === 'compact' ? 'map small' : 'map'
);

const openMap = (coords) => {
    const [lat, lon] = coords;
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
};

const goToListing = (id) => {
    router.push(`/listings/${id}`);
};
</script>

<style scoped>
.map-container.default {
    width: 100vw;
    height: 85vh;
    display: flex;
    justify-content: center;

    @media(max-width: 768px) {
        height: 70vh;
    }
}

.map-container.compact {
    width: 70%;
    border-radius: 10px;

    @media (max-width: 1000px) {
        width: 100%;
    }
}

.map-title {
    margin-bottom: 10px;
    font-size: 1.2em;
    font-weight: 600;
}

.map {
    border-radius: 10px;
    width: 90%;
}

.map.small {
    height: 400px;
    width: 100%;
}

.loading {
    color: #888;
    font-style: italic;
    align-self: center;
}

.no-location {
    font-weight: 500;
    align-self: center;
}
</style>
