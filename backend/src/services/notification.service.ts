import { PrismaClient, Notification, NotificationStatus, Subscription, Transport } from '@prisma/client';
import { EmailService } from './email.service';
import { TelegramBotService } from './telegram-bot.service';
import {
    MissingTelegramUsernameError,
    TelegramChatNotLinkedError,
    TelegramChatNotFoundError,
    SubscriptionNotFoundError,
} from './errors';

const prisma = new PrismaClient();
const emailService = new EmailService();

export class NotificationService {
    private telegramBotService: TelegramBotService;

    constructor() {
        this.telegramBotService = new TelegramBotService();
    }

    async createNotification(data: {
        user_id: string;
        subscription_id: string;
        status: NotificationStatus;
        listing_id?: string;
        message?: string; 
    }): Promise<Notification> {
        let finalMessage: string;

        if (data.listing_id) {
            const listing = await prisma.listing.findUnique({
                where: { id: data.listing_id },
            });

            if (!listing) {
                throw new Error('Listing not found');
            }

            const cleanListingId = listing.id.replace(/[^a-zA-Z0-9-]/g, '');
            if (!cleanListingId) {
                throw new Error('Invalid listing ID after cleaning');
            }

            const baseUrl = process.env.APP_URL || 'http://localhost:5173';
            const link = `${baseUrl}/listings/${cleanListingId}`;

            finalMessage = `<b>Нове оголошення за вашою підпискою!</b> 🏠\n\n` +
                `<b>Назва:</b> ${listing.title}\n` +
                `<b>Ціна:</b> ${listing.price} грн\n` +
                `<b>Площа:</b> ${listing.area} м²\n` +
                `<a href="${link}">Переглянути оголошення</a>`;
        } else if (data.message) {
            finalMessage = data.message;
        } else {
            throw new Error('Either listing_id or message must be provided');
        }

        const notification = await prisma.notification.create({
            data: {
                user_id: data.user_id,
                subscription_id: data.subscription_id,
                message: finalMessage,
                status: data.status,
            },
        });

        const subscription = await prisma.subscription.findUnique({
            where: { id: data.subscription_id },
            include: { buyer: true },
        });

        if (!subscription) {
            await this.updateNotificationStatus(notification.id, 'FAILED', 'Subscription not found');
            throw new SubscriptionNotFoundError();
        }

        try {
            if (subscription.transport === Transport.EMAIL) {
                if (!subscription.buyer.email) {
                    await this.updateNotificationStatus(notification.id, 'FAILED', 'User must have an email address');
                    throw new Error('User must have an email address for EMAIL transport');
                }

                await emailService.sendNotificationEmail(
                    subscription.buyer.email,
                    'Нове оголошення за вашою підпискою',
                    `<p>${finalMessage}</p>`,
                );

                await this.updateNotificationStatus(notification.id, 'DELIVERED');
            }

            if (subscription.transport === Transport.TELEGRAM) {
                if (!subscription.buyer.telegram_username) {
                    await this.updateNotificationStatus(notification.id, 'FAILED', 'User must have a Telegram username');
                    throw new MissingTelegramUsernameError();
                }

                if (!subscription.buyer.telegram_chat_id) {
                    await this.updateNotificationStatus(notification.id, 'FAILED', 'Telegram chat ID not set.');
                    throw new TelegramChatNotLinkedError();
                }

                const listing = data.listing_id ? await prisma.listing.findUnique({ where: { id: data.listing_id } }) : null;

                if (listing?.photos?.[0]) {
                    await this.telegramBotService.sendMessage(
                        subscription.buyer.telegram_chat_id,
                        { photo: listing.photos[0] },
                        {
                            caption: finalMessage,
                            parse_mode: 'HTML',
                        }
                    );
                } else {
                    await this.telegramBotService.sendMessage(
                        subscription.buyer.telegram_chat_id,
                        finalMessage,
                        { parse_mode: 'HTML' }
                    );
                }

                await this.updateNotificationStatus(notification.id, 'DELIVERED');
            }
        } catch (err) {
            console.error('Error sending notification:', err);
            await this.updateNotificationStatus(notification.id, 'FAILED', 'Failed to send notification');
            throw err;
        }

        return notification;
    }


    async getAllNotifications(): Promise<Notification[]> {
        return await prisma.notification.findMany({
            include: { user: true, subscription: true },
        });
    }

    async getNotificationById(id: string): Promise<Notification | null> {
        return await prisma.notification.findUnique({
            where: { id },
            include: { user: true, subscription: true },
        });
    }

    async updateNotification(id: string, data: Partial<{
        message: string;
        status: NotificationStatus;
        sent_at: Date | null;
    }>): Promise<Notification> {
        return await prisma.notification.update({
            where: { id },
            data,
        });
    }

    async deleteNotification(id: string): Promise<Notification> {
        return await prisma.notification.delete({
            where: { id },
        });
    }

    async getNotificationsBySubscription(subscription_id: string): Promise<Notification[]> {
        return await prisma.notification.findMany({
            where: { subscription_id },
            include: { user: true },
        });
    }

    async getNotificationsByUser(user_id: string): Promise<Notification[]> {
        return await prisma.notification.findMany({
            where: { user_id },
            include: { subscription: true },
        });
    }

    async updateNotificationStatus(id: string, status: NotificationStatus, errorMessage?: string): Promise<Notification> {
        return await prisma.notification.update({
            where: { id },
            data: {
                status,
                sent_at: status === 'DELIVERED' ? new Date() : undefined,
            },
        });
    }

    async markAsSent(id: string): Promise<Notification> {
        return await prisma.notification.update({
            where: { id },
            data: {
                status: 'SENT',
                sent_at: new Date(),
            },
        });
    }

    async clearUserNotifications(user_id: string): Promise<void> {
        await prisma.notification.deleteMany({
            where: { user_id },
        });
    }
}