import { FastifyInstance } from 'fastify';
import { NotificationController } from '../controllers/notification.controller';
import { swaggerSchemas } from '../schemas/swagger.schemas';

const notificationController = new NotificationController();

export async function notificationRoutes(fastify: FastifyInstance) {
    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.post('/notifications', {
        schema: {
            summary: 'Create a notification',
            tags: ['Notification'],
            body: { $ref: 'NotificationCreate#' },
            response: {
                201: { $ref: 'Notification#' },
            },
        },
        handler: notificationController.createNotification,
    });

    fastify.get('/notifications', {
        schema: {
            summary: 'Get all notifications',
            tags: ['Notification'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Notification#' },
                },
            },
        },
        handler: notificationController.getNotifications,
    });

    fastify.get('/notifications/:id', {
        schema: {
            summary: 'Get a notification by ID',
            tags: ['Notification'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: { $ref: 'Notification#' },
            },
        },
        handler: notificationController.getNotificationById,
    });

    fastify.get('/subscriptions/:subscriptionId/notifications', {
        schema: {
            summary: 'Get notifications by subscription',
            tags: ['Notification'],
            params: {
                type: 'object',
                properties: {
                    subscriptionId: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Notification#' },
                },
            },
        },
        handler: notificationController.getNotificationsBySubscription,
    });

    fastify.put('/notifications/:id/status', {
        schema: {
            summary: 'Update notification status',
            tags: ['Notification'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'NotificationStatusUpdate#' },
            response: {
                200: { $ref: 'Notification#' },
            },
        },
        handler: notificationController.updateNotificationStatus,
    });

    fastify.delete('/notifications/:id', {
        schema: {
            summary: 'Delete a notification',
            tags: ['Notification'],
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
        handler: notificationController.deleteNotification,
    });

    fastify.delete('/notifications', {
        schema: {
            summary: 'Clear all user notifications',
            tags: ['Notification'],
            response: {
                204: { type: 'null' },
            },
        },
        handler: notificationController.clearUserNotifications,
    });
}