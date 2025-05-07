import { FastifyInstance } from 'fastify';
import { userRoutes } from './user.routes';
import { listingRoutes } from './listing.routes';
import { authRoutes } from './auth.routes';
import { favRoutes } from './fav.routes';
import { tagRoutes } from './tag.routes';
import { categoryRoutes } from './category.routes';
import { subscriptionRoutes } from './subscription.routes';
import { notificationRoutes } from './notification.routes';
import {webhookRoutes} from './webhook.routes';

export const registerRoutes = (app: FastifyInstance) => {
    app.register(userRoutes);
    app.register(listingRoutes);
    app.register(authRoutes);
    app.register(favRoutes);
    app.register(tagRoutes);
    app.register(categoryRoutes);
    app.register(subscriptionRoutes);
    app.register(notificationRoutes);
    app.register(webhookRoutes);
};
