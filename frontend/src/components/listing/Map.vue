<template>
    <div class="map-container">
        <h2 class="map-title">{{ location }}</h2>
        <div v-if="coords" class="map">
            <l-map :zoom="13" :center="coords" class="map">
                <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <l-marker :lat-lng="coords" @click="openMap"></l-marker>
            </l-map>
        </div>
        <p v-else class="no-location">Дані про місцезнаходження відсутні.</p>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import axios from "axios";

const props = defineProps({
    location: String,
});

const coords = ref(null);

const fetchCoordinates = async (address) => {
    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
                q: address,
                format: "json",
                limit: 1
            }
        });

        if (response.data.length > 0) {
            coords.value = [
                parseFloat(response.data[0].lat),
                parseFloat(response.data[0].lon)
            ];
        } else {
            console.warn("Coordinates not found");
        }
    } catch (err) {
        console.error("Error fetching coordinates:", err);
    }
};

watch(() => props.location, (newLocation) => {
    if (newLocation) {
        fetchCoordinates(newLocation);
    }
}, { immediate: true });

const openMap = () => {
    if (coords.value) {
        const [lat, lon] = coords.value;
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
    }
};
</script>

<style scoped>
.map-container {
    width: 70%;
    height: 450px;

    .map-title {
        height: 10%;
        margin: 0;
    }

    .map {
        border-radius: 10px;
        height: 90%;
    }

    @media (max-width: 768px) {
        width: 100%;
        margin-top: 10px;
    }
}
</style>