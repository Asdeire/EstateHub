<template>
    <div>
        <h1>Оголошення</h1>
        <n-data-table :columns="listingColumns" :data="adminStore.listings" :pagination="{ pageSize: 10 }"
            :bordered="true" :loading="isLoading" class="admin-table" />
        <n-modal v-model:show="showEditListingModal" preset="dialog" title="Редагувати оголошення">
            <n-form v-if="currentListing" :model="currentListing" :rules="listingRules" ref="editListingForm">
                <n-form-item label="Заголовок" path="title">
                    <n-input v-model:value="currentListing.title" />
                </n-form-item>
                <n-form-item label="Статус" path="status">
                    <n-select v-model:value="currentListing.status" :options="statusOptions" />
                </n-form-item>
                <n-form-item label="Ціна" path="price">
                    <n-input-number v-model:value="currentListing.price" :min="0" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showEditListingModal = false">Скасувати</n-button>
                <n-button type="primary" :loading="isUpdatingListing" @click="handleUpdateListing"
                    :disabled="!currentListing">
                    Зберегти
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NDataTable, NButton, NModal, NForm, NFormItem, NInput, NSelect, NInputNumber } from 'naive-ui';
import Swal from 'sweetalert2';
import { updateAdminListing, deleteAdminListing } from '../../services/api/admin';
import type { Listing } from '../../types/listing';
import type { FormRules } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/adminDataStore';

const adminStore = useAdminStore();
const router = useRouter();
const isLoading = ref(false);
const showEditListingModal = ref(false);
const currentListing = ref<Listing | null>(null);
const isUpdatingListing = ref(false);

const listingColumns = [
    {
        title: 'ID',
        key: 'id',
        minWidth: 100,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.id.localeCompare(rowB.id),
    },
    {
        title: 'Заголовок',
        key: 'title',
        minWidth: 200,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.title.localeCompare(rowB.title),
    },
    {
        title: 'Тип',
        key: 'type',
        minWidth: 120,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.type.localeCompare(rowB.type),
    },
    {
        title: 'Локація',
        key: 'location',
        minWidth: 150,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.location.localeCompare(rowB.location),
    },
    {
        title: 'Ціна',
        key: 'price',
        minWidth: 120,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.price - rowB.price,
    },
    {
        title: 'Статус',
        key: 'status',
        minWidth: 130,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) => rowA.status.localeCompare(rowB.status),
    },
    {
        title: 'Агентське',
        key: 'is_agent_listing',
        minWidth: 130,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) =>
            rowA.is_agent_listing === rowB.is_agent_listing ? 0 : rowA.is_agent_listing ? -1 : 1,
        render(row: Listing) {
            return row.is_agent_listing ? 'Так' : 'Ні';
        },
    },
    {
        title: 'Оновлено',
        key: 'updated_at',
        minWidth: 180,
        sortable: true,
        sorter: (rowA: Listing, rowB: Listing) =>
            new Date(rowA.updated_at).getTime() - new Date(rowB.updated_at).getTime(),
        render(row: Listing) {
            const date = new Date(row.updated_at);
            return date.toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        title: 'Дії',
        key: 'actions',
        render(row: Listing) {
            return h(
                'div',
                { class: 'action-buttons' },
                [
                    h(
                        NButton,
                        { size: 'small', onClick: () => handleEditListing(row) },
                        { default: () => 'Редагувати' }
                    ),
                    h(
                        NButton,
                        { size: 'small', onClick: () => handleViewListing(row.id), type: 'primary', tertiary: true },
                        { default: () => 'Переглянути' }
                    ),
                    h(
                        NButton,
                        { size: 'small', type: 'error', onClick: () => handleDeleteListing(row.id) },
                        { default: () => 'Видалити' }
                    ),
                ]
            );
        },
    },
];

const listingRules: FormRules = {
    title: [{ required: true, message: 'Введіть заголовок', trigger: 'blur' }],
    status: [{ required: true, message: 'Виберіть статус', trigger: 'change' }],
    price: [{ required: true, type: 'number', message: 'Введіть ціну', trigger: 'blur' }],
};

const statusOptions = [
    { label: 'Активне', value: 'Active' },
    { label: 'Архівоване', value: 'Archived' },
];

const fetchListings = async () => {
    isLoading.value = true;
    try {
        await adminStore.fetchListings();
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити оголошення', 'error');
    } finally {
        isLoading.value = false;
    }
};

const handleEditListing = (listing: Listing) => {
    currentListing.value = { ...listing };
    showEditListingModal.value = true;
};

const handleUpdateListing = async () => {
    if (!currentListing.value) return;

    isUpdatingListing.value = true;
    try {
        await updateAdminListing(currentListing.value.id, currentListing.value);
        await adminStore.fetchListings(true);
        Swal.fire('Успіх', 'Оголошення оновлено', 'success');
        showEditListingModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося оновити оголошення', 'error');
        showEditListingModal.value = false;
    } finally {
        isUpdatingListing.value = false;
    }
};

const handleDeleteListing = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Оголошення буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminListing(id);
            await adminStore.fetchListings(true);
            Swal.fire('Успіх', 'Оголошення видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити оголошення', 'error');
        }
    }
};

const handleViewListing = (id: string) => {
    router.push(`/listings/${id}`);
};

onMounted(fetchListings);
</script>