<template>
    <div v-if="showModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>Додати підписку</h2>
            <form @submit.prevent="handleSubmit">
                <label>
                    Тип сповіщень:
                    <select v-model="formData.transport" @change="checkTelegramStatus" required>
                        <option value="EMAIL">Email</option>
                        <option value="TELEGRAM">Telegram</option>
                    </select>
                    <span v-if="errors.transport" class="error">{{ errors.transport }}</span>
                </label>

                <label>
                    Тип нерухомості:
                    <select v-model="formData.filters.type">
                        <option value="">Всі</option>
                        <option value="квартира">Квартира</option>
                        <option value="будинок">Будинок</option>
                        <option value="комерційна">Комерційна</option>
                    </select>
                </label>

                <label>
                    Категорія:
                    <select v-model="formData.filters.category">
                        <option value="">Всі</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </label>

                <label>Теги:</label>
                <div class="tag-container">
                    <div v-for="tag in tags" :key="tag.id" class="tag-item"
                        :class="{ selected: formData.filters.tags.includes(tag.id) }" @click="toggleTag(tag.id)">
                        {{ tag.name }}
                    </div>
                </div>

                <h4>Ціна</h4>
                <div class="range-container">
                    <input type="number" v-model="formData.filters.minPrice" placeholder="Від"
                        @input="limitDigits('minPrice', 9)" />
                    <input type="number" v-model="formData.filters.maxPrice" placeholder="До"
                        @input="limitDigits('maxPrice', 9)" />
                </div>

                <h4>Площа</h4>
                <div class="range-container">
                    <input type="number" v-model="formData.filters.minArea" placeholder="Від"
                        @input="limitDigits('minArea', 6)" />
                    <input type="number" v-model="formData.filters.maxArea" placeholder="До"
                        @input="limitDigits('maxArea', 6)" />
                </div>

                <span v-if="errors.filters" class="error">{{ errors.filters }}</span>

                <button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Створення...' : 'Створити' }}
                </button>
                <button type="button" @click="emit('close')">Закрити</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { createSubscription } from '../../services/api/index';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const props = defineProps({ showModal: Boolean });
const emit = defineEmits(['close', 'save']);
const router = useRouter();

const authStore = useAuthStore();
const dataStore = useDataStore();

const formData = ref({
    transport: 'EMAIL',
    filters: {
        type: '',
        category: '',
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        tags: []
    }
});

const errors = ref({});
const isLoading = ref(false);

const categories = ref([]);
const tags = ref([]);

onMounted(async () => {
    await dataStore.loadData();
    categories.value = dataStore.categories;
    tags.value = dataStore.tags;

    if (authStore.isAuthenticated && authStore.user?.id) {
        await authStore.fetchUser(authStore.user.id);
    } else {
        router.push('/login');
    }
});

const toggleTag = (tagId) => {
    const index = formData.value.filters.tags.indexOf(tagId);
    if (index === -1) {
        formData.value.filters.tags.push(tagId);
    } else {
        formData.value.filters.tags.splice(index, 1);
    }
};

const checkTelegramStatus = async () => {
    if (formData.value.transport !== 'TELEGRAM') return;

    if (!authStore.isAuthenticated || !authStore.user) {
        errors.value.transport = 'Авторизуйтесь для використання Telegram сповіщень';
        router.push('/login');
        return;
    }

    try {
        await authStore.fetchUser(authStore.user.id);

        if (!authStore.user.telegram_username) {
            errors.value.transport = 'Вкажіть Telegram ім\'я у профілі';
            router.push('/profile');
            return;
        }

        if (!authStore.user.telegram_chat_id) {
            errors.value.transport = 'Почніть діалог з ботом у Telegram';
            window.location.href = 'https://t.me/estatehubbot';
            return;
        }
    } catch (err) {
        console.error('Error checking Telegram status:', err);
        errors.value.transport = 'Помилка перевірки Telegram статусу';
    }
};

const validateForm = () => {
    errors.value = {};
    if (!formData.value.transport) {
        errors.value.transport = 'Оберіть тип сповіщень';
    }
    if (!formData.value.filters.type && !formData.value.filters.minPrice && !formData.value.filters.maxPrice
        && !formData.value.filters.minArea && !formData.value.filters.maxArea && formData.value.filters.tags.length === 0) {
        errors.value.filters = 'Введіть хоча б один фільтр';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    if (formData.value.transport === 'TELEGRAM') {
        await checkTelegramStatus();
        if (errors.value.transport) return;
    }

    try {
        isLoading.value = true;
        const createdSubscription = await createSubscription(formData.value);

        if (!createdSubscription || !createdSubscription.id) {
            throw new Error('Помилка створення підписки.');
        }

        emit('save', createdSubscription);
        emit('close');
    } catch (err) {
        console.error('Error creating subscription:', err);

        if (err.response?.status === 400 && err.response?.data?.message === 'Max subscriptions reached') {
            errors.value.filters = 'Ви не можете мати більше 4 підписок';
            return;
        }

        await Swal.fire({
            icon: 'error',
            title: 'Помилка',
            text: err.response?.data?.message || err.message || 'Невідома помилка',
        });
    }
    finally {
        isLoading.value = false;
    }
};

const limitDigits = (field, maxDigits) => {
    let value = String(formData.value.filters[field]);
    if (value.length > maxDigits) {
        value = value.slice(0, maxDigits);
        formData.value.filters[field] = Number(value);
    }
};
</script>