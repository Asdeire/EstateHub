import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';

console.log('adminController:', adminController);

export async function adminRoutes(fastify: FastifyInstance) {
    const opts: RouteShorthandOptions = {
        preHandler: [authMiddleware, adminAuthMiddleware],
    };

    fastify.get('/users', opts, adminController.getAllUsers);
    fastify.put<{ Params: { id: string }; Body: { name?: string; email?: string; role?: 'User' | 'Makler' | 'Admin'; telegram_username?: string } }>(
        '/users/:id',
        opts,
        adminController.updateUser
    );
    fastify.delete<{ Params: { id: string } }>('/users/:id', opts, adminController.deleteUser);

    fastify.get('/listings', opts, adminController.getAllListings);
    fastify.put<{ Params: { id: string }; Body: { title?: string; description?: string; price?: number; status?: 'Active' | 'Archived'; is_agent_listing?: boolean; type?: string; location?: string; area?: number; photos?: string[]; category_id?: string } }>(
        '/listings/:id',
        opts,
        adminController.updateListing
    );
    fastify.delete<{ Params: { id: string } }>('/listings/:id', opts, adminController.deleteListing);

    fastify.get('/categories', opts, adminController.getAllCategories);
    fastify.post<{ Body: { name: string; description?: string } }>(
        '/categories',
        opts,
        adminController.createCategory
    );
    fastify.put<{ Params: { id: string }; Body: { name?: string; description?: string } }>(
        '/categories/:id',
        opts,
        adminController.updateCategory
    );
    fastify.delete<{ Params: { id: string } }>('/categories/:id', opts, adminController.deleteCategory);

    fastify.get('/tags', opts, adminController.getAllTags);
    fastify.post<{ Body: { name: string } }>(
        '/tags',
        opts,
        adminController.createTag
    );
    fastify.put<{ Params: { id: string }; Body: { name?: string } }>(
        '/tags/:id',
        opts,
        adminController.updateTag
    );
    fastify.delete<{ Params: { id: string } }>('/tags/:id', opts, adminController.deleteTag);

    fastify.get('/subscriptions', opts, adminController.getAllSubscriptions);
    fastify.delete<{ Params: { id: string } }>('/subscriptions/:id', opts, adminController.deleteSubscription);

    fastify.get('/notifications', opts, adminController.getAllNotifications);
    fastify.delete<{ Params: { id: string } }>('/notifications/:id', opts, adminController.deleteNotification);
}