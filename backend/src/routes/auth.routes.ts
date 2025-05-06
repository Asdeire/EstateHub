import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', authController.login.bind(authController));
    fastify.post('/register', authController.register.bind(authController));
    fastify.post('/verify', authController.verify.bind(authController));
    fastify.post('/password-reset', authController.requestPasswordReset.bind(authController));
    fastify.post('/password-reset/confirm', authController.resetPassword.bind(authController));
}