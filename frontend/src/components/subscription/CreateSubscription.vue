<template>
    <div v-if="showModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>Додати підписку</h2>
            <form @submit.prevent="handleSubmit">
                <label>
                    Тип сповіщень:
                    <select v-model="formData.transport" required>
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

                <label>Ціна (від - до):</label>
                <div>
                    <input type="number" v-model="formData.filters.minPrice" placeholder="Від" />
                    <input type="number" v-model="formData.filters.maxPrice" placeholder="До" />
                </div>

                <label>Площа (від - до):</label>
                <div>
                    <input type="number" v-model="formData.filters.minArea" placeholder="Від" />
                    <input type="number" v-model="formData.filters.maxArea" placeholder="До" />
                </div>

                <label>Теги:</label>
                <div class="tag-container">
                    <div v-for="tag in tags" :key="tag.id" class="tag-item"
                        :class="{ selected: formData.filters.tags.includes(tag.id) }"
                        @click="toggleTag(tag.id)">
                        {{ tag.name }}
                    </div>
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
import { useDataStore } from '../../store/useDataStore'; 
import { createSubscription } from '../../services/api/index'; 

const props = defineProps({ showModal: Boolean });
const emit = defineEmits(['close', 'save']);

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

const dataStore = useDataStore();
const categories = ref([]);
const tags = ref([]);

onMounted(async () => {
    await dataStore.loadData();
    categories.value = dataStore.categories;
    tags.value = dataStore.tags;
});

const toggleTag = (tagId) => {
    const index = formData.value.filters.tags.indexOf(tagId);
    if (index === -1) {
        formData.value.filters.tags.push(tagId);
    } else {
        formData.value.filters.tags.splice(index, 1);
    }
};

const validateForm = () => {
    errors.value = {};
    if (!formData.value.transport) errors.value.transport = 'Оберіть тип сповіщень';
    if (!formData.value.filters.type && !formData.value.filters.minPrice && !formData.value.filters.maxPrice
        && !formData.value.filters.minArea && !formData.value.filters.maxArea && formData.value.filters.tags.length === 0) {
        errors.value.filters = 'Введіть хоча б один фільтр';
    }
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

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
        alert('Помилка при створенні підписки: ' + (err.message || 'Невідома помилка'));
    } finally {
        isLoading.value = false;
    }
};
</script>
