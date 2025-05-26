import { FastifyInstance } from 'fastify';
import { SubscriptionController } from '../controllers/subscription.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

const subscriptionController = new SubscriptionController();

export async function subscriptionRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/subscriptions', {
        schema: {
            summary: 'Get all subscriptions',
            tags: ['Subscription'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Subscription#' },
                },
            },
        },
        handler: subscriptionController.getSubscriptions,
    });

    fastify.get('/subscriptions/:id', {
        schema: {
            summary: 'Get a subscription by ID',
            tags: ['Subscription'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'Subscription#' },
            },
        },
        handler: subscriptionController.getSubscriptionById,
    });

    fastify.get('/subscriptions/user/:buyer_id', {
        schema: {
            summary: 'Get subscriptions by user',
            tags: ['Subscription'],
            params: {
                type: 'object',
                properties: {
                    buyer_id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Subscription#' },
                },
            },
        },
        handler: subscriptionController.getSubscriptionsByUser,
    });

    fastify.post('/subscriptions', {
        schema: {
            summary: 'Create a subscription',
            tags: ['Subscription'],
            body: { $ref: 'SubscriptionCreate#' },
            response: {
                201: { $ref: 'Subscription#' },
            },
        },
        handler: subscriptionController.createSubscription,
    });

    fastify.put('/subscriptions/:id', {
        schema: {
            summary: 'Update a subscription',
            tags: ['Subscription'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'SubscriptionUpdate#' },
            response: {
                200: { $ref: 'Subscription#' },
            },
        },
        handler: subscriptionController.updateSubscription,
    });

    fastify.delete('/subscriptions/:id', {
        schema: {
            summary: 'Delete a subscription',
            tags: ['Subscription'],
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
        handler: subscriptionController.deleteSubscription,
    });
}