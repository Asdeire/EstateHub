<template>
    <div class="listing-gallery">
        <img v-if="photos?.length" :src="photos[0]" alt="Main Image" class="main-image" loading="lazy" />
        <img v-else :src="defaultPhoto" alt="Default Image" class="main-image" loading="lazy" />

        <div class="thumbnail-container">
            <template v-if="photos?.length > 1">
                <img v-for="(photo, index) in photos.slice(1, 3)" :key="index" :src="photo" class="thumbnail"
                    loading="lazy" :alt="`Thumbnail ${index + 1}`" />
                <div v-if="photos.length > 4" class="thumbnail overlay" @click="openGallery">
                    <img :src="photos[3]" class="thumbnail" loading="lazy" alt="Additional photos" />
                    <div class="overlay-text">+{{ photos.length - 3 }} фото</div>
                </div>
            </template>
            <template v-else>
                <img :src="defaultPhoto" class="thumbnail" loading="lazy" alt="Default Thumbnail 1" />
                <img :src="defaultPhoto" class="thumbnail" loading="lazy" alt="Default Thumbnail 2" />
            </template>
        </div>

        <button v-if="photos.length > 4" class="gallery-button" @click="openGallery">
            +{{ photos.length - 1 }} фото
        </button>

        <div v-if="showGallery" class="gallery-modal" @click.self="closeGallery">
            <div class="gallery-modal-content">
                <carousel :items-to-show="1" :wrap-around="true" v-model="currentSlide" class="carousel">
                    <slide v-for="(photo, index) in photos" :key="index">
                        <img :src="photo" :alt="`Photo ${index + 1}`" class="carousel-image" loading="lazy" />
                    </slide>

                    <template #addons>
                        <navigation />
                        <pagination />
                    </template>
                </carousel>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Carousel, Slide, Navigation, Pagination } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import defaultPhoto from '../../assets/undefined.png';

const props = defineProps({
    photos: {
        type: Array,
        required: true
    }
});

const showGallery = ref(false);
const currentSlide = ref(0);

const openGallery = () => {
    showGallery.value = true;
    currentSlide.value = 0;
};

const closeGallery = () => {
    showGallery.value = false;
};
</script>

<style scoped>
.listing-gallery {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .gallery-button {
        display: none;
    }

    img {
        object-fit: cover;
    }

    .main-image {
        width: 70%;
        height: 700px;
        border-radius: 10px;

    }

    .thumbnail-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 25%;
        height: 700px;
    }

    .thumbnail {
        width: 100%;
        height: 220px;
        border-radius: 10px;
    }

    .overlay {
        position: relative;
        cursor: pointer;
    }

    .overlay-text {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        border-radius: 10px;

        &:hover {
            background: rgba(0, 0, 0, 0.7);
        }
    }

    @media (max-width:1000px) {
        .main-image {
            width: 100%;
            height: 500px;
            margin-bottom: 20px;
        }

        .thumbnail-container {
            display: none;
        }

        .gallery-button {
            display: block;
        }
    }

    @media (max-width:600px) {
        .main-image {
            height: 300px;
        }
    }
}
</style>