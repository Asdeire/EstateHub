import { FastifyRequest, FastifyReply } from 'fastify';

export async function adminAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user || request.user.role !== 'Admin') {
        return reply.code(403).send({ error: 'Access denied. Admin role required.' });
    }
}