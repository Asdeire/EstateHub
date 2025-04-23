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
        message: string;
        status: NotificationStatus;
        listing_id?: string;
    }): Promise<Notification> {
        const notification = await prisma.notification.create({
            data: {
                user_id: data.user_id,
                subscription_id: data.subscription_id,
                message: data.message,
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

        if (subscription.transport === Transport.EMAIL) {
            if (!subscription.buyer.email) {
                await this.updateNotificationStatus(notification.id, 'FAILED', 'User must have an email address');
                throw new Error('User must have an email address for EMAIL transport');
            }

            await emailService.sendNotificationEmail(
                'c.kutsak.oleksandr@student.uzhnu.edu.ua',
                'Нове оголошення за вашою підпискою',
                `<p>${data.message}</p>`,
            );
        }

        if (subscription.transport === Transport.TELEGRAM) {
            if (!subscription.buyer.telegram_username) {
                await this.updateNotificationStatus(notification.id, 'FAILED', 'User must have a Telegram username');
                throw new MissingTelegramUsernameError();
            }

            if (!subscription.buyer.telegram_chat_id) {
                await this.updateNotificationStatus(
                    notification.id,
                    'FAILED',
                    'Telegram chat ID not set. User must link their account.',
                );
                throw new TelegramChatNotLinkedError();
            }

            try {
                let listing;
                if (data.listing_id) {
                    listing = await prisma.listing.findUnique({
                        where: { id: data.listing_id },
                    });
                }

                let formattedMessage: string;

                if (listing) {
                    const title = listing.title;
                    const cleanListingId = listing.id.replace(/[^a-zA-Z0-9-]/g, '');
                    if (!cleanListingId) {
                        await this.updateNotificationStatus(notification.id, 'FAILED', 'Invalid listing ID after cleaning');
                        throw new Error('Invalid listing ID after cleaning');
                    }
                    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
                    const link = `${baseUrl}/listings/${cleanListingId}`;

                    formattedMessage = `<b>Нове оголошення за вашою підпискою!</b> 🏠\n\n` +
                        `<b>Назва:</b> ${title}\n` +
                        `<b>Ціна:</b> ${listing.price} грн\n` +
                        `<b>Площа:</b> ${listing.area} м²\n` +
                        `<a href="${link}">Переглянути оголошення</a>`;
                } else {
                    formattedMessage = data.message;
                }

                console.log('Formatted Telegram message:', formattedMessage);

                if (listing?.photos?.[0]) {
                    await this.telegramBotService.sendMessage(
                        subscription.buyer.telegram_chat_id,
                        { photo: listing.photos[0] },
                        {
                            caption: formattedMessage,
                            parse_mode: 'HTML',
                        }
                    );
                } else {
                    await this.telegramBotService.sendMessage(
                        subscription.buyer.telegram_chat_id,
                        formattedMessage,
                        { parse_mode: 'HTML' }
                    );
                }

                console.log('Telegram notification sent successfully to:', subscription.buyer.telegram_chat_id);

                if (data.status === 'DELIVERED') {
                    await this.markAsSent(notification.id);
                }
            } catch (err) {
                console.error('Error sending Telegram notification:', err);
                if (
                    (err as any)?.response?.body?.error_code === 400 &&
                    (err as any).response?.body?.description.includes('chat not found')
                ) {
                    await this.updateNotificationStatus(
                        notification.id,
                        'FAILED',
                        'Chat not found. User must start a chat with the bot.',
                    );
                    throw new TelegramChatNotFoundError();
                } else if ((err as any)?.response?.body?.error_code === 400) {
                    await this.updateNotificationStatus(
                        notification.id,
                        'FAILED',
                        `Telegram API error: ${(err as any).response?.body?.description}`,
                    );
                    throw new Error(`Telegram API error: ${(err as any).response?.body?.description}`);
                } else {
                    await this.updateNotificationStatus(notification.id, 'FAILED', 'Failed to send Telegram message');
                    throw err;
                }
            }
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
            data: { status },
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
}