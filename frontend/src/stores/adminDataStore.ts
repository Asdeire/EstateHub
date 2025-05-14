import { defineStore } from 'pinia';
import {
    getAdminUsers,
    getAdminListings,
    getAdminCategories,
    getAdminTags,
    getAdminSubscriptions,
    getAdminNotifications,
} from '../services/api/admin';
import type { User } from '../types/user';
import type { Listing } from '../types/listing';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';
import type { Subscription } from '../types/subscription';
import type { Notification } from '../types/notification';

export const useAdminStore = defineStore('admin', {
    state: () => ({
        users: [] as User[],
        listings: [] as Listing[],
        categories: [] as Category[],
        tags: [] as Tag[],
        subscriptions: [] as Subscription[],
        notifications: [] as Notification[],
        cacheTime: null as number | null,
    }),
    actions: {
        async fetchUsers(force = false) {
            if (force || !this.users.length || this.isCacheExpired()) {
                this.users = await getAdminUsers();
                this.cacheTime = Date.now();
            }
            return this.users;
        },
        async fetchListings(force = false) {
            if (force || !this.listings.length || this.isCacheExpired()) {
                this.listings = await getAdminListings();
                this.cacheTime = Date.now();
            }
            return this.listings;
        },
        async fetchCategories(force = false) {
            if (force || !this.categories.length || this.isCacheExpired()) {
                this.categories = await getAdminCategories();
                this.cacheTime = Date.now();
            }
            return this.categories;
        },
        async fetchTags(force = false) {
            if (force || !this.tags.length || this.isCacheExpired()) {
                this.tags = await getAdminTags();
                this.cacheTime = Date.now();
            }
            return this.tags;
        },
        async fetchSubscriptions(force = false) {
            if (force || !this.subscriptions.length || this.isCacheExpired()) {
                this.subscriptions = await getAdminSubscriptions();
                this.cacheTime = Date.now();
            }
            return this.subscriptions;
        },
        async fetchNotifications(force = false) {
            if (force || !this.notifications.length || this.isCacheExpired()) {
                this.notifications = await getAdminNotifications();
                this.cacheTime = Date.now();
            }
            return this.notifications;
        },
        isCacheExpired() {
            const cacheDuration = 5 * 60 * 1000;
            return !this.cacheTime || Date.now() - this.cacheTime > cacheDuration;
        },
        invalidateCache() {
            this.cacheTime = null;
        },
    },
}); 