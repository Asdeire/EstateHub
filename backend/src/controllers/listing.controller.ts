import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { listingService } from '../services/listing.service';
import { createListingSchema, getAllFiltersSchema, updateListingSchema, CreateListingDto, GetAllFiltersDto, UpdateListingDto } from '../schemas/listing.schemas';

class ListingController {
    async create(
        req: FastifyRequest<{ Body: CreateListingDto }>,
        res: FastifyReply
    ): Promise<void> {
        try {
            const data = createListingSchema.parse(req.body);

            const userListingsCount = await listingService.countUserListings(data.user_id);
            if (userListingsCount >= 10) {
                res.status(400).send({ message: 'Maximum listings limit reached (10).' });
                return;
            }

            const listing = await listingService.createListing(data);
            res.status(201).send(listing);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getAll(
        req: FastifyRequest<{
            Querystring: GetAllFiltersDto;
        }>,
        res: FastifyReply
    ): Promise<void> {
        try {
            const query = getAllFiltersSchema.parse(req.query);

            const filters = {
                ...query,
                tags: query.tags ? query.tags.split(',') : undefined,
            };

            if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
                res.status(400).send({ message: 'minPrice cannot be greater than maxPrice' });
                return;
            }
            if (filters.minArea && filters.maxArea && filters.minArea > filters.maxArea) {
                res.status(400).send({ message: 'minArea cannot be greater than maxArea' });
                return;
            }

            const listings = await listingService.getAllListings(query.page, query.limit, filters);
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid query parameters', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getFavoriteListings(
        req: FastifyRequest<{ Params: { user_id: string } }>,
        res: FastifyReply
    ): Promise<void> {
        const { user_id } = req.params;
    
        try {
            z.string().uuid().parse(user_id);
    
            const listings = await listingService.getFavoriteListings(user_id);
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid user ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }    

    async getById(
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply
    ): Promise<void> {
        const { id } = req.params;

        try {
            z.string().uuid().parse(id);

            const listing = await listingService.getListingById(id);
            if (!listing) {
                res.status(404).send({ message: 'Listing not found' });
                return;
            }
            res.status(200).send(listing);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid listing ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getByUserId(
        req: FastifyRequest<{ Params: { user_id: string } }>,
        res: FastifyReply
    ): Promise<void> {
        const { user_id } = req.params;

        try {
            z.string().uuid().parse(user_id);

            const listings = await listingService.getListingsByUserId(user_id);
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid user ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async update(
        req: FastifyRequest<{ Params: { id: string }; Body: UpdateListingDto }>,
        res: FastifyReply
    ): Promise<void> {
        const { id } = req.params;

        try {
            z.string().uuid().parse(id);
            const data = updateListingSchema.parse(req.body);

            const updatedListing = await listingService.updateListing(id, data);
            if (!updatedListing) {
                res.status(404).send({ message: 'Listing not found for update' });
                return;
            }
            res.status(200).send(updatedListing);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async delete(
        req: FastifyRequest<{ Params: { id: string } }>,
        res: FastifyReply
    ): Promise<void> {
        const { id } = req.params;

        try {
            z.string().uuid().parse(id);

            const deletedListing = await listingService.deleteListing(id);
            if (!deletedListing) {
                res.status(404).send({ message: 'Listing not found for deletion' });
                return;
            }
            res.status(200).send(deletedListing);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid listing ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }
}

export const listingController = new ListingController();
