<template>
    <Header />
    <div class="home-page">
        <section class="hero-section">
            <img class="hero-image" src="../assets/background.png" alt="Житло мрії" />
            <div class="overlay">
                <h1 class="title">Знайдіть житло<br /> своєї мрії</h1>
                <div class="search-bar-wrapper">
                    <div class="search-bar">
                        <div class="input-with-icon">
                            <span class="icon"><img src="../assets/location.png"></span>
                            <input type="text" placeholder="Ввести напрямок" v-model="location" />
                        </div>
                        <input type="text" placeholder="Ціна" v-model="price" />
                        <input type="text" placeholder="Площа" v-model="area" />
                        <select v-model="selectedType">
                            <option value="">Тип нерухомості</option>
                            <option value="квартира">Квартира</option>
                            <option value="будинок">Будинок</option>
                            <option value="комерційна">Комерційна</option>
                        </select>
                    </div>
                    <button class="search-button" @click="handleSearch">Пошук</button>
                </div>
            </div>
        </section>

        <section class="new-listings-section">
            <h2 class="section-title">Нові оголошення</h2>
            <div class="listings-slider" ref="slider" @scroll="updateScrollPosition">
                <div class="listings-grid">
                    <div v-for="listing in recentListings" :key="listing.id" class="listing-card"
                        @click="goToListingDetail(listing.id)">
                        <img :src="listing.image" alt="Listing image" class="listing-image" />
                        <h3 class="listing-title">{{ listing.title }}</h3>
                        <p class="listing-description">{{ listing.description }}</p>
                        <p class="listing-price">{{ listing.price }}</p>
                    </div>
                </div>
            </div>
            <div class="pagination-wrapper">
                <div class="scroll-bar" ref="scrollBar" @mousedown="startDragging" @mousemove="dragThumb"
                    @mouseup="stopDragging" @mouseleave="stopDragging">
                    <div class="scroll-thumb" ref="scrollThumb"
                        :style="{ left: thumbPosition + '%', width: thumbWidth + '%' }"></div>
                </div>
                <div class="nav-controls">
                    <button class="nav-button prev" @click="scrollPrev" :disabled="currentSlide === 0">
                        <span><</span>
                    </button>
                    <button class="nav-button next" @click="scrollNext" :disabled="currentSlide >= maxSlides - 1">
                        <span>></span>
                    </button>
                </div>
                <button class="view-all-button" @click="goToListings">Дивитись всі</button>
            </div>
        </section>

        <section class="advantages-section">
            <h2 class="section-title">Наші переваги</h2>
            <div class="advantages-cards">
                <div class="advantages-card">
                    <img src="../assets/check.png" alt="Перевірено" class="card-icon" />
                    <h3>Перевірено житло</h3>
                    <p>Кожне оголошення проходить ретельну перевірку.</p>
                </div>
                <div class="advantages-card">
                    <img src="../assets/cloud.png" alt="Безпека" class="card-icon" />
                    <h3>Безліч оголошень</h3>
                    <p>Ви зможете знайти нерухомість на любий смак.</p>
                </div>
                <div class="advantages-card">
                    <img src="../assets/headphones.png" alt="Служба підтримки" class="card-icon" />
                    <h3>Служба підтримки</h3>
                    <p>24/7 підтримка для наших клієнтів.</p>
                </div>
            </div>
        </section>
    </div>
    <Footer />
</template>

<script setup>
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getActiveListings } from '../services/api/index';

const location = ref('');
const price = ref('');
const area = ref('');
const selectedType = ref('');

const recentListings = ref([]);

const slider = ref(null);
const scrollBar = ref(null);
const scrollThumb = ref(null);
const currentSlide = ref(0);
const thumbPosition = ref(0);
const thumbWidth = ref(0);
const listingsPerSlide = ref(0);
const maxSlides = ref(0);
const isDragging = ref(false);
let dragStartX = 0;

const router = useRouter();

