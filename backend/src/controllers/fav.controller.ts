import { FastifyRequest, FastifyReply } from 'fastify';
import { FavoritesService } from '../services/fav.service';
import jwt from 'jsonwebtoken';

const favoritesService = new FavoritesService();

export class FavoritesController {
    async getFavorites(request: FastifyRequest, reply: FastifyReply) {
        try {
            const token = request.headers.authorization?.split(' ')[1]; 
            if (!token) {
                return reply.status(401).send({ message: 'Будь ласка, авторизуйтесь' });
            }

            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as { id: string }; 

            request.user = decoded;

            const userId = request.user.id; 

            const favorites = await favoritesService.getFavorites(userId);
            return reply.send(favorites);
        } catch (error) {
            console.error('JWT Error:', error);
            return reply.status(401).send({ message: 'Будь ласка, авторизуйтесь' });
        }
    }

    async addFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        try {
            const token = request.headers.authorization?.split(' ')[1]; 
            if (!token) {
                return reply.status(401).send({ message: 'Будь ласка, авторизуйтесь' });
            }

            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as { id: string }; 
            const userId = decoded.id; 

            const listingId = request.params.listingId; 

            await favoritesService.addFavorite(userId, listingId);

            return reply.send({ message: 'Оголошення додано до улюблених' });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return reply.status(500).send({ message: 'Помилка додавання в улюблені' });
        }
    }

    async removeFavorite(request: FastifyRequest<{ Params: { listingId: string } }>, reply: FastifyReply) {
        try {
            const token = request.headers.authorization?.split(' ')[1]; 
            if (!token) {
                return reply.status(401).send({ message: 'Будь ласка, авторизуйтесь' });
            }

            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as { id: string }; 
            const userId = decoded.id; 

            const listingId = request.params.listingId; 

            await favoritesService.removeFavorite(userId, listingId);

            return reply.send({ message: 'Оголошення видалено з улюблених' });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return reply.status(500).send({ message: 'Помилка видалення з улюблених' });
        }
    }
}
