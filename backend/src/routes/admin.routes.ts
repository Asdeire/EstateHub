import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware';
import { swaggerSchemas } from '../schemas/swagger.schemas';

export async function adminRoutes(fastify: FastifyInstance) {
    const opts: RouteShorthandOptions = {
        preHandler: [authMiddleware, adminAuthMiddleware],
    };

    for (const [key, schema] of Object.entries(swaggerSchemas)) {
        fastify.addSchema({ $id: key, ...schema });
    }

    fastify.get('/users', {
        ...opts,
        schema: {
            summary: 'Get all users',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'User#' },
                },
            },
        },
        handler: adminController.getAllUsers,
    });

    fastify.put('/users/:id', {
        ...opts,
        schema: {
            summary: 'Update a user',
            tags: ['Admin'],
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
        handler: adminController.updateUser,
    });

    fastify.delete('/users/:id', {
        ...opts,
        schema: {
            summary: 'Delete a user',
            tags: ['Admin'],
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
        handler: adminController.deleteUser,
    });

    fastify.get('/listings', {
        ...opts,
        schema: {
            summary: 'Get all listings',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Listing#' },
                },
            },
        },
        handler: adminController.getAllListings,
    });

    fastify.put('/listings/:id', {
        ...opts,
        schema: {
            summary: 'Update a listing',
            tags: ['Admin'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'ListingUpdate#' },
            response: {
                200: { $ref: 'Listing#' },
            },
        },
        handler: adminController.updateListing,
    });

    fastify.delete('/listings/:id', {
        ...opts,
        schema: {
            summary: 'Delete a listing',
            tags: ['Admin'],
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
        handler: adminController.deleteListing,
    });

    fastify.get('/categories', {
        ...opts,
        schema: {
            summary: 'Get all categories',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Category#' },
                },
            },
        },
        handler: adminController.getAllCategories,
    });

    fastify.post('/categories', {
        ...opts,
        schema: {
            summary: 'Create a category',
            tags: ['Admin'],
            body: { $ref: 'CategoryCreate#' },
            response: {
                201: { $ref: 'Category#' },
            },
        },
        handler: adminController.createCategory,
    });

    fastify.put('/categories/:id', {
        ...opts,
        schema: {
            summary: 'Update a category',
            tags: ['Admin'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'CategoryUpdate#' },
            response: {
                200: { $ref: 'Category#' },
            },
        },
        handler: adminController.updateCategory,
    });

    fastify.delete('/categories/:id', {
        ...opts,
        schema: {
            summary: 'Delete a category',
            tags: ['Admin'],
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
        handler: adminController.deleteCategory,
    });

    fastify.get('/tags', {
        ...opts,
        schema: {
            summary: 'Get all tags',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Tag#' },
                },
            },
        },
        handler: adminController.getAllTags,
    });

    fastify.post('/tags', {
        ...opts,
        schema: {
            summary: 'Create a tag',
            tags: ['Admin'],
            body: { $ref: 'TagCreate#' },
            response: {
                201: { $ref: 'Tag#' },
            },
        },
        handler: adminController.createTag,
    });

    fastify.put('/tags/:id', {
        ...opts,
        schema: {
            summary: 'Update a tag',
            tags: ['Admin'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: { $ref: 'TagUpdate#' },
            response: {
                200: { $ref: 'Tag#' },
            },
        },
        handler: adminController.updateTag,
    });

    fastify.delete('/tags/:id', {
        ...opts,
        schema: {
            summary: 'Delete a tag',
            tags: ['Admin'],
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
        handler: adminController.deleteTag,
    });

    fastify.get('/subscriptions', {
        ...opts,
        schema: {
            summary: 'Get all subscriptions',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Subscription#' },
                },
            },
        },
        handler: adminController.getAllSubscriptions,
    });

    fastify.delete('/subscriptions/:id', {
        ...opts,
        schema: {
            summary: 'Delete a subscription',
            tags: ['Admin'],
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
        handler: adminController.deleteSubscription,
    });

    fastify.get('/notifications', {
        ...opts,
        schema: {
            summary: 'Get all notifications',
            tags: ['Admin'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Notification#' },
                },
            },
        },
        handler: adminController.getAllNotifications,
    });

    fastify.delete('/notifications/:id', {
        ...opts,
        schema: {
            summary: 'Delete a notification',
            tags: ['Admin'],
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
        handler: adminController.deleteNotification,
    });
}