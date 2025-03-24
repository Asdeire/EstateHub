import { FastifyInstance } from 'fastify';
import { NotificationController } from '../controllers/notification.controller';

const notificationController = new NotificationController();

export async function notificationRoutes(fastify: FastifyInstance) {
    fastify.post('/notifications', notificationController.createNotification);

    fastify.get('/notifications', notificationController.getNotifications);

    fastify.get('/notifications/:id', notificationController.getNotificationById);

    fastify.get('/subscriptions/:subscriptionId/notifications', notificationController.getNotificationsBySubscription);

    fastify.put('/notifications/:id/status', notificationController.updateNotificationStatus);

    fastify.delete('/notifications/:id', notificationController.deleteNotification);
}