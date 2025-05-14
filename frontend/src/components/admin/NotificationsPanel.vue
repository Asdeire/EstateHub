<template>
    <div>
        <h1>Повідомлення</h1>
        <n-data-table :columns="notificationColumns" :data="adminStore.notifications" :pagination="{ pageSize: 10 }"
            :loading="isLoading" :bordered="true" class="admin-table" />
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NButton, NDataTable } from 'naive-ui';
import Swal from 'sweetalert2';
import { deleteAdminNotification } from '../../services/api/admin';
import { useAdminStore } from '../../stores/adminDataStore';
import type { Notification } from '../../types/notification';

const adminStore = useAdminStore();
const isLoading = ref(false);

const notificationColumns = [
    {
        title: 'ID',
        key: 'id',
        minWidth: 100,
        sortable: true,
        sorter: (rowA: Notification, rowB: Notification) => rowA.id.localeCompare(rowB.id),
    },
    { title: 'Повідомлення', key: 'message', minWidth: 300 },
    {
        title: 'Статус',
        key: 'status',
        minWidth: 150,
        sortable: true,
        sorter: (rowA: Notification, rowB: Notification) => rowA.status.localeCompare(rowB.status),
    },
    {
        title: 'Отримувач (ID)',
        key: 'user_id',
        minWidth: 100,
        sortable: true,
        sorter: (rowA: Notification, rowB: Notification) => rowA.user_id.localeCompare(rowB.user_id),
    },
    {
        title: 'Дії',
        key: 'actions',
        render(row: Notification) {
            return h('div', { class: 'action-buttons' }, [
                h(
                    NButton,
                    { size: 'small', type: 'error', onClick: () => handleDeleteNotification(row.id) },
                    { default: () => 'Видалити' }
                ),
            ]);
        },
    },
];

const fetchNotifications = async () => {
    isLoading.value = true;
    try {
        await adminStore.fetchNotifications();
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити повідомлення', 'error');
    } finally {
        isLoading.value = false;
    }
};

const handleDeleteNotification = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Повідомлення буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminNotification(id);
            await adminStore.fetchNotifications(true);
            Swal.fire('Успіх', 'Повідомлення видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити повідомлення', 'error');
        }
    }
};

onMounted(fetchNotifications);
</script>