import fastify from 'fastify';
import dotenv from 'dotenv';
import { userRoutes } from './routes/user.routes';
import { listingRoutes } from './routes/listing.routes';
import { authRoutes } from './routes/auth.routes';
import { favRoutes } from './routes/fav.routes';
import { tagRoutes } from './routes/tag.routes';
import { categoryRoutes } from './routes/category.routes';
import cors from '@fastify/cors';

dotenv.config();

const app = fastify();

app.register(userRoutes);
app.register(listingRoutes);
app.register(authRoutes);
app.register(favRoutes);
app.register(tagRoutes);
app.register(categoryRoutes);

app.register(cors, {
    origin: 'http://localhost:5173',
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
