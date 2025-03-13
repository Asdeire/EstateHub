<template>
    <div v-if="showModal" class="modal-overlay" @click="emit('close')">
        <div class="modal" @click.stop>
            <h2>{{ isEditMode ? 'Редагувати оголошення' : 'Додати оголошення' }}</h2>
            <form @submit.prevent="handleSubmit">
                <input v-model="formData.title" placeholder="Заголовок" required />
                <input v-model="formData.location" placeholder="Місце" required />
                <input v-model="formData.price" type="number" placeholder="Ціна" required />
                <input v-model="formData.area" type="number" placeholder="Площа (м²)" required />
                <select v-model="formData.type" required>
                    <option value="квартира">Квартира</option>
                    <option value="будинок">Будинок</option>
                    <option value="комерційна">Комерційна</option>
                </select>
                <textarea v-model="formData.description" placeholder="Опис"></textarea>
                <input v-model="formData.tags" placeholder="Теги (через кому)" />

                <input type="file" multiple @change="handleFileUpload" />

                <button type="submit">{{ isEditMode ? 'Зберегти' : 'Додати' }}</button>
                <button type="button" @click="emit('close')">Закрити</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
    showModal: {
        type: Boolean,
        required: true
    },
    isEditMode: {
        type: Boolean,
        default: false
    },
    modalData: {
        type: Object,
        default: () => ({
            id: null,
            user_id: '',
            is_agent_listing: false,
            title: '',
            location: '',
            price: 0,
            area: 0,
            description: '',
            photos: [],
            tags: [],
            status: 'Active',
            category_id: ''
        })
    }
});

const emit = defineEmits(['close', 'save']);
const formData = ref({ ...props.modalData });

const handleSubmit = () => {
    formData.value.tags = formData.value.tags
        ? formData.value.tags.split(',').map(tag => tag.trim())
        : [];
    emit('save', formData.value);
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
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
}

form input,
form select,
form textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    margin-right: 10px;
}
</style>
