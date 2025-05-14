import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { listingService } from '../services/listing.service';
import { categoryService } from '../services/category.service';
import { tagService } from '../services/tag.service';
import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';
import {
    idParamsSchema,
    updateUserSchema,
    updateListingSchema,
    createCategorySchema,
    updateCategorySchema,
    createTagSchema,
    updateTagSchema,
} from '../schemas/admin.schemas';

class AdminController {
    private userService = new UserService();
    private listingService = listingService;
    private categoryService = categoryService;
    private tagService = tagService;
    private subscriptionService = new SubscriptionService();
    private notificationService = new NotificationService();

    getAllUsers = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).send(users);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    updateUser = async (
        req: FastifyRequest<{
            Params: { id: string };
            Body: { name?: string; email?: string; role?: 'User' | 'Makler' | 'Admin'; telegram_username?: string };
        }>,
        res: FastifyReply
    ): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const data = updateUserSchema.parse(req.body);
            const user = await this.userService.updateUser(id, data);
            if (!user) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            res.status(200).send(user);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteUser = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.userService.deleteUser(id);
            if (!result) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            res.status(200).send({ message: 'User deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid user ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    getAllListings = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const listings = await this.listingService.getAllListingsWithoutFilters();
            res.status(200).send(listings);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    updateListing = async (
        req: FastifyRequest<{
            Params: { id: string };
            Body: {
                title?: string;
                description?: string;
                price?: number;
                status?: 'Active' | 'Archived';
                is_agent_listing?: boolean;
                type?: string;
                location?: string;
                area?: number;
                photos?: string[];
                category_id?: string;
            };
        }>,
        res: FastifyReply
    ): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const data = updateListingSchema.parse(req.body);
            const listing = await this.listingService.updateListing(id, data);
            if (!listing) {
                res.status(404).send({ message: 'Listing not found' });
                return;
            }
            res.status(200).send(listing);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteListing = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.listingService.deleteListing(id);
            if (!result) {
                res.status(404).send({ message: 'Listing not found' });
                return;
            }
            res.status(200).send({ message: 'Listing deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid listing ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    getAllCategories = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.status(200).send(categories);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    createCategory = async (
        req: FastifyRequest<{ Body: { name: string; description?: string } }>,
        res: FastifyReply
    ): Promise<void> => {
        try {
            const data = createCategorySchema.parse(req.body);
            const category = await this.categoryService.createCategory(data);
            res.status(201).send(category);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    updateCategory = async (
        req: FastifyRequest<{ Params: { id: string }; Body: { name?: string; description?: string } }>,
        res: FastifyReply
    ): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const data = updateCategorySchema.parse(req.body);
            const category = await this.categoryService.updateCategory(id, data);
            if (!category) {
                res.status(404).send({ message: 'Category not found' });
                return;
            }
            res.status(200).send(category);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteCategory = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.categoryService.deleteCategory(id);
            if (!result) {
                res.status(404).send({ message: 'Category not found' });
                return;
            }
            res.status(200).send({ message: 'Category deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid category ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    getAllTags = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const tags = await this.tagService.getAllTags();
            res.status(200).send(tags);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    createTag = async (req: FastifyRequest<{ Body: { name: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const data = createTagSchema.parse(req.body);
            const tag = await this.tagService.createTag(data);
            res.status(201).send(tag);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    updateTag = async (
        req: FastifyRequest<{ Params: { id: string }; Body: { name?: string } }>,
        res: FastifyReply
    ): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const data = updateTagSchema.parse(req.body);
            const tag = await this.tagService.updateTag(id, data);
            if (!tag) {
                res.status(404).send({ message: 'Tag not found' });
                return;
            }
            res.status(200).send(tag);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid input', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteTag = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.tagService.deleteTag(id);
            if (!result) {
                res.status(404).send({ message: 'Tag not found' });
                return;
            }
            res.status(200).send({ message: 'Tag deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid tag ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    getAllSubscriptions = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const subscriptions = await this.subscriptionService.getAllSubscriptions();
            res.status(200).send(subscriptions);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteSubscription = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.subscriptionService.deleteSubscription(id);
            if (!result) {
                res.status(404).send({ message: 'Subscription not found' });
                return;
            }
            res.status(200).send({ message: 'Subscription deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid subscription ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    getAllNotifications = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
        try {
            const notifications = await this.notificationService.getAllNotifications();
            res.status(200).send(notifications);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };

    deleteNotification = async (req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> => {
        try {
            const { id } = idParamsSchema.parse(req.params);
            const result = await this.notificationService.deleteNotification(id);
            if (!result) {
                res.status(404).send({ message: 'Notification not found' });
                return;
            }
            res.status(200).send({ message: 'Notification deleted successfully' });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: 'Invalid notification ID', errors: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    };
}

export const adminController = new AdminController();