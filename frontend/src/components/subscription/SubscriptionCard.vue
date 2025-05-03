<template>
    <div class="subscription-card">
        <div class="subscription-info">
            <h3>Підписка {{ subscription.transport }}</h3>
            <p v-if="categoryName">Категорія: {{ categoryName }}</p>
            <p v-if="subscription.filters?.type">Тип: {{ subscription.filters.type }}</p>
            <p v-if="subscription.filters?.minPrice || subscription.filters?.maxPrice">
                Ціна: {{ subscription.filters.minPrice || 0 }} - {{ subscription.filters.maxPrice || '∞' }}
            </p>
            <p v-if="subscription.filters?.minArea || subscription.filters?.maxArea">
                Площа: {{ subscription.filters.minArea || 0 }} - {{ subscription.filters.maxArea || '∞' }} м²
            </p>
            <p v-if="tagNames.length">
                Теги: {{ tagNames.join(', ') }}
            </p>
        </div>
        <button class="delete-button" @click="$emit('delete', subscription.id)">Видалити</button>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useDataStore } from '../../stores/dataStore'; 

const props = defineProps({
    subscription: Object
});

defineEmits(['delete']);

const dataStore = useDataStore();

onMounted(async () => {
    await dataStore.loadData(); 
});

const categoryName = computed(() => {
    const id = props.subscription.filters?.category;
    return dataStore.categories.find(category => category.id === id)?.name || '';
});

const tagNames = computed(() => {
    const tagIds = props.subscription.filters?.tags || [];
    return tagIds
        .map(id => dataStore.tags.find(tag => tag.id === id)?.name)
        .filter(name => !!name);
});
</script>