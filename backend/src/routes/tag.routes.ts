import { FastifyInstance } from 'fastify';
import { tagController } from '../controllers/tag.controller';

export async function tagRoutes(fastify: FastifyInstance) {
    fastify.post('/tags', tagController.create);

    fastify.get('/tags', tagController.getAll);

    fastify.get('/tags/:id', tagController.getById);

    fastify.put('/tags/:id', tagController.update);

    fastify.delete('/tags/:id', tagController.delete);
}
