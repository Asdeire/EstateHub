import { PrismaClient, Subscription, Transport, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
    private async validateTransport(buyer_id: string, transport: Transport): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: buyer_id },
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (transport === Transport.EMAIL && !user.email) {
            throw new Error('User must have an email address for EMAIL transport');
        }

        if (transport === Transport.TELEGRAM && !user.telegram_username) {
            throw new Error('User must have a Telegram username for TELEGRAM transport');
        }
    }

    async createSubscription(data: {
        buyer_id: string;
        filters: Prisma.JsonValue;
        transport: Transport;
    }): Promise<Subscription> {
        await this.validateTransport(data.buyer_id, data.transport);

        const subscriptionCount = await prisma.subscription.count({
            where: { buyer_id: data.buyer_id },
        });

        if (subscriptionCount >= 4) {
            throw new Error('User already has the maximum number of subscriptions (4)');
        }

        const subscription = await prisma.subscription.create({
            data: {
                buyer_id: data.buyer_id,
                filters: data.filters as Prisma.InputJsonValue,
                transport: data.transport,
            },
        });
        return subscription;
    }


    async updateSubscription(id: string, data: Partial<{
        filters: Prisma.JsonValue;
        transport: Transport;
    }>): Promise<Subscription> {
        if (data.transport) {
            const subscription = await prisma.subscription.findUnique({
                where: { id },
                include: { buyer: true },
            });

            if (!subscription) {
                throw new Error('Subscription not found');
            }

            await this.validateTransport(subscription.buyer_id, data.transport);
        }

        return await prisma.subscription.update({
            where: { id },
            data: {
                ...data,
                filters: data.filters as Prisma.InputJsonValue,
            },
        });
    }

    async linkTelegramChatId(telegram_username: string, telegram_chat_id: string): Promise<void> {
        try {
            const user = await prisma.user.update({
                where: { telegram_username: telegram_username.toLowerCase() },
                data: { telegram_chat_id },
            });
            if (!user) {
                throw new Error('User not found with this Telegram username');
            }
        } catch (err) {
            throw new Error(`Failed to link Telegram chat ID: ${err as any}`);
        }
    }

    async getAllSubscriptions(): Promise<Subscription[]> {
        return await prisma.subscription.findMany({
            include: { buyer: true, notifications: true },
        });
    }

    async getSubscriptionById(id: string): Promise<Subscription | null> {
        return await prisma.subscription.findUnique({
            where: { id },
            include: { buyer: true, notifications: true },
        });
    }

    async deleteSubscription(id: string): Promise<Subscription> {
        await prisma.notification.deleteMany({
            where: { subscription_id: id },
        });
    
        return await prisma.subscription.delete({
            where: { id },
        });
    }
    

    async getSubscriptionsByUser(buyer_id: string): Promise<Subscription[]> {
        return await prisma.subscription.findMany({
            where: { buyer_id },
            include: { notifications: true },
        });
    }
}