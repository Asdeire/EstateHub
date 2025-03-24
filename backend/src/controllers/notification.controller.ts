import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification.service';
import { SubscriptionService } from '../services/subscription.service';
import { authMiddleware } from '../middleware/auth.middleware';

const notificationService = new NotificationService();
const subscriptionService = new SubscriptionService();

export class NotificationController {
    async createNotification(
        request: FastifyRequest<{
            Body: {
                subscription_id: string;
                message: string;
                status: 'SENT' | 'DELIVERED' | 'FAILED';
            };
        }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const { subscription_id, message, status } = request.body;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.getSubscriptionById(subscription_id);
        if (!subscription || subscription.buyer_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or subscription not found' });
        }

        const notification = await notificationService.createNotification({
            user_id: userId,
            subscription_id,
            message,
            status,
        });

        return reply.status(201).send(notification);
    }

    async getNotifications(request: FastifyRequest, reply: FastifyReply) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const notifications = await notificationService.getNotificationsByUser(userId);
        return reply.send(notifications);
    }

    async getNotificationById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const notificationId = request.params.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const notification = await notificationService.getNotificationById(notificationId);
        if (!notification || notification.user_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or notification not found' });
        }

        return reply.send(notification);
    }

    async getNotificationsBySubscription(
        request: FastifyRequest<{ Params: { subscriptionId: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const subscriptionId = request.params.subscriptionId;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.buyer_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or subscription not found' });
        }

        const notifications = await notificationService.getNotificationsBySubscription(subscriptionId);
        return reply.send(notifications);
    }

    async updateNotificationStatus(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { status: 'SENT' | 'DELIVERED' | 'FAILED' };
        }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const notificationId = request.params.id;
        const { status } = request.body;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const notification = await notificationService.getNotificationById(notificationId);
        if (!notification || notification.user_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or notification not found' });
        }

        const updatedNotification = await notificationService.updateNotificationStatus(notificationId, status);
        return reply.send(updatedNotification);
    }

    async deleteNotification(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const notificationId = request.params.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const notification = await notificationService.getNotificationById(notificationId);
        if (!notification || notification.user_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or notification not found' });
        }

        await notificationService.deleteNotification(notificationId);
        return reply.send({ message: 'Notification deleted' });
    }
}