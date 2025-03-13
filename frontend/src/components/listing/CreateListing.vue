<template>
    <div v-if="showModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>Додати оголошення</h2>
            <form @submit.prevent="handleSubmit">
                <label>
                    Заголовок:
                    <input v-model="formData.title" placeholder="Заголовок" required />
                </label>

                <label>
                    Місце:
                    <input v-model="formData.location" placeholder="Місце" required />
                </label>

                <label>
                    Ціна:
                    <input v-model="formData.price" type="number" placeholder="Ціна" required />
                </label>

                <label>
                    Площа (м²):
                    <input v-model="formData.area" type="number" placeholder="Площа" required />
                </label>

                <label>
                    Тип нерухомості:
                    <select v-model="formData.type" required>
                        <option value="квартира">Квартира</option>
                        <option value="будинок">Будинок</option>
                        <option value="комерційна">Комерційна</option>
                    </select>
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

                <label>Категорія
                    <select v-model="formData.category_id">
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </label>


                <label>
                    Фото:
                    <input type="file" multiple @change="handleFileUpload" />
                </label>

                <button type="submit">Додати</button>
                <button type="button" @click="emit('close')">Закрити</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTags, getCategories, createListing } from '../../services/api/index';
import { useAuthStore } from '../../store/useAuthStore';

const props = defineProps({
    showModal: Boolean
});

const emit = defineEmits(['close', 'save']);
const authStore = useAuthStore(); 

const formData = ref({
    user_id: '',
    is_agent_listing: false,
    title: '',
    location: '',
    price: 0,
    area: 0,
    description: '',
    photos: [],
    status: 'Active',
    category_id: '',
    tags: [],
});

const tags = ref([]);
const categories = ref([]);
const maxTags = 5;

const toggleTag = (tagId) => {
    const index = formData.value.tags.indexOf(tagId);
    if (index === -1) {
        if (formData.value.tags.length < maxTags) {
            formData.value.tags.push(tagId); 
        } else {
            alert(`Ви можете обрати максимум ${maxTags} тегів.`);
        }
    } else {
        formData.value.tags.splice(index, 1); 
    }
};

onMounted(async () => {
    try {
        tags.value = await getTags();
        categories.value = await getCategories();
        formData.value.user_id = authStore.user?.id || '';
    } catch (err) {
        console.error('Не вдалося завантажити', err);
    }
});

const handleSubmit = async () => {
    try {
        const data = {
            ...formData.value,
            category_id: formData.value.category_id,
            tags: formData.value.tags.map(tag => ({ id: tag })),
            is_agent_listing: true
        };
        console.log('Data:', data);
        await createListing(data);
        emit('save');
        emit('close');
    } catch (err) {
        console.error('Помилка при створенні оголошення:', err);
    }
};

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    formData.value.photos = files.map(file => URL.createObjectURL(file));
};
</script>

<style scoped>
.modal-overlay {
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
    background-color: #007bff;
    color: white;
    border-color: #007bff;
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
</style>