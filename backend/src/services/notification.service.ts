import { PrismaClient, Notification, NotificationStatus, Prisma, Subscription } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || 'default_api_key');

export class NotificationService {
    async createNotification(data: {
        user_id: string;
        subscription_id: string;
        message: string;
        status: NotificationStatus;
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

        if (subscription?.transport === 'EMAIL' && subscription.buyer.email) {
            try {
                const response = await resend.emails.send({
                    from: 'EstateHub <onboarding@resend.dev>',
                    to: 'c.kutsak.oleksandr@student.uzhnu.edu.ua',
                    subject: 'New Notification from EstateHub',
                    html: `<p>${data.message}</p>`,
                });
                console.log('Notification email sent successfully:', response);

                if (data.status === 'DELIVERED') {
                    await this.markAsSent(notification.id);
                }
            } catch (err) {
                console.error('Error sending notification email:', err);
                await this.updateNotificationStatus(notification.id, 'FAILED');
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

    async updateNotificationStatus(id: string, status: NotificationStatus): Promise<Notification> {
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