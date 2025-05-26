import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { config } from './config';

export default fp(async (fastify) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'EstateHub API',
                description: 'API documentation for real estate platform',
                version: '1.0.0',
            },
            servers: [{ url: config.baseUrl }],
        },
    });

    await fastify.register(swaggerUI, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
        },
    });
});
