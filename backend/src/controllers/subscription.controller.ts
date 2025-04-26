import { FastifyRequest, FastifyReply } from 'fastify';
import { SubscriptionService } from '../services/subscription.service';
import { authMiddleware } from '../middleware/auth.middleware';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
    async getSubscriptions(request: FastifyRequest, reply: FastifyReply) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscriptions = await subscriptionService.getSubscriptionsByUser(userId);
        return reply.send(subscriptions);
    }

    async getSubscriptionById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const subscriptionId = request.params.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.buyer_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or subscription not found' });
        }

        return reply.send(subscription);
    }

    async getSubscriptionsByUser(
        request: FastifyRequest<{ Params: { buyer_id: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const buyerId = request.params.buyer_id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        if (userId !== buyerId) {
            return reply.status(403).send({ message: 'Access denied' });
        }

        const subscriptions = await subscriptionService.getSubscriptionsByUser(buyerId);
        return reply.send(subscriptions);
    }


    async createSubscription(
        request: FastifyRequest<{
            Body: { filters: any; transport: 'EMAIL' | 'TELEGRAM' };
        }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const { filters, transport } = request.body;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.createSubscription({
            buyer_id: userId,
            filters,
            transport,
        });

        return reply.status(201).send(subscription);
    }

    async updateSubscription(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { filters?: any; transport?: 'EMAIL' | 'TELEGRAM' };
        }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const subscriptionId = request.params.id;
        const { filters, transport } = request.body;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.buyer_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or subscription not found' });
        }

        const updatedSubscription = await subscriptionService.updateSubscription(subscriptionId, {
            filters,
            transport,
        });

        return reply.send(updatedSubscription);
    }

    async deleteSubscription(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        await authMiddleware(request, reply);
        const userId = request.user?.id;
        const subscriptionId = request.params.id;

        if (!userId) {
            return reply.status(401).send({ message: 'User not found' });
        }

        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        if (!subscription || subscription.buyer_id !== userId) {
            return reply.status(403).send({ message: 'Access denied or subscription not found' });
        }

        await subscriptionService.deleteSubscription(subscriptionId);
        return reply.send({ message: 'Subscription deleted' });
    }
}