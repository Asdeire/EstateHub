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
                            <input type="text" placeholder="Ввести напрямок" v-model="location"/>
                        </div>

                        <input type="text" placeholder="Ціна" v-model="price"/>
                        <input type="text" placeholder="Площа" v-model="area"/>

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
    </div>
    <Footer />
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const location = ref('');
const price = ref('');
const area = ref('');
const selectedType = ref('');

const router = useRouter();

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

</script>