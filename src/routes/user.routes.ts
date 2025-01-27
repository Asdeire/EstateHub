import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';

const userController = new UserController();

export async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/user/:id', userController.getUser);

    fastify.put('/user/:id', userController.updateUser);

    fastify.delete('/user/:id', userController.deleteUser);
}
