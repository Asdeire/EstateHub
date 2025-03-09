import { FastifyInstance } from 'fastify';
import { listingController } from '../controllers/listing.controller'; 

export async function listingRoutes(fastify: FastifyInstance) {
    fastify.post('/listings', listingController.create);

    fastify.get('/listings', listingController.getAll);

    fastify.get('/listings/:id', listingController.getById);

    fastify.put('/listings/:id', listingController.update);

    fastify.delete('/listings/:id', listingController.delete);
}
