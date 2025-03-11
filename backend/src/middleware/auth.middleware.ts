import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    try {
        const token = request.headers.authorization?.split(' ')[1]; 
        if (!token) {
            return reply.status(401).send({ message: 'Будь ласка, авторизуйтесь' });
        }

        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as { id: string }; 

        request.user = decoded; 
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return reply.status(401).send({ message: 'Недійсний токен' });
    }
}
