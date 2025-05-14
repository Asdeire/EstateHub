<template>
    <div>
        <h1>Підписки</h1>
        <n-data-table :columns="subscriptionColumns" :data="subscriptions" :pagination="{ pageSize: 10 }"
            :loading="isLoading" :bordered="true" class="admin-table" />
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NDataTable, NButton } from 'naive-ui';
import Swal from 'sweetalert2';
import { getAdminSubscriptions, deleteAdminSubscription } from '../../services/api/index';
import type { Subscription } from '../../types/subscription';

const emit = defineEmits(['fetch-data']);
const subscriptions = ref<Subscription[]>([]);
const isLoading = ref(false);

const subscriptionColumns = [
    { title: 'ID', key: 'id', minWidth: 100, sortable: true, sorter: (rowA: Subscription, rowB: Subscription) => rowA.id.localeCompare(rowB.id) },
    { title: 'ID користувача', key: 'buyer_id', minWidth: 100, sortable: true, sorter: (rowA: Subscription, rowB: Subscription) => rowA.buyer_id.localeCompare(rowB.buyer_id) },
    { title: 'Транспорт', key: 'transport', minWidth: 150, sortable: true, sorter: (rowA: Subscription, rowB: Subscription) => rowA.transport.localeCompare(rowB.transport) },
    {
        title: 'Фільтри', key: 'filters', minWidth: 300, render(row: Subscription) {
            const filters = parseFilters(row.filters);
            return h('div', {}, filters);
        }
    },
    {
        title: 'Дії',
        key: 'actions',
        render(row: Subscription) {
            return h('div',
                { class: 'action-buttons' }, [
                h(NButton, {
                    size: 'small',
                    type: 'error',
                    onClick: () => handleDeleteSubscription(row.id)
                }, { default: () => 'Видалити' }),
            ]);
        }
    },
];

const fetchSubscriptions = async () => {
    isLoading.value = true;
    try {
        const response = await getAdminSubscriptions();
        subscriptions.value = Array.isArray(response) ? response : (response as any).data || [];
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити підписки', 'error');
    } finally {
        isLoading.value = false;
    }
};

const handleDeleteSubscription = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Підписку буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminSubscription(id);
            subscriptions.value = subscriptions.value.filter((subscription) => subscription.id !== id);
            Swal.fire('Успіх', 'Підписку видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити підписку', 'error');
        }
    }
};

const parseFilters = (filters: any) => {
    if (typeof filters === 'object') {
        return Object.entries(filters).map(([key, value]) => `${key}: ${value}`).join(', ');
    }

    try {
        const filterObject = JSON.parse(filters);
        return Object.entries(filterObject).map(([key, value]) => `${key}: ${value}`).join(', ');
    } catch (err) {
        return 'Невірний формат фільтрів';
    }
};

onMounted(fetchSubscriptions);
</script>