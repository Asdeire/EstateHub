import { FastifyInstance } from 'fastify';
import prisma from '../utils/database';
import bcrypt from 'bcrypt';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/register', async (request, reply) => {
        const { name, email, password_hash, role } = request.body as {
            name: string;
            email: string;
            password_hash: string;
            role: 'User' | 'Makler' | 'Admin';  
        };

        const hashedPassword = await bcrypt.hash(password_hash, 10);

        if (!['User', 'Makler', 'Admin'].includes(role)) {
            return reply.status(400).send({ error: 'Invalid role provided.' });
        }

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password_hash: hashedPassword,
                    role
                }
            });

            reply.send(user);
        } catch (error) {
            reply.status(500).send({ error: 'Internal server error' });
        }
    });
};

export default userRoutes;
