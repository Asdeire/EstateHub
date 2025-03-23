<template>
    <div v-if="props.showEditModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>Редагування оголошення</h2>
            <form @submit.prevent="handleSubmit">
                <label>
                    Заголовок:
                    <input v-model="formData.title" placeholder="Заголовок" required />
                    <span v-if="errors.title" class="error">{{ errors.title }}</span>
                </label>

                <label>
                    Місце:
                    <input v-model="formData.location" placeholder="Місто, вул. Вулиця, номер" required />
                    <span v-if="errors.location" class="error">{{ errors.location }}</span>
                </label>

                <label>
                    Ціна:
                    <input v-model.number="formData.price" type="number" placeholder="Ціна" required />
                    <span v-if="errors.price" class="error">{{ errors.price }}</span>
                </label>

                <label>
                    Площа (м²):
                    <input v-model.number="formData.area" type="number" placeholder="Площа" required />
                    <span v-if="errors.area" class="error">{{ errors.area }}</span>
                </label>

                <label>
                    Тип нерухомості:
                    <select v-model="formData.type" required>
                        <option value="квартира">Квартира</option>
                        <option value="будинок">Будинок</option>
                        <option value="комерційна">Комерційна</option>
                    </select>
                    <span v-if="errors.type" class="error">{{ errors.type }}</span>
                </label>

                <label>
                    Опис:
                    <textarea v-model="formData.description" placeholder="Опис"></textarea>
                </label>

                <label for="tags">Теги:</label>
                <div class="tag-container">
                    <div v-for="tag in tags" :key="tag.id" class="tag-item"
                        :class="{ selected: formData.tags.includes(tag.id) }" @click="toggleTag(tag.id)">
                        {{ tag.name }}
                    </div>
                </div>
                <span v-if="errors.tags" class="error">{{ errors.tags }}</span>

                <label>Категорія:
                    <select v-model="formData.category_id" required>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                    <span v-if="errors.category_id" class="error">{{ errors.category_id }}</span>
                </label>

                <label>
                    Фото:
                    <input type="file" multiple @change="handleFileUpload" />
                    <span v-if="errors.photos" class="error">{{ errors.photos }}</span>
                </label>

                <button type="submit" :disabled="isLoading">
                    {{ isLoading ? 'Збереження...' : 'Зберегти' }}
                </button>
                <button type="button" @click="emit('close')">Скасувати</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTags, getCategories, updateListing } from '../../services/api/index';

const props = defineProps({
    showEditModal: Boolean,
    listing: Object
});
const emit = defineEmits(['close', 'save']);

const formData = ref({
    title: '',
    location: '',
    price: 0,
    area: 0,
    type: '',
    description: '',
    photos: [],
    category_id: '',
    tags: [],
});

const tags = ref([]);
const categories = ref([]);
const errors = ref({});
const selectedFiles = ref([]);
const maxTags = 5;

const validateForm = () => {
    errors.value = {};
    if (!formData.value.title.trim()) errors.value.title = 'Заголовок обов’язковий';
    if (!formData.value.location.trim()) errors.value.location = 'Місце обов’язкове';
    if (formData.value.price <= 0) errors.value.price = 'Ціна повинна бути більше 0';
    if (formData.value.area <= 0) errors.value.area = 'Площа повинна бути більше 0';
    if (!formData.value.type) errors.value.type = 'Тип нерухомості обов’язковий';
    if (!formData.value.category_id) errors.value.category_id = 'Оберіть категорію';
    if (formData.value.tags.length > maxTags) errors.value.tags = `Максимум ${maxTags} тегів`;
    return Object.keys(errors.value).length === 0;
};

const toggleTag = (tagId) => {
    const index = formData.value.tags.indexOf(tagId);
    if (index === -1) {
        if (formData.value.tags.length < maxTags) formData.value.tags.push(tagId);
    } else {
        formData.value.tags.splice(index, 1);
    }
};

onMounted(async () => {
    try {
        tags.value = await getTags();
        categories.value = await getCategories();
        if (props.listing) {
            Object.assign(formData.value, {
                ...props.listing,
                tags: props.listing.tags.map(tag => tag.id)
            });
        }
    } catch (err) {
        console.error('Error loading tags or categories:', err);
    }
});

const handleFileUpload = (event) => {
    selectedFiles.value = Array.from(event.target.files);
};

const isLoading = ref(false);

const handleSubmit = async () => {
    if (!validateForm()) return;
    isLoading.value = true;
    try {
        const updatedData = { ...formData.value };
        if (selectedFiles.value.length > 0) {
            updatedData.photos = selectedFiles.value;
        }
        await updateListing(props.listing.id, updatedData);
        emit('save', updatedData);
        emit('close');
    } catch (err) {
        console.error('Помилка оновлення оголошення:', err);
    } finally {
        isLoading.value = false;
    }
};
</script>