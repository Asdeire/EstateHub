import { FastifyInstance } from 'fastify';
import { categoryController } from '../controllers/category.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

export async function categoryRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/categories', {
        schema: {
            summary: 'Get all categories',
            tags: ['Category'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Category' },
                },
            },
        },
        handler: categoryController.getAll,
    });

    fastify.get('/categories/:id', {
        schema: {
            summary: 'Get a category by ID',
            tags: ['Category'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'Category#' },
            },
        },
        handler: categoryController.getById,
    });
}