import { FastifyInstance } from 'fastify';
import prisma from '../utils/database';

const listingRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/listings', async (request, reply) => {
        const {
            user_id,
            is_agent_listing,
            type,
            location,
            price,
            area,
            description,
            photos,
            status,
            category_id,
        } = request.body as {
            user_id: string;
            is_agent_listing: boolean;
            type: string;
            location: string;
            price: number;
            area: number;
            description: string;
            photos: string[];
            status: 'Active' | 'Archived';
            category_id: string;
        };

        if (!['Active', 'Archived'].includes(status)) {
            return reply.status(400).send({ error: 'Invalid status provided.' });
        }

        try {
            const listing = await prisma.listing.create({
                data: {
                    user_id,
                    is_agent_listing,
                    type,
                    location,
                    price,
                    area,
                    description,
                    photos,
                    status,
                    category_id,
                },
            });

            reply.send(listing);
        } catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    });
};

export default listingRoutes;
