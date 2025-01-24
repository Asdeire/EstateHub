import fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import listingRoutes from './routes/listing.routes';

dotenv.config();

const app = fastify();

app.register(userRoutes);
app.register(listingRoutes);

const start = async () => {
    try {
        await app.listen({port:3000, host:'0.0.0.0'});
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
