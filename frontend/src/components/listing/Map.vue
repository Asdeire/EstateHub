<template>
    <div class="map-container">
        <h2 class="map-title">{{ currentListing?.location }}</h2>
        <div v-if="mainCoords" class="map">
            <l-map :zoom="13" :center="mainCoords" class="map">
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <l-marker :lat-lng="mainCoords" :icon="customIcon" @click="openMap(mainCoords)">
                    <l-tooltip>
                        Поточне
                    </l-tooltip>
                </l-marker>

                <l-marker v-for="listing in nearbyCoords" :key="listing.id" :lat-lng="listing.coords"
                    :icon="customSecondIcon" @click="goToListing(listing.id)">
                    <l-tooltip>
                        <div style="max-width: 220px;">
                            <strong>{{ listing.title }}</strong>
                            <p>{{ listing.price }} грн</p>
                            <p style="font-size: 0.9em;">{{ listing.area }} м² &mdash; {{ listing.type }}</p>
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
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";
import LocationIcon from "../../assets/loc-light.png";
import SecondaryLocationIcon from "../../assets/loc.png";
import L from "leaflet";
import axios from "axios";

const props = defineProps({
    currentListing: Object,
    nearbyListings: Array,
});

const customIcon = L.icon({
    iconUrl: LocationIcon,
    iconSize: [24, 24],
    popupAnchor: [0, -14]
});

const customSecondIcon = L.icon({
    iconUrl: SecondaryLocationIcon,
    iconSize: [24, 24],
    popupAnchor: [0, -14]
});

const mainCoords = ref(null);
const nearbyCoords = ref([]);
const router = useRouter();

const fetchCoords = async (address) => {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: address, format: "json", limit: 1 }
    });
    if (res.data.length > 0) {
        return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
    }
    return null;
};

const loadAllCoordinates = async () => {
    if (props.currentListing?.location) {
        mainCoords.value = await fetchCoords(props.currentListing.location);
    }

    const nearby = await Promise.all(
        props.nearbyListings.map(async (item) => {
            const coords = await fetchCoords(item.location);
            return coords ? { id: item.id, title: item.title, coords, price: item.price, area: item.area, type: item.type, location: item.location } : null;
        })
    );

    nearbyCoords.value = nearby.filter(Boolean);
};

watch(() => props.currentListing, loadAllCoordinates, { immediate: true });

const openMap = (coords) => {
    const [lat, lon] = coords;
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
};

const goToListing = (id) => {
    router.push(`/listings/${id}`);
};
</script>

<style scoped>
.map-container {
    width: 70%;
    height: fit-content;

    .map-title {
        height: auto;
        margin-bottom: 10px;
    }

    .map {
        border-radius: 10px;
        height: 400px;
    }

    @media (max-width: 768px) {
        width: 100%;
        margin-top: 10px;
    }
}
</style>