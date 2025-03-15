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
import { getTags, getCategories, getListingById, updateListing } from '../../services/api/index';

const props = defineProps({ showEditModal: Boolean, listingId: String });
const emit = defineEmits(['close', 'save']);

const formData = ref({
    title: '',
    location: '',
    price: 0,
    area: 0,
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
    console.log('Listing ID:', props.listingId); 
    try {
        tags.value = await getTags();
        categories.value = await getCategories();
        if (props.listingId) {
            const listing = await getListingById(props.listingId);
            console.log('Listing:', listing);
            Object.assign(formData.value, listing);
        }
    } catch (err) {
        console.error('Error:', err);
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
        await updateListing(props.listingId, { ...formData.value });
        emit('save');
        emit('close');
    } catch (err) {
        console.error('Помилка оновлення оголошення:', err);
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.modal-overlay {
    h2 {
        text-align: center;
    }

    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 8px;
    padding: 20px;
}

.tag-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
}

.tag-item {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f5f5f5;
    cursor: pointer;
    user-select: none;
}

.tag-item.selected {
    background-color: #07484A;
    color: white;
}

form label {
    display: block;
    margin-bottom: 10px;
}

form input,
form select,
form textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    margin-right: 10px;
}

.error {
    color: red;
    font-size: 0.875rem;
    margin-top: 5px;
    display: block;
}
</style>