<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal" @click.stop>
            <h2>Фільтри</h2>
            <div class="filter-options">
                <label>
                    Тип нерухомості:
                    <select v-model="localSelectedType">
                        <option value="">Всі</option>
                        <option value="квартира">Квартира</option>
                        <option value="будинок">Будинок</option>
                        <option value="комерційна">Комерційна</option>
                    </select>
                </label>

                <label>Категорія</label>
                <select v-model="localSelectedCategory">
                    <option value="">Всі</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>

                <label>
                    Перевірені:
                    <select v-model="localIsVerified">
                        <option value="">Усі</option>
                        <option value="true">Тільки перевірені</option>
                        <option value="false">Тільки не перевірені</option>
                    </select>
                </label>

                <label>Теги</label>
                <div class="tag-container">
                    <div v-for="tag in tags" :key="tag.id" class="tag-item"
                        :class="{ selected: localSelectedTags.includes(tag.id) }" @click="toggleTag(tag.id)">
                        {{ tag.name }}
                    </div>
                </div>

                <h4>Ціна ($)</h4>
                <div class="range-container">
                    <input type="number" v-model="localPriceMin" placeholder="Від"
                        @input="restrictInput($event, 'localPriceMin', 10)" />
                    <input type="number" v-model="localPriceMax" placeholder="До"
                        @input="restrictInput($event, 'localPriceMax', 10)" />
                </div>

                <h4>Площа (м²)</h4>
                <div class="range-container">
                    <input type="number" v-model="localAreaMin" placeholder="Від"
                        @input="restrictInput($event, 'localAreaMin', 10)" />
                    <input type="number" v-model="localAreaMax" placeholder="До"
                        @input="restrictInput($event, 'localAreaMax', 10)" />
                </div>

                <div class="filter-buttons">
                    <button @click="applyFilters">Застосувати</button>
                    <button @click="clearFilters">Очистити</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Category, Tag } from '../../stores/dataStore';

const props = defineProps<{
    categories: Category[];
    tags: Tag[];
    selectedType: string;
    selectedCategory: string;
    selectedIsVerified: string;
    selectedTags: string[];
    priceMin: number | null;
    priceMax: number | null;
    areaMin: number | null;
    areaMax: number | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'apply', filters: Record<string, any>): void;
    (e: 'clear'): void;
}>();

const localSelectedType = ref<string>(props.selectedType);
const localSelectedCategory = ref<string>(props.selectedCategory);
const localSelectedTags = ref<string[]>([...props.selectedTags]);
const localPriceMin = ref<number | null>(props.priceMin);
const localPriceMax = ref<number | null>(props.priceMax);
const localAreaMin = ref<number | null>(props.areaMin);
const localAreaMax = ref<number | null>(props.areaMax);
const localIsVerified = ref<string>('');

watch(() => props.selectedType, (value) => (localSelectedType.value = value));
watch(() => props.selectedCategory, (value) => (localSelectedCategory.value = value));
watch(() => props.selectedIsVerified, (value) => { localIsVerified.value = value; });
watch(() => props.selectedTags, (value) => (localSelectedTags.value = [...value]));
watch(() => props.priceMin, (value) => (localPriceMin.value = value));
watch(() => props.priceMax, (value) => (localPriceMax.value = value));
watch(() => props.areaMin, (value) => (localAreaMin.value = value));
watch(() => props.areaMax, (value) => (localAreaMax.value = value));

const toggleTag = (tagId: string) => {
    if (localSelectedTags.value.includes(tagId)) {
        localSelectedTags.value = localSelectedTags.value.filter((id) => id !== tagId);
    } else {
        localSelectedTags.value.push(tagId);
    }
};

const restrictInput = (event: Event, field: string, maxLength: number) => {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9]/g, '');

    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }

    if (field === 'localPriceMin') {
        localPriceMin.value = value ? parseInt(value) : null;
    } else if (field === 'localPriceMax') {
        localPriceMax.value = value ? parseInt(value) : null;
    } else if (field === 'localAreaMin') {
        localAreaMin.value = value ? parseInt(value) : null;
    } else if (field === 'localAreaMax') {
        localAreaMax.value = value ? parseInt(value) : null;
    }

    input.value = value;
};

const applyFilters = () => {
    const filters = {
        type: localSelectedType.value,
        category: localSelectedCategory.value,
        tags: localSelectedTags.value,
        minPrice: localPriceMin.value,
        maxPrice: localPriceMax.value,
        minArea: localAreaMin.value,
        maxArea: localAreaMax.value,
        is_verified:
            localIsVerified.value === ''
                ? undefined
                : localIsVerified.value === 'true',

    };
    emit('apply', filters);
    emit('close');
};

const clearFilters = () => {
    localSelectedType.value = '';
    localSelectedCategory.value = '';
    localSelectedTags.value = [];
    localPriceMin.value = null;
    localPriceMax.value = null;
    localAreaMin.value = null;
    localAreaMax.value = null;
    localIsVerified.value = '';
    emit('clear');
    emit('close');
};
</script>