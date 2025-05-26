import { FastifyInstance } from 'fastify';
import { FavoritesController } from '../controllers/fav.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

const favoritesController = new FavoritesController();

export async function favRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/favorites', {
        schema: {
            summary: 'Get all favorites',
            tags: ['Favorites'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Favorite#' },
                },
            },
        },
        handler: favoritesController.getFavorites,
    });

    fastify.post('/favorites/:listingId', {
        schema: {
            summary: 'Add a favorite',
            tags: ['Favorites'],
            params: {
                type: 'object',
                properties: {
                    listingId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                201: { $ref: 'Favorite#' },
            },
        },
        handler: favoritesController.addFavorite,
    });

    fastify.delete('/favorites/:listingId', {
        schema: {
            summary: 'Remove a favorite',
            tags: ['Favorites'],
            params: {
                type: 'object',
                properties: {
                    listingId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                204: { type: 'null' },
            },
        },
        handler: favoritesController.removeFavorite,
    });
}