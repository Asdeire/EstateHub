import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

export default async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', authController.login.bind(authController));
    fastify.post('/register', authController.register.bind(authController));
}
