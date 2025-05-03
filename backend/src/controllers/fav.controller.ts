import { FastifyRequest, FastifyReply } from 'fastify';
import { FavoritesService } from '../services/fav.service';

const favoritesService = new FavoritesService();

export class FavoritesController {
    async getFavorites(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const favorites = await favoritesService.getFavorites(userId);
        return reply.send(favorites);
    }

    async addFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        const userId = request.user?.id;
        const listingId = request.params.listingId;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        await favoritesService.addFavorite(userId, listingId);

        return reply.send({ message: 'Listing added to favorites' });
    }

    async removeFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        const userId = request.user?.id;
        const listingId = request.params.listingId;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        await favoritesService.removeFavorite(userId, listingId);

        return reply.send({ message: 'Listing removed from favorites' });
    }
}