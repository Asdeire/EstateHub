import { createRouter, createWebHistory } from 'vue-router';
import Register from '../views/RegisterView.vue';
import Login from '../views/LoginView.vue'
import Home from '../views/HomeView.vue';
import Listings from '../views/ListingsView.vue';
import ListingDetail from '../views/ListingDetailView.vue';

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
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
