import { FastifyInstance } from 'fastify';
import { tagController } from '../controllers/tag.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

export async function tagRoutes(fastify: FastifyInstance) {

    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/tags', {
        schema: {
            summary: 'Get all tags',
            tags: ['Tag'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Tag' },
                },
            },
        },
        handler: tagController.getAll,
    });

    fastify.get('/tags/:id', {
        schema: {
            summary: 'Get a tag by ID',
            tags: ['Tag'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'Tag#' },
            },
        },
        handler: tagController.getById,
    });
}
