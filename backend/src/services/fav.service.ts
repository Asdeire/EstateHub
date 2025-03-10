import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FavoritesService {
    async getFavorites(userId: string) {
        try {
            const favorites = await prisma.favorite.findMany({
                where: { user_id: userId },
                select: { listing_id: true },
            });
            return favorites;
        } catch (error) {
            console.error('Error retrieving favorites:', error);
            throw new Error('Error retrieving favorites');
        }
    }

    async addFavorite(userId: string, listingId: string) {
        try {
            await prisma.favorite.create({
                data: { user_id: userId, listing_id: listingId },
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw new Error('Error adding to favorites');
        }
    }

    async removeFavorite(userId: string, listingId: string) {
        try {
            await prisma.favorite.deleteMany({
                where: { user_id: userId, listing_id: listingId },
            });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw new Error('Error removing from favorites');
        }
    }
}
