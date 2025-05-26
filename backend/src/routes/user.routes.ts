import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

const userController = new UserController();

export async function userRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/user/:id', {
        schema: {
            summary: 'Get a user by ID',
            tags: ['User'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'User#' },
            },
        },
        handler: userController.getUser,
    });

    fastify.put('/user/:id', {
        schema: {
            summary: 'Update a user',
            tags: ['User'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'UserUpdate#' },
            response: {
                200: { $ref: 'User#' },
            },
        },
        handler: userController.updateUser,
    });

    fastify.delete('/user/:id', {
        schema: {
            summary: 'Delete a user',
            tags: ['User'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                204: { type: 'null' },
            },
        },
        handler: userController.deleteUser,
    });
}