import { createRouter, createWebHistory } from 'vue-router';
import Register from '../views/RegisterView.vue';
import Login from '../views/LoginView.vue'
import Home from '../views/HomeView.vue';
import Listings from '../views/ListingsView.vue';
import ListingDetail from '../views/ListingDetailView.vue';
import MyListings from '../views/MyListingsView.vue';
import { useAuthStore } from '../store/useAuthStore';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
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
        path: '/listings/:id',
        name: 'ListingDetail',
        component: ListingDetail,
    },
    {
        path: '/mylistings',
        name: 'MyListings',
        component: MyListings,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
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
