import { FastifyRequest, FastifyReply } from 'fastify';
import { listingService } from '../services/listing.service';

interface CreateListingDto {
    user_id: string;
    is_agent_listing: boolean;
    type: string;
    location: string;
    price: number;
    area: number;
    description?: string;
    photos: string[];
    status: "Active" | "Archived";
    category_id?: string;
    tags: string[];
    title: string;
}

class ListingController {
    async create(req: FastifyRequest<{ Body: CreateListingDto }>, res: FastifyReply): Promise<void> {
        try {
            const listing = await listingService.createListing(req.body);
            res.status(201).send(listing);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getAll(req: FastifyRequest<{
        Querystring: {
            page?: number,
            limit?: number,
            category?: string,
            type?: string,
            minPrice?: number,
            maxPrice?: number,
            minArea?: number,
            maxArea?: number,
            status?: string,
            tags?: string
        }
    }>, res: FastifyReply): Promise<void> {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;

        const filters = {
            category: req.query.category,
            type: req.query.type, 
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            minArea: req.query.minArea,
            maxArea: req.query.maxArea,
            status: req.query.status,
            tags: req.query.tags ? req.query.tags.split(',') : undefined,
        };

        try {
            const listings = await listingService.getAllListings(page, limit, filters);
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getById(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const listing = await listingService.getListingById(id);
            if (!listing) {
                res.status(404).send({ message: 'Listing not found' });
                return;
            }
            res.status(200).send(listing);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getByUserId(req: FastifyRequest<{ Params: { user_id: string } }>, res: FastifyReply): Promise<void> {
        const { user_id } = req.params;

        try {
            const listings = await listingService.getListingsByUserId(user_id);
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async update(req: FastifyRequest<{ Params: { id: string }, Body: CreateListingDto }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const updatedListing = await listingService.updateListing(id, req.body);
            if (!updatedListing) {
                res.status(404).send({ message: 'Listing not found for update' });
                return;
            }
            res.status(200).send(updatedListing);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const deletedListing = await listingService.deleteListing(id);
            if (!deletedListing) {
                res.status(404).send({ message: 'Listing not found for deletion' });
                return;
            }
            res.status(200).send(deletedListing);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }
}

export const listingController = new ListingController();
