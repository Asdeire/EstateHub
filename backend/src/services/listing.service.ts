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


    async getAllListings(): Promise<Listing[]> {
        return await prisma.listing.findMany({
            include: {
                category: true,
                tags: true,
            },
        });
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

    async updateListing(id: string, data: Partial<Listing> & { tags?: string[] }): Promise<Listing> {
        const { tags, ...listingData } = data;

        const updateData: Prisma.ListingUpdateInput = {
            ...listingData,
            tags: tags ? {
                connect: tags.map((tagId) => ({ id: tagId })),
            } : undefined,
        };

        return await prisma.listing.update({
            where: { id },
            data: updateData,
        });
    }


    async deleteListing(id: string): Promise<Listing> {
        return await prisma.listing.delete({
            where: { id },
        });
    }
}

export const listingService = new ListingService();
