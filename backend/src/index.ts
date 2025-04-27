import fastify from 'fastify';
import dotenv from 'dotenv';
import { registerRoutes } from './routes';
import cors from '@fastify/cors';

dotenv.config();

const app = fastify();

registerRoutes(app);

const corsUrl = process.env.CORS_URL || 'http://localhost:5173';

app.register(cors, {
    origin: corsUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
});

const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
