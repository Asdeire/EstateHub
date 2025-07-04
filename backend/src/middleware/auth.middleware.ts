import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../utils/config';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const url = request.url.split('?')[0];
  const method = request.method;

  const publicRoutes: { path: string; methods: string[] }[] = [
    { path: '/login', methods: ['POST'] },
    { path: '/register', methods: ['POST'] },
    { path: '/refresh', methods: ['POST'] },
    { path: '/password-reset', methods: ['POST'] },
    { path: '/password-reset/confirm', methods: ['POST'] },
    { path: '/verify', methods: ['POST'] },
    { path: '/webhook', methods: ['POST'] },
    { path: '/categories', methods: ['GET'] },
    { path: '/listings', methods: ['GET'] },
    { path: '/listings/nearby', methods: ['GET'] },
    { path: '/tags', methods: ['GET'] },
    { path: '/user', methods: ['GET'] },
    { path: '/docs/static', methods: ['GET'] },
    { path: '/docs', methods: ['GET'] },
  ];

  const isPublicRoute = publicRoutes.some(({ path, methods }) => {
    if (path === url && methods.includes(method)) return true;

    const regex = new RegExp(`^${path}/[^/]+$`);
    return regex.test(url) && methods.includes(method);
  });

  if (isPublicRoute) {
    return;
  }

  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(403).send({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      role: string;
    };
    request.user = { id: decoded.id, role: decoded.role };
  } catch (error) {
    return reply.code(403).send({ error: 'Invalid or expired token' });
  }
}
