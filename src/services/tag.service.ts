import { PrismaClient, Tag, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class TagService {
    async createTag(data: { name: string }): Promise<Tag> {
        const tag = await prisma.tag.create({
            data: {
                name: data.name,
            },
        });

        return tag;
    }

    async getAllTags(): Promise<Tag[]> {
        return await prisma.tag.findMany();
    }

    async getTagById(id: string): Promise<Tag | null> {
        return await prisma.tag.findUnique({
            where: { id },
        });
    }

    async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
        return await prisma.tag.update({
            where: { id },
            data,
        });
    }

    async deleteTag(id: string): Promise<Tag> {
        return await prisma.tag.delete({
            where: { id },
        });
    }

    async incrementListingsCount(tagId: string): Promise<Tag> {
        return await prisma.tag.update({
            where: { id: tagId },
            data: {
                listings_count: {
                    increment: 1,
                },
            },
        });
    }

    async decrementListingsCount(tagId: string): Promise<Tag> {
        return await prisma.tag.update({
            where: { id: tagId },
            data: {
                listings_count: {
                    decrement: 1,
                },
            },
        });
    }
}

export const tagService = new TagService();
