<template>
    <div class="subscription-card">
        <div class="subscription-info">
            <h3>Підписка {{ subscription.transport }}</h3>
            <p v-if="subscription.filters?.category">Категорія: {{ subscription.filters.category }}</p>
            <p v-if="subscription.filters?.type">Тип: {{ subscription.filters.type }}</p>
            <p v-if="subscription.filters?.minPrice || subscription.filters?.maxPrice">
                Ціна: {{ subscription.filters.minPrice || 0 }} - {{ subscription.filters.maxPrice || '∞' }}
            </p>
            <p v-if="subscription.filters?.minArea || subscription.filters?.maxArea">
                Площа: {{ subscription.filters.minArea || 0 }} - {{ subscription.filters.maxArea || '∞' }} м²
            </p>
        </div>
        <button class="delete-button" @click="$emit('delete', subscription.id)">Видалити</button>
    </div>
</template>

<script setup>
defineProps({
    subscription: Object
});

defineEmits(['delete']);
</script>

<style scoped>
.subscription-card {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    justify-content: space-between;
    align-items: center;
}

.delete-button {
    background-color: #e74c3c;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.delete-button:hover {
    background-color: #c0392b;
}
</style>