const goToListingDetail = (listingId) => {
    router.push({ name: 'ListingDetail', params: { id: listingId } });
};

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const calculateSliderMetrics = () => {
    if (slider.value) {
        const sliderWidth = slider.value.clientWidth;
        const cardWidth = 400 + 20;
        listingsPerSlide.value = Math.floor(sliderWidth / cardWidth);
        if (listingsPerSlide.value < 1) listingsPerSlide.value = 1;
        maxSlides.value = Math.ceil(recentListings.value.length / listingsPerSlide.value);

        const visibleWidth = listingsPerSlide.value * cardWidth;
        const totalWidth = recentListings.value.length * cardWidth;
        thumbWidth.value = (visibleWidth / totalWidth) * 100;
        if (thumbWidth.value > 100) thumbWidth.value = 100;
        if (thumbWidth.value < 5) thumbWidth.value = 5;

        updateScrollPosition();
    }
};

onMounted(async () => {
    try {
        const data = await getActiveListings(1, 8);
        recentListings.value = data.listings.map(listing => ({
            id: listing.id,
            image: listing.photos && listing.photos.length > 0 ? listing.photos[0] : 'https://via.placeholder.com/300x200',
            title: listing.title,
            description: listing.location,
            price: `$${listing.price}`
        }));
        calculateSliderMetrics();
    } catch (error) {
        console.error('Error fetching recent listings:', error);
        recentListings.value = [];
    }

    window.addEventListener('resize', calculateSliderMetrics);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', calculateSliderMetrics);
    document.removeEventListener('mousemove', dragThumb);
    document.removeEventListener('mouseup', stopDragging);
});

const updateScrollPosition = debounce(() => {
    if (slider.value) {
        const scrollLeft = slider.value.scrollLeft;
        const scrollWidth = slider.value.scrollWidth - slider.value.clientWidth;
        if (scrollWidth > 0) {
            const scrollRatio = scrollLeft / scrollWidth;
            const thumbRange = 100 - thumbWidth.value;
            thumbPosition.value = scrollRatio * thumbRange;
        } else {
            thumbPosition.value = 0;
        }
        currentSlide.value = Math.round(scrollLeft / (slider.value.scrollWidth / maxSlides.value));
    }
}, 10);

const startDragging = (event) => {
    event.preventDefault();
    isDragging.value = true;
    dragStartX = event.clientX;
    document.addEventListener('mousemove', dragThumb);
    document.addEventListener('mouseup', stopDragging);
};

const dragThumb = (event) => {
    if (!isDragging.value || !scrollBar.value || !slider.value) return;

    const rect = scrollBar.value.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const barWidth = rect.width;

    let newPosition = (offsetX / barWidth) * 100;
    const thumbRange = 100 - thumbWidth.value;
    newPosition = Math.max(0, Math.min(thumbRange, newPosition));
    thumbPosition.value = newPosition;

    const scrollWidth = slider.value.scrollWidth - slider.value.clientWidth;
    const scrollRatio = newPosition / thumbRange;
    const newScrollLeft = scrollRatio * scrollWidth;
    slider.value.scrollLeft = newScrollLeft;

    currentSlide.value = Math.round(newScrollLeft / (slider.value.scrollWidth / maxSlides.value));
};

const stopDragging = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', dragThumb);
    document.removeEventListener('mouseup', stopDragging);
};

const scrollPrev = () => {
    if (currentSlide.value > 0) {
        currentSlide.value--;
        const slideWidth = slider.value.scrollWidth / maxSlides.value;
        slider.value.scrollTo({
            left: slideWidth * currentSlide.value,
            behavior: 'smooth'
        });
    }
};

const scrollNext = () => {
    if (currentSlide.value < maxSlides.value - 1) {
        currentSlide.value++;
        const slideWidth = slider.value.scrollWidth / maxSlides.value;
        slider.value.scrollTo({
            left: slideWidth * currentSlide.value,
            behavior: 'smooth'
        });
    }
};

const handleSearch = () => {
    router.push({
        path: '/listings',
        query: {
            location: location.value,
            price: price.value,
            area: area.value,
            type: selectedType.value
        }
    });
};

const goToListings = () => {
    router.push('/listings');
};
</script>