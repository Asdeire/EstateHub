<template>
    <div>
        <h1>Категорії</h1>
        <n-button type="primary" @click="openCreateCategoryModal">Додати категорію</n-button>
        <n-data-table :columns="categoryColumns" :data="categories" :pagination="{ pageSize: 10 }" :bordered="true"
            :loading="isLoading" class="admin-table" />
        <n-modal v-model:show="showCreateCategoryModal" preset="dialog" title="Створити категорію">
            <n-form :model="newCategory" :rules="categoryRules" ref="categoryForm">
                <n-form-item label="Назва" path="name">
                    <n-input v-model:value="newCategory.name" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showCreateCategoryModal = false">Скасувати</n-button>
                <n-button type="primary" :loading="isCreatingCategory" @click="handleCreateCategory">Зберегти</n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showEditCategoryModal" preset="dialog" title="Редагувати категорію">
            <n-form v-if="currentCategory" :model="currentCategory" :rules="categoryRules" ref="editCategoryForm">
                <n-form-item label="Назва" path="name">
                    <n-input v-model:value="currentCategory.name" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showEditCategoryModal = false">Скасувати</n-button>
                <n-button type="primary" :loading="isUpdatingCategory" @click="handleUpdateCategory"
                    :disabled="!currentCategory">Зберегти</n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NButton, NDataTable, NModal, NForm, NFormItem, NInput } from 'naive-ui';
import Swal from 'sweetalert2';
import { getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../../services/api/index';
import type { Category } from '../../types/category';
import type { FormRules } from 'naive-ui';

const emit = defineEmits(['fetch-data']);
const categories = ref<Category[]>([]);
const showCreateCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const newCategory = ref({ name: '' });
const currentCategory = ref<Category | null>(null);

const isLoading = ref(false);
const isCreatingCategory = ref(false);
const isUpdatingCategory = ref(false);

const categoryColumns = [
    { title: 'ID', key: 'id', minWidth: 100, sortable: true, sorter: (rowA: Category, rowB: Category) => rowA.id.localeCompare(rowB.id) },
    {
        title: 'Назва',
        key: 'name',
        minWidth: 200,
        sortable: true,
        sorter: (rowA: Category, rowB: Category) => rowA.name.localeCompare(rowB.name),
    },
    { title: 'Кількість оголошень', key: 'listings_count', minWidth: 200, sortable: true, sorter: (rowA: Category, rowB: Category) => rowA.listings_count - rowB.listings_count },
    {
        title: 'Дії',
        key: 'actions',
        render(row: Category) {
            return h(
                'div',
                { class: 'action-buttons' },
                [
                    h(NButton, { size: 'small', onClick: () => handleEditCategory(row) }, { default: () => 'Редагувати' }),
                    h(NButton, { size: 'small', type: 'error', onClick: () => handleDeleteCategory(row.id) }, { default: () => 'Видалити' }),
                ]
            );
        },
    },
];

const categoryRules: FormRules = {
    name: [{ required: true, message: 'Введіть назву категорії', trigger: 'blur' }],
};

const fetchCategories = async () => {
    isLoading.value = true;
    try {
        const response = await getAdminCategories();
        categories.value = Array.isArray(response) ? response : (response as any).data || [];
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити категорії', 'error');
    } finally {
        isLoading.value = false;
    }
};

const openCreateCategoryModal = () => {
    newCategory.value = { name: '' };
    showCreateCategoryModal.value = true;
};

const handleCreateCategory = async () => {
    isCreatingCategory.value = true;
    try {
        await createAdminCategory(newCategory.value);
        await fetchCategories();
        Swal.fire('Успіх', 'Категорію створено', 'success');
        showCreateCategoryModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося створити категорію', 'error');
        showCreateCategoryModal.value = false;
    } finally {
        isCreatingCategory.value = false;
    }
};

const handleEditCategory = (category: Category) => {
    currentCategory.value = { ...category };
    showEditCategoryModal.value = true;
};

const handleUpdateCategory = async () => {
    if (!currentCategory.value) return;
    isUpdatingCategory.value = true;
    try {
        await updateAdminCategory(currentCategory.value.id, currentCategory.value);
        await fetchCategories();
        Swal.fire('Успіх', 'Категорію оновлено', 'success');
        showEditCategoryModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося оновити категорію', 'error');
        showEditCategoryModal.value = false;
    } finally {
        isUpdatingCategory.value = false;
    }
};

const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Категорію буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminCategory(id);
            categories.value = categories.value.filter((category) => category.id !== id);
            Swal.fire('Успіх', 'Категорію видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити категорію', 'error');
        }
    }
};

onMounted(fetchCategories);
</script>