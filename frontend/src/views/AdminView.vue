<template>
    <div v-if="authStore.isAuthenticated && authStore.user?.role === 'Admin'" class="admin-panel-container">
        <n-layout has-sider>
            <n-layout-sider bordered collapse-mode="width" :style="sidebarStyle" class="sidebar"
                @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
                <img src="../assets/logo.png" alt="Logo" class="logo" :class="{ collapsed: collapsed }" />
                <n-menu v-model:value="activeTab" :options="menuOptions" :collapsed="collapsed" :collapsed-width="64"
                    :indent="24" :default-value="'users'" />
                <n-button dashed type="error" @click="goToHomePage" class="go-home-btn">
                    <img src="../assets/admin/exit.png" alt="Home Icon" class="menu-icon" />
                </n-button>
            </n-layout-sider>

            <n-layout-content>
                <div class="admin-content">
                    <users-panel v-if="activeTab === 'users'" />
                    <listings-panel v-if="activeTab === 'listings'" />
                    <categories-panel v-if="activeTab === 'categories'" />
                    <tags-panel v-if="activeTab === 'tags'" />
                    <subscriptions-panel v-if="activeTab === 'subscriptions'" />
                    <notifications-panel v-if="activeTab === 'notifications'" />
                </div>
            </n-layout-content>
        </n-layout>
    </div>

    <div v-else class="error-message">
        <n-alert type="error" title="Доступ заборонено" description="Потрібна роль адміністратора." />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue';
import { useAuthStore } from '../stores/authDataStore';
import { useRouter } from 'vue-router';
import {
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NMenu,
    NButton,
    NAlert,
} from 'naive-ui';

import UsersPanel from '../components/admin/UsersPanel.vue';
import ListingsPanel from '../components/admin/ListingsPanel.vue';
import CategoriesPanel from '../components/admin/CategoriesPanel.vue';
import TagsPanel from '../components/admin/TagsPanel.vue';
import SubscriptionsPanel from '../components/admin/SubscriptionsPanel.vue';
import NotificationsPanel from '../components/admin/NotificationsPanel.vue';

const authStore = useAuthStore();
const activeTab = ref('users');
const collapsed = ref(true);
const router = useRouter();

const sidebarStyle = ref({
    width: collapsed.value ? '64px' : '240px',
    transition: 'width 0.3s ease',
});

const iconPath = (filename: string) =>
    new URL(`../assets/admin/${filename}`, import.meta.url).href;

const menuOptions = [
    {
        label: 'Користувачі',
        key: 'users',
        icon: () =>
            h('img', {
                src: iconPath('users.png'),
                class: 'menu-icon',
            }),
    },
    {
        label: 'Оголошення',
        key: 'listings',
        icon: () =>
            h('img', {
                src: iconPath('listings.png'),
                class: 'menu-icon',
            }),
    },
    {
        label: 'Категорії',
        key: 'categories',
        icon: () =>
            h('img', {
                src: iconPath('categories.png'),
                class: 'menu-icon',
            }),
    },
    {
        label: 'Теги',
        key: 'tags',
        icon: () =>
            h('img', {
                src: iconPath('tags.png'),
                class: 'menu-icon',
            }),
    },
    {
        label: 'Підписки',
        key: 'subscriptions',
        icon: () =>
            h('img', {
                src: iconPath('subscriptions.png'),
                class: 'menu-icon',
            }),
    },
    {
        label: 'Повідомлення',
        key: 'notifications',
        icon: () =>
            h('img', {
                src: iconPath('notifications.png'),
                class: 'menu-icon',
            }),
    },
];

const goToHomePage = () => {
    router.push('/');
};

const onMouseEnter = () => {
    collapsed.value = false;
};

const onMouseLeave = () => {
    collapsed.value = true;
};

watch(collapsed, (newState) => {
    sidebarStyle.value.width = newState ? '64px' : '240px';
});
</script>

<style lang="scss">
.admin-panel-container {
    display: flex;
    height: calc(100vh - 64px);
    width: 100vw;
    position: relative;


    .error-message {
        padding: 24px;
        text-align: center;
    }

    .n-layout-sider {
        position: relative;
        transition: width 0.3s ease;

        .logo {
            width: 100%;
            padding: 24px;

        }
    }

    .go-home-btn {
        width: calc(100% - 24px);
        position: absolute;
        bottom: 24px;
        left: 12px;
        right: 12px;
        padding: 0;

        img {
            width: 100%;
            object-fit: contain;
        }
    }


    .admin-content {
        padding: 0 24px;
        color: #07484a;


    }

    .menu-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .admin-table {
        margin-top: 16px;

        .action-buttons {
            display: flex;
            flex-direction: column;
            width: 150px;
            gap: 8px;
        }
    }

    h1 {
        margin-bottom: 16px;
    }

    .n-data-table-th {
        color: #07484a;
    }
}
</style>
