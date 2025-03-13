import { PrismaClient, Category, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class CategoryService {
    async createCategory(data: { name: string; description?: string }): Promise<Category> {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description || null,
            },
        });

        return category;
    }

    async getAllCategories(): Promise<Category[]> {
        return await prisma.category.findMany();
    }

    async getCategoryById(id: string): Promise<Category | null> {
        return await prisma.category.findUnique({
            where: { id },
        });
    }

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        return await prisma.category.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: string): Promise<Category> {
        return await prisma.category.delete({
            where: { id },
        });
    }

    async incrementListingsCount(categoryId: string): Promise<Category> {
        return await prisma.category.update({
            where: { id: categoryId },
            data: {
                listings_count: {
                    increment: 1,
                },
            },
        });
    }

    async decrementListingsCount(categoryId: string): Promise<Category> {
        return await prisma.category.update({
            where: { id: categoryId },
            data: {
                listings_count: {
                    decrement: 1,
                },
            },
        });
    }
}

export const categoryService = new CategoryService();
