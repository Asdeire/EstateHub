<template>
    <Header />
    <div class="about">
        <div class="about-image">
            <img src="../assets/about.png" alt="About Us" />
        </div>
        <div class="about-info">
            <h1>Про нас</h1>
            <p>Ми — команда професіоналів, що прагне створювати інноваційні рішення для наших клієнтів. Від створення
                продуктів до забезпечення бездоганної підтримки — ми завжди орієнтовані на результат.</p>
            <p>Наше завдання — забезпечити максимально зручний та ефективний сервіс, що допомагає вам досягти ваших
                цілей. Ми віримо в високі стандарти якості та постійний розвиток.</p>
            <p>З нами ви можете бути впевнені в надійності та професіоналізмі. Ми працюємо для того, щоб зробити ваш
                досвід використання наших послуг приємним та безперешкодним.</p>

        </div>
    </div>
    <Footer />
</template>

<script setup lang="ts">
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.about {
    width: 100vw;
    min-height: 85vh;
    margin-top: 50px;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 150px;

    .about-image {
        width: 50%;

        img {
            width: 100%;
            height: auto;
            filter: grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(150%) brightness(0.5);
        }
    }

    .about-info {
        h1 {
            font-size: 64px;
        }

        p {
            font-size: 20px;
        }

        width: 50%;
    }

    @media (max-width: 1000px) {
        padding: 0 20px;

        .about-info {
            h1 {
                font-size: 36px;
            }

            p {
                font-size: 18px;
            }
        }
    }

    @media (max-width: 800px) {
        flex-direction: column;
        gap: 10px;

        .about-image {
            width: 100%;

            img {
                width: 100%;
            }
        }

        .about-info {
            h1 {
                text-align: center;
            }

            width: 100%;
        }
    }
}
</style>