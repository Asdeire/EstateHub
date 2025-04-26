import { FastifyInstance } from 'fastify';
import { SubscriptionController } from '../controllers/subscription.controller';

const subscriptionController = new SubscriptionController();

export async function subscriptionRoutes(fastify: FastifyInstance) {
    fastify.get('/subscriptions', subscriptionController.getSubscriptions);

    fastify.get('/subscriptions/:id', subscriptionController.getSubscriptionById);

    fastify.get('/subscriptions/user/:buyer_id', subscriptionController.getSubscriptionsByUser);

    fastify.post('/subscriptions', subscriptionController.createSubscription);

    fastify.put('/subscriptions/:id', subscriptionController.updateSubscription);

    fastify.delete('/subscriptions/:id', subscriptionController.deleteSubscription);
}
