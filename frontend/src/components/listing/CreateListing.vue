<template>
    <div v-if="showModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>Додати оголошення</h2>
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

                <button type="submit">Додати</button>
                <button type="button" @click="emit('close')">Закрити</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getTags, getCategories, createListing, updateListing, getListingById, getListingsByUserId } from '../../services/api/index';
import { useAuthStore } from '../../store/useAuthStore';
import { storage } from '../../services/utils/firebase.config';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const props = defineProps({ showModal: Boolean });
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
const errors = ref({});
const selectedFiles = ref([]);
const userListingsCount = ref(0);

const validateForm = () => {
    errors.value = {};
    if (!formData.value.title.trim()) errors.value.title = 'Заголовок обов’язковий';
    if (!formData.value.location.trim()) errors.value.location = 'Місце обов’язкове';
    if (formData.value.price <= 0) errors.value.price = 'Ціна повинна бути більше 0';
    if (formData.value.area <= 0) errors.value.area = 'Площа повинна бути більше 0';
    if (!formData.value.category_id) errors.value.category_id = 'Оберіть категорію';
    if (formData.value.tags.length > maxTags) errors.value.tags = `Максимум ${maxTags} тегів`;
    if (selectedFiles.value.length < 5 || selectedFiles.value.length > 25) {
        errors.value.photos = 'Дозволено від 5 до 25 фото';
    }
    return Object.keys(errors.value).length === 0;
};

const toggleTag = (tagId) => {
    const index = formData.value.tags.indexOf(tagId);
    if (index === -1) {
        if (formData.value.tags.length < maxTags) {
            formData.value.tags.push(tagId);
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

        formData.value.is_agent_listing = authStore.user?.role === 'agent';

        const listings = await getListingsByUserId(authStore.user?.id);
        userListingsCount.value = listings.length;
    } catch (err) {
        console.error('Error: ', err);
    }
});

const maxFileSizeMB = 2; 
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    selectedFiles.value = [];

    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            errors.value.photos = 'Дозволені лише зображення (JPEG, PNG, WebP).';
            return;
        }

        if (file.size > maxFileSizeMB * 1024 * 1024) {
            errors.value.photos = `Файл ${file.name} перевищує ${maxFileSizeMB}MB.`;
            return;
        }

        selectedFiles.value.push(file);
    }

    if (selectedFiles.value.length > 0) {
        errors.value.photos = '';
    }
};

const handleSubmit = async () => {
    if (userListingsCount.value >= 10) {
        alert('Ви досягли ліміту у 10 оголошень.');
        return;
    }

    if (!validateForm()) return;

    try {
        const data = { ...formData.value, is_agent_listing: true, photos: [] };

        const createdListing = await createListing(data);

        if (!createdListing || !createdListing.id) {
            throw new Error('Помилка створення оголошення.');
        }

        const fileUrls = await uploadFilesToStorage(selectedFiles.value, createdListing.id);

        await updateListingPhotos(createdListing.id, fileUrls);

        emit('save');
        emit('close');
    } catch (err) {
        console.error('Error adding listing:', err);
    }
};

const uploadFilesToStorage = async (files, listingId) => {
    const fileUrls = [];
    for (const file of files) {
        const storagePath = `images/${listingId}/${Date.now()}_${file.name}`;
        const storageReference = storageRef(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageReference, file);

        try {
            await uploadTask;
            const fileURL = await getDownloadURL(storageReference);
            fileUrls.push(fileURL);
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
        }
    }
    return fileUrls;
};

const updateListingPhotos = async (listingId, fileUrls) => {
    try {
        await updateListing(listingId, { photos: fileUrls });
    } catch (error) {
        console.error('Помилка оновлення фото в базі:', error);
    }
};

</script>