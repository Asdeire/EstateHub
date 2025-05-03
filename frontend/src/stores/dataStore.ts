import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getCategories, getTags } from '../services/api/index';

export type Category ={
    id: string;
    name: string;
}

export type Tag ={
    id: string;
    name: string;
}

export const useDataStore = defineStore('data', () => {
    const categories = ref<Category[]>([]);
    const tags = ref<Tag[]>([]);
    const isLoaded = ref<boolean>(false);

    const loadData = async () => {
        if (isLoaded.value) return;

        try {
            const [categoriesData, tagsData] = await Promise.all([
                getCategories(),
                getTags(),
            ]);
            categories.value = categoriesData;
            tags.value = tagsData;
            isLoaded.value = true;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error; 
        }
    };

    return {
        categories,
        tags,
        isLoaded,
        loadData,
    };
});