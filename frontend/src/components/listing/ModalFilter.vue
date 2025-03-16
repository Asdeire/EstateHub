<template>
    <div v-if="show" class="modal-overlay" @click="emit('update:show', false)">
        <div class="modal" @click.stop>
            <h2>Фільтри</h2>

            <label>Тип нерухомості:
                <select v-model="localFilters.type">
                    <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
                </select>
            </label>

            <label>Теги:</label>
            <div class="tag-container">
                <div v-for="tag in tags" :key="tag.id" class="tag-item"
                    :class="{ selected: localFilters.tags.includes(tag.id) }" @click="toggleTag(tag.id)">
                    {{ tag.name }}
                </div>
            </div>

            <label>Категорія:</label>
            <select v-model="localFilters.category">
                <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </select>

            <label>Ціна (USD):</label>
            <div class="range-container">
                <input type="number" v-model.number="localFilters.priceMin" placeholder="Від">
                <input type="number" v-model.number="localFilters.priceMax" placeholder="До">
            </div>

            <label>Площа (м²):</label>
            <div class="range-container">
                <input type="number" v-model.number="localFilters.areaMin" placeholder="Від">
                <input type="number" v-model.number="localFilters.areaMax" placeholder="До">
            </div>

            <div class="button-container">
                <button @click="applyFilters" class="apply-button">Застосувати ({{ filteredCount }})</button>
                <button @click="resetFilters" class="reset-button">Очистити</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watchEffect } from "vue";
import { getTags, getCategories, getListings } from "../../services/api/index";

const props = defineProps(["show", "selectedType", "selectedTags", "selectedCategory", "uniqueTypes"]);
const emit = defineEmits([
    "update:show",
    "update:selectedType",
    "update:selectedTags",
    "update:selectedCategory",
    "update:selectedMinPrice",
    "update:selectedMaxPrice",
    "update:selectedMinArea",
    "update:selectedMaxArea"
]);


const tags = ref([]);
const categories = ref([]);
const listings = ref([]);
const maxTags = 5;

const localFilters = ref({
    type: props.selectedType ?? "",
    tags: [...(props.selectedTags ?? [])],
    category: props.selectedCategory ?? "",
    priceMin: props.selectedMinPrice ?? null,
    priceMax: props.selectedMaxPrice ?? null,
    areaMin: props.selectedMinArea ?? null,
    areaMax: props.selectedMaxArea ?? null
});

watchEffect(async () => {
    if (props.show) {
        try {
            tags.value = await getTags();
            categories.value = await getCategories();
            listings.value = await getListings();
        } catch (err) {
            console.error("Помилка завантаження даних:", err);
        }
    }
});

const toggleTag = (tagId) => {
    const index = localFilters.value.tags.indexOf(tagId);
    if (index === -1) {
        if (localFilters.value.tags.length < maxTags) {
            localFilters.value.tags.push(tagId);
        }
    } else {
        localFilters.value.tags.splice(index, 1);
    }
};

const resetFilters = () => {
    localFilters.value = { type: "", tags: [], category: "", priceMin: null, priceMax: null, areaMin: null, areaMax: null };
    applyFilters(localFilters);
    emit("update:show", false);
};

const applyFilters = () => {
    emit("update:selectedType", localFilters.value.type);
    emit("update:selectedTags", localFilters.value.tags);
    emit("update:selectedCategory", localFilters.value.category);
    emit("update:selectedMinPrice", localFilters.value.priceMin);
    emit("update:selectedMaxPrice", localFilters.value.priceMax);
    emit("update:selectedMinArea", localFilters.value.areaMin);
    emit("update:selectedMaxArea", localFilters.value.areaMax);
    emit("update:show", false);
};

const filteredCount = computed(() => {
    return listings.value.filter(listing => {
        const activeListings = listing.status === 'Active';
        const matchesType = !localFilters.value.type || listing.type === localFilters.value.type;
        const matchesCategory = !localFilters.value.category || listing.category?.id === localFilters.value.category;
        const listingTags = listing.tags.map(tag => tag.id || tag);
        const matchesTags = !localFilters.value.tags.length || localFilters.value.tags.every(tag => listingTags.includes(tag));
        const matchesPrice = (!localFilters.value.priceMin || listing.price >= localFilters.value.priceMin) &&
            (!localFilters.value.priceMax || listing.price <= localFilters.value.priceMax);
        const matchesArea = (!localFilters.value.areaMin || listing.area >= localFilters.value.areaMin) &&
            (!localFilters.value.areaMax || listing.area <= localFilters.value.areaMax);

        return activeListings && matchesType && matchesCategory && matchesTags && matchesPrice && matchesArea;
    }).length;
});
</script>