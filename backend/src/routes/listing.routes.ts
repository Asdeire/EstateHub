import { FastifyInstance } from 'fastify';
import { listingController } from '../controllers/listing.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

export async function listingRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.post('/listings', {
        schema: {
            summary: 'Create a listing',
            tags: ['Listing'],
            body: { $ref: 'ListingCreate' },
            response: {
                201: { $ref: 'Listing' },
            },
        },
        handler: listingController.create,
    });

    fastify.get('/listings', {
        schema: {
            summary: 'Get all listings',
            tags: ['Listing'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing' },
                },
            },
        },
        handler: listingController.getAll,
    });

    fastify.get('/listings/active', {
        schema: {
            summary: 'Get all active listings',
            tags: ['Listing'],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 12 },
                    minPrice: { type: 'number', minimum: 0 },
                    maxPrice: { type: 'number', minimum: 0 },
                    minArea: { type: 'number', minimum: 0 },
                    maxArea: { type: 'number', minimum: 0 },
                    category: { type: 'string', format: 'uuid' },
                    type: { type: 'string' },
                    tags: { type: 'string' },
                    location: { type: 'string' },
                    is_verified: { type: 'boolean' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        listings: {
                            type: 'array',
                            items: { $ref: 'Listing' },
                        },
                        totalPages: { type: 'integer' },
                    },
                },
            },
        },
        handler: listingController.getActiveListings,
    });

    fastify.get('/listings/:id', {
        schema: {
            summary: 'Get a listing by ID',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'Listing' },
            },
        },
        handler: listingController.getById,
    });

    fastify.get('/listings/:userId/active', {
        schema: {
            summary: 'Get active listings by user',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing' },
                },
            },
        },
        handler: listingController.getActiveListingsByUser,
    });

    fastify.get('/listings/:userId/archived', {
        schema: {
            summary: 'Get archived listings by user',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing' },
                },
            },
        },
        handler: listingController.getArchivedListingsByUser,
    });

    fastify.get('/listings/favorites/:user_id', {
        schema: {
            summary: 'Get favorite listings by user',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    user_id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing' },
                },
            },
        },
        handler: listingController.getFavoriteListings,
    });

    fastify.get('/listings/nearby', {
        schema: {
            summary: 'Get listings nearby based on location',
            tags: ['Listing'],
            querystring: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    location: { type: 'string' },
                },
                required: ['location'],
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing' },
                },
            },
        },
        handler: listingController.getNearby,
    });

    fastify.put('/listings/:id', {
        schema: {
            summary: 'Update a listing',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'ListingUpdate' },
            response: {
                200: { $ref: 'Listing' },
            },
        },
        handler: listingController.update,
    });

    fastify.delete('/listings/:id', {
        schema: {
            summary: 'Delete a listing',
            tags: ['Listing'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                204: { type: 'null' },
            },
        },
        handler: listingController.delete,
    });
}