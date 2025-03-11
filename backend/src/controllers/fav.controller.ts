import { FastifyRequest, FastifyReply } from 'fastify';
import { FavoritesService } from '../services/fav.service';
import { authMiddleware } from '../middleware/auth.middleware';

const favoritesService = new FavoritesService();

export class FavoritesController {
    async getFavorites(request: FastifyRequest, reply: FastifyReply) {
        await authMiddleware(request, reply); 
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ message: 'Користувача не знайдено' });
        }

        const favorites = await favoritesService.getFavorites(userId);
        return reply.send(favorites);
    }

    async addFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        await authMiddleware(request, reply);

        const userId = request.user?.id;
        const listingId = request.params.listingId;


        if (!userId) {
            return reply.status(401).send({ message: 'Користувача не знайдено' });
        }

        await favoritesService.addFavorite(userId, listingId);

        return reply.send({ message: 'Оголошення додано до улюблених' });
    }

    async removeFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        await authMiddleware(request, reply);

        const userId = request.user?.id;
        const listingId = request.params.listingId;

        if (!userId) {
            return reply.status(401).send({ message: 'Користувача не знайдено' });
        }

        await favoritesService.removeFavorite(userId, listingId);

        return reply.send({ message: 'Оголошення видалено з улюблених' });
    }
}
