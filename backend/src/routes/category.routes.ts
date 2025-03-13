import { FastifyInstance } from 'fastify';
import { categoryController } from '../controllers/category.controller';

export async function categoryRoutes(fastify: FastifyInstance) {
    fastify.post('/categories', categoryController.create);

    fastify.get('/categories', categoryController.getAll);

    fastify.get('/categories/:id', categoryController.getById);

    fastify.put('/categories/:id', categoryController.update);

    fastify.delete('/categories/:id', categoryController.delete);
}