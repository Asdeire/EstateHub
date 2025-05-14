<template>
    <div>
        <h1>Теги</h1>
        <n-button type="primary" @click="openCreateTagModal">Додати тег</n-button>
        <n-data-table :columns="tagColumns" :data="tags" :pagination="{ pageSize: 10 }" :bordered="true"
            :loading="isLoading" class="admin-table" />
        <n-modal v-model:show="showCreateTagModal" preset="dialog" title="Створити тег">
            <n-form :model="newTag" :rules="tagRules" ref="tagForm">
                <n-form-item label="Назва" path="name">
                    <n-input v-model:value="newTag.name" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showCreateTagModal = false">Скасувати</n-button>
                <n-button type="primary" @click="handleCreateTag" :loading="isCreating">Зберегти</n-button>
            </template>
        </n-modal>
        <n-modal v-model:show="showEditTagModal" preset="dialog" title="Редагувати тег">
            <n-form v-if="currentTag" :model="currentTag" :rules="tagRules" ref="editTagForm">
                <n-form-item label="Назва" path="name">
                    <n-input v-model:value="currentTag.name" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showEditTagModal = false">Скасувати</n-button>
                <n-button type="primary" @click="handleUpdateTag" :loading="isUpdating"
                    :disabled="!currentTag">Зберегти</n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NButton, NDataTable, NModal, NForm, NFormItem, NInput } from 'naive-ui';
import Swal from 'sweetalert2';
import { getAdminTags, createAdminTag, updateAdminTag, deleteAdminTag } from '../../services/api/index';
import type { Tag } from '../../types/tag';
import type { FormRules, FormInst } from 'naive-ui';

const emit = defineEmits(['fetch-data']);
const tags = ref<Tag[]>([]);
const showCreateTagModal = ref(false);
const showEditTagModal = ref(false);
const newTag = ref({ name: '' });
const currentTag = ref<Tag | null>(null);
const isLoading = ref(false);
const isCreating = ref(false);
const isUpdating = ref(false);
const tagForm = ref<FormInst | null>(null);
const editTagForm = ref<FormInst | null>(null);

const tagColumns = [
    { title: 'ID', key: 'id', minWidth: 100, sortable: true, sorter: (rowA: Tag, rowB: Tag) => rowA.id.localeCompare(rowB.id) },
    { title: 'Назва', key: 'name', minWidth: 200, sortable: true, sorter: (rowA: Tag, rowB: Tag) => rowA.name.localeCompare(rowB.name) },
    { title: 'Кількість оголошень', key: 'listings_count', minWidth: 200, sortable: true, sorter: (rowA: Tag, rowB: Tag) => rowA.listings_count - rowB.listings_count },
    {
        title: 'Дії',
        key: 'actions',
        render(row: Tag) {
            return h(
                'div',
                { class: 'action-buttons' },
                [
                    h(NButton, { size: 'small', onClick: () => handleEditTag(row) }, { default: () => 'Редагувати' }),
                    h(NButton, { size: 'small', type: 'error', onClick: () => handleDeleteTag(row.id) }, { default: () => 'Видалити' }),
                ]
            );
        },
    },
];

const tagRules: FormRules = {
    name: [{ required: true, message: 'Введіть назву тегу', trigger: 'blur' }],
};

const fetchTags = async () => {
    isLoading.value = true;
    try {
        const response = await getAdminTags();
        tags.value = Array.isArray(response) ? response : (response as any).data || [];
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити теги', 'error');
    } finally {
        isLoading.value = false;
    }
};

const openCreateTagModal = () => {
    newTag.value = { name: '' };
    showCreateTagModal.value = true;
};

const handleCreateTag = async () => {
    const form = tagForm.value;
    if (!form) return;

    try {
        isCreating.value = true;
        await form.validate();
        await createAdminTag(newTag.value);
        await fetchTags();
        Swal.fire('Успіх', 'Тег створено', 'success');
        showCreateTagModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося створити тег', 'error');
        showCreateTagModal.value = false;
    } finally {
        isCreating.value = false;
    }
};

const handleEditTag = (tag: Tag) => {
    currentTag.value = { ...tag };
    showEditTagModal.value = true;
};

const handleUpdateTag = async () => {
    if (!currentTag.value) return;
    const form = editTagForm.value;
    if (!form) return;

    try {
        isUpdating.value = true;
        await form.validate();
        await updateAdminTag(currentTag.value.id, currentTag.value);
        await fetchTags();
        Swal.fire('Успіх', 'Тег оновлено', 'success');
        showEditTagModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося оновити тег', 'error');
        showEditTagModal.value = false;
    } finally {
        isUpdating.value = false;
    }
};

const handleDeleteTag = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Тег буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminTag(id);
            tags.value = tags.value.filter((tag) => tag.id !== id);
            Swal.fire('Успіх', 'Тег видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити тег', 'error');
        }
    }
};

onMounted(fetchTags);
</script>
