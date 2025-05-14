import { createRouter, createWebHistory } from 'vue-router';
import Register from '../views/RegisterView.vue';
import Login from '../views/LoginView.vue';
import PasswordReset from '../views/PasswordResetView.vue';
import Home from '../views/HomeView.vue';
import About from '../views/AboutView.vue';
import Listings from '../views/ListingsView.vue';
import ListingDetail from '../views/ListingDetailView.vue';
import MyListings from '../views/MyListingsView.vue';
import Favorites from '../views/FavoritesView.vue';
import Profile from '../views/ProfileView.vue';
import Notifications from '../views/NotificationsView.vue';
import MySubscriptions from '../views/MySubscriptionsView.vue';
import AdminView from '../views/AdminView.vue';
import { useAuthStore } from '../stores/authDataStore';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    },
    {
        path: '/listings',
        name: 'Listings',
        component: Listings,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/password-reset',
        name: 'PasswordReset',
        component: PasswordReset,
    },
    {
        path: '/listings/:id',
        name: 'ListingDetail',
        component: ListingDetail,
    },
    {
        path: '/mylistings',
        name: 'MyListings',
        component: MyListings,
        meta: { requiresAuth: true },
    },
    {
        path: '/favourites',
        name: 'Favorites',
        component: Favorites,
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true },
    },
    {
        path: '/notifications',
        name: 'Notifications',
        component: Notifications,
        meta: { requiresAuth: true },
    },
    {
        path: '/mysubscriptions',
        name: 'MySubscriptions',
        component: MySubscriptions,
        meta: { requiresAuth: true },
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminView,
        meta: { requiresAuth: true },
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 };
    }

});

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();
    const isAuthRequired = to.matched.some(route => route.meta.requiresAuth);

    const token = localStorage.getItem('authToken');
    if (token) {
        authStore.isAuthenticated = true;
    }

    if (isAuthRequired && !authStore.isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;