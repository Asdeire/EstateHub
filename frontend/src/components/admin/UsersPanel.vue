<template>
    <div>
        <h1>Користувачі</h1>
        <n-data-table :columns="userColumns" :data="adminStore.users" :pagination="{ pageSize: 10 }" :bordered="true"
            :loading="isLoading" class="admin-table" />
        <n-modal v-model:show="showEditUserModal" preset="dialog" title="Редагувати користувача">
            <n-form v-if="currentUser" :model="currentUser" :rules="userEditRules" ref="editUserForm">
                <n-form-item label="Ім'я" path="name">
                    <n-input v-model:value="currentUser.name" />
                </n-form-item>
                <n-form-item label="Email" path="email">
                    <n-input v-model:value="currentUser.email" />
                </n-form-item>
                <n-form-item label="Роль" path="role">
                    <n-select v-model:value="currentUser.role" :options="roleOptions" />
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="showEditUserModal = false">Скасувати</n-button>
                <n-button type="primary" :loading="isUpdating" @click="handleUpdateUser" :disabled="!currentUser">
                    Зберегти
                </n-button>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue';
import { NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSelect } from 'naive-ui';
import Swal from 'sweetalert2';
import { updateAdminUser, deleteAdminUser } from '../../services/api/admin';
import { useAdminStore } from '../../stores/adminDataStore';
import type { User } from '../../types/user';
import type { FormRules } from 'naive-ui';

const adminStore = useAdminStore();
const isLoading = ref(false);
const showEditUserModal = ref(false);
const currentUser = ref<User | null>(null);
const isUpdating = ref(false);

const userColumns = [
    {
        title: 'ID',
        key: 'id',
        minWidth: 100,
        sortable: true,
        sorter: (rowA: User, rowB: User) => rowA.id.localeCompare(rowB.id),
    },
    {
        title: "Ім'я",
        key: 'name',
        minWidth: 150,
        sortable: true,
        sorter: (rowA: User, rowB: User) => rowA.name.localeCompare(rowB.name),
    },
    {
        title: 'Email',
        key: 'email',
        minWidth: 200,
        sortable: true,
        sorter: (rowA: User, rowB: User) => rowA.email.localeCompare(rowB.email),
    },
    {
        title: 'Роль',
        key: 'role',
        minWidth: 120,
        sortable: true,
        sorter: (rowA: User, rowB: User) => rowA.role.localeCompare(rowB.role),
    },
    {
        title: 'Дії',
        key: 'actions',
        render(row: User) {
            return h(
                'div',
                { class: 'action-buttons' },
                [
                    h(
                        NButton,
                        { size: 'small', onClick: () => handleEditUser(row) },
                        { default: () => 'Редагувати' }
                    ),
                    h(
                        NButton,
                        { size: 'small', type: 'error', onClick: () => handleDeleteUser(row.id) },
                        { default: () => 'Видалити' }
                    ),
                ]
            );
        },
    },
];

const userEditRules: FormRules = {
    name: [{ required: true, message: "Введіть ім'я", trigger: 'blur' }],
    email: [{ required: true, type: 'email', message: 'Введіть коректний email', trigger: 'blur' }],
    role: [{ required: true, message: 'Виберіть роль', trigger: 'change' }],
};

const roleOptions = [
    { label: 'Користувач', value: 'User' },
    { label: 'Агент', value: 'Makler' },
    { label: 'Адмін', value: 'Admin' },
];

const handleEditUser = (user: User) => {
    currentUser.value = { ...user };
    showEditUserModal.value = true;
};

const handleUpdateUser = async () => {
    if (!currentUser.value) return;
    isUpdating.value = true;

    try {
        await updateAdminUser(currentUser.value.id, currentUser.value);
        await adminStore.fetchUsers(true);
        Swal.fire('Успіх', 'Користувача оновлено', 'success');
        showEditUserModal.value = false;
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося оновити користувача', 'error');
        console.error(err);
        showEditUserModal.value = false;
    } finally {
        isUpdating.value = false;
    }
};

const handleDeleteUser = async (id: string) => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Ви впевнені?',
        text: 'Користувача буде видалено!',
        showCancelButton: true,
        confirmButtonText: 'Так, видалити',
        cancelButtonText: 'Скасувати',
    });
    if (result.isConfirmed) {
        try {
            await deleteAdminUser(id);
            await adminStore.fetchUsers(true);
            Swal.fire('Успіх', 'Користувача видалено', 'success');
        } catch (err) {
            Swal.fire('Помилка', 'Не вдалося видалити користувача', 'error');
        }
    }
};

onMounted(async () => {
    isLoading.value = true;
    try {
        await adminStore.fetchUsers();
    } catch (err) {
        Swal.fire('Помилка', 'Не вдалося завантажити користувачів', 'error');
    } finally {
        isLoading.value = false;
    }
});
</script>