import { PrismaClient, Listing, Prisma, Subscription } from '@prisma/client';
import { NotificationService } from './notification.service';
import { CreateListingDto, UpdateListingDto } from '../schemas/listing.schemas';

const prisma = new PrismaClient();
const notificationService = new NotificationService();
const listingSelectFields = {
    id: true,
    user_id: true,
    is_agent_listing: true,
    description: true,
    photos: true,
    category_id: true,
    title: true,
    location: true,
    price: true,
    area: true,
    type: true,
    status: true,
    created_at: true,
    updated_at: true,
    category: { select: { id: true, name: true } },
    tags: { select: { id: true, name: true } },
};

class ListingService {
    async createListing(data: CreateListingDto): Promise<Listing> {
        const { tags, ...listingData } = data;
        const listing = await prisma.listing.create({
            data: {
                ...listingData,
                status: data.status,
                tags: {
                    connect: tags.map((tag: string) => ({ id: tag })),
                },
            },
            include: { tags: true, category: true },
        });

        return listing;
    }

    async countUserListings(user_id: string): Promise<number> {
        return await prisma.listing.count({
            where: { user_id },
        });
    }

    private matchesFilters(
        listing: Listing & { tags: { id: string }[]; category?: { id: string } | null },
        filters: any
    ): boolean {
        if (filters.category && (!listing.category || listing.category?.id !== filters.category)) return false;
        if (filters.type && listing.type !== filters.type) return false;
        if (filters.minPrice && listing.price < filters.minPrice) return false;
        if (filters.maxPrice && listing.price > filters.maxPrice) return false;
        if (filters.minArea && listing.area < filters.minArea) return false;
        if (filters.maxArea && listing.area > filters.maxArea) return false;
        if (filters.tags && filters.tags.length > 0) {
            const listingTagIds = listing.tags.map(tag => tag.id);
            const hasMatchingTag = filters.tags.some((tag: string) => listingTagIds.includes(tag));
            if (!hasMatchingTag) return false;
        }
        return true;
    }

    async getAllListings(
        page: number = 1,
        limit: number = 12,
        filters: {
            category?: string;
            type?: string;
            minPrice?: number;
            maxPrice?: number;
            minArea?: number;
            maxArea?: number;
            status?: string;
            tags?: string[];
            location?: string;
        } = {}
    ): Promise<{ listings: Listing[]; totalPages: number }> {
        const where: any = {};

        if (filters.minPrice !== undefined) {
            where.price = { gte: Number(filters.minPrice) };
        }
        if (filters.maxPrice !== undefined) {
            where.price = { ...where.price, lte: Number(filters.maxPrice) };
        }

        if (filters.minArea !== undefined) {
            where.area = { gte: Number(filters.minArea) };
        }
        if (filters.maxArea !== undefined) {
            where.area = { ...where.area, lte: Number(filters.maxArea) };
        }

        if (filters.category) {
            where.category = { id: filters.category };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.tags?.length) {
            where.tags = {
                some: {
                    id: { in: filters.tags },
                },
            };
        }

        if (filters.location) {
            where.location = {
                contains: filters.location,
                mode: 'insensitive',
            };
        }

        const totalListings = await prisma.listing.count({ where });
        const totalPages = Math.ceil(totalListings / limit);

        const skip = (page - 1) * limit;

        const listings = await prisma.listing.findMany({
            skip,
            take: limit,
            where,
            select: listingSelectFields,
        });

        return { listings, totalPages };
    }

    async getFavoriteListings(userId: string): Promise<(Listing & { isFavorite: true })[]> {
        const favorites = await prisma.favorite.findMany({
            where: { user_id: userId },
            select: { listing_id: true },
        });

        const favoriteIds = favorites.map(f => f.listing_id);

        if (favoriteIds.length === 0) return [];

        const listings = await prisma.listing.findMany({
            where: { id: { in: favoriteIds } },
            select: listingSelectFields,
        });

        return listings.map(listing => ({
            ...listing,
            isFavorite: true,
        }));
    }

    async getAllListingsWithoutFilters(): Promise<Listing[]> {
        try {
            const listings = await prisma.listing.findMany({
                select: listingSelectFields,
            });

            return listings;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching listings');
        }
    }

    async getListingById(id: string): Promise<Listing | null> {
        return await prisma.listing.findUnique({
            where: { id },
            include: {
                category: true,
                tags: true,
            },
        });
    }

    async getActiveListingsByUserId(userId: string) {
        return await prisma.listing.findMany({
            where: {
                user_id: userId,
                status: 'Active',
            },
            include: {
                category: true,
                tags: true,
            },
        });
    }

    async getArchivedListingsByUserId(userId: string) {
        return await prisma.listing.findMany({
            where: {
                user_id: userId,
                status: 'Archived',
            },
            include: {
                category: true,
                tags: true,
            },
        });
    }

    async updateListing(id: string, data: UpdateListingDto): Promise<Listing> {
        const { tags, category_id, user_id, ...listingData } = data;

        const updateData: Prisma.ListingUpdateInput = {
            ...listingData,
            category: category_id
                ? {
                    connect: { id: category_id },
                }
                : undefined,
            tags: tags
                ? {
                    set: tags.map((tag: string) => ({ id: tag })),
                }
                : undefined,
            user: user_id
                ? {
                    connect: { id: user_id },
                }
                : undefined,
        };

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: updateData,
            include: { tags: true, category: true },
        });

        if (data.photos || data.title || data.price || data.area || data.status === 'Active') {
            const subscriptions = await prisma.subscription.findMany({
                include: { buyer: true },
            });

            for (const subscription of subscriptions) {
                const filters = subscription.filters as {
                    category?: string;
                    type?: string;
                    minPrice?: number;
                    maxPrice?: number;
                    minArea?: number;
                    maxArea?: number;
                    tags?: string[];
                };

                if (this.matchesFilters(updatedListing, filters)) {
                    await notificationService.createNotification({
                        user_id: subscription.buyer_id,
                        subscription_id: subscription.id,
                        status: 'SENT',
                        listing_id: updatedListing.id,
                    });
                }
            }
        }

        return updatedListing;
    }

    async deleteListing(id: string): Promise<Listing> {
        return await prisma.listing.delete({
            where: { id },
        });
    }
}

export const listingService = new ListingService();