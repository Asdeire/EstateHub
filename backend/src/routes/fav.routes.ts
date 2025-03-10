import { FastifyInstance } from 'fastify';
import { FavoritesController } from '../controllers/fav.controller';

const favoritesController = new FavoritesController();

export async function favRoutes(fastify: FastifyInstance) {
    fastify.get('/favorites', favoritesController.getFavorites);

    fastify.post('/favorites/:listingId', favoritesController.addFavorite);

    fastify.delete('/favorites/:listingId', favoritesController.removeFavorite);
}
