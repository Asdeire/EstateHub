import { PrismaClient, Listing, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

class ListingService {
    async createListing(data: {
        user_id: string;
        is_agent_listing: boolean;
        type: string;
        location: string;
        price: number;
        area: number;
        description?: string;
        photos: string[];
        status: 'Active' | 'Archived';
        category_id?: string;
        tags: string[];
        title: string;
    }): Promise<Listing> {
        const userListingsCount = await prisma.listing.count({
            where: { user_id: data.user_id },
        });

        if (userListingsCount >= 10) {
            throw new Error('Maximum listings — 10.');
        }

        const { tags, ...listingData } = data;
        const listing = await prisma.listing.create({
            data: {
                ...listingData,
                status: data.status === 'Active' ? 'Active' : 'Archived',
                tags: {
                    connect: tags.map((tag: string | { id: string }) =>
                        typeof tag === 'string' ? { id: tag } : { id: tag.id }
                    ),
                }
            },
        });

        return listing;
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
        } = {}
    ): Promise<{ listings: Listing[], totalPages: number }> {
        const where: any = {};

        if (filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))) {
            where.price = { gte: Number(filters.minPrice) };
        }
        if (filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))) {
            where.price = { ...where.price, lte: Number(filters.maxPrice) };
        }

        if (filters.minArea !== undefined && !isNaN(Number(filters.minArea))) {
            where.area = { gte: Number(filters.minArea) };
        }
        if (filters.maxArea !== undefined && !isNaN(Number(filters.maxArea))) {
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
                    id: { in: filters.tags }
                }
            };
        }

        const totalListings = await prisma.listing.count({ where });
        const totalPages = Math.ceil(totalListings / limit);

        const skip = (page - 1) * limit;

        const listings = await prisma.listing.findMany({
            skip,
            take: limit,
            where,
            include: {
                category: true,
                tags: true,
            },
        });

        return { listings, totalPages };
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

    async getListingsByUserId(user_id: string): Promise<Listing[]> {
        return await prisma.listing.findMany({
            where: { user_id },
            include: {
                category: true,
                tags: true,
            },
        });
    }

    async updateListing(
        id: string,
        data: Partial<Listing> & { tags?: string[]; category_id?: string }
    ): Promise<Listing> {
        const { tags, category_id, user_id, ...listingData } = data;

        const updateData: Prisma.ListingUpdateInput = {
            ...listingData,
            category: category_id ? {
                connect: { id: category_id },
            } : undefined,
            tags: tags ? {
                set: tags.map((tag: string | { id: string }) =>
                    typeof tag === 'string' ? { id: tag } : { id: tag.id }
                ),
            } : undefined,
            user: user_id ? {
                connect: { id: user_id },
            } : undefined,
        };

        try {
            const updatedListing = await prisma.listing.update({
                where: { id },
                data: updateData,
                include: { tags: true },
            });

            return updatedListing;
        } catch (error) {
            console.error('Error updating listing:', error);
            throw new Error('Error: ' + error);
        }
    }

    async deleteListing(id: string): Promise<Listing> {
        return await prisma.listing.delete({
            where: { id },
        });
    }
}

export const listingService = new ListingService();
