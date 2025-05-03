import fastify from 'fastify';
import dotenv from 'dotenv';
import { registerRoutes } from './routes';
import cors from '@fastify/cors';
import { authMiddleware } from './middleware/auth.middleware';

const start = async () => {
    dotenv.config();
    const app = fastify({ logger: true });

    await app.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    });

    app.addHook('preHandler', authMiddleware);

    registerRoutes(app);

    try {
        await app.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 3000 });
        app.log.info(`Server listening on ${process.env.PORT || 3000}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();