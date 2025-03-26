import { PrismaClient, Subscription, Transport, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionService {
    async createSubscription(data: {
        buyer_id: string;
        filters: Prisma.JsonValue;
        transport: Transport;
    }): Promise<Subscription> {
        const subscription = await prisma.subscription.create({
            data: {
                buyer_id: data.buyer_id,
                filters: data.filters as Prisma.InputJsonValue,
                transport: data.transport,
            },
        });
        return subscription;
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

    async updateSubscription(id: string, data: Partial<{
        filters: Prisma.JsonValue;
        transport: Transport;
    }>): Promise<Subscription> {
        return await prisma.subscription.update({
            where: { id },
            data: {
                ...data,
                filters: data.filters as Prisma.InputJsonValue,
            },
        });
    }

    async deleteSubscription(id: string): Promise<Subscription> {
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