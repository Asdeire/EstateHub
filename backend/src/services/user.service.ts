import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching user data');
        }
    }

    async getAllUsers() {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    telegram_username: true,
                    created_at: true,
                    updated_at: true,
                },
            });
            return users;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching users');
        }
    }

    async updateUser(userId: string, data: {
        name?: string;
        email?: string;
        password_hash?: string;
        telegram_username?: string;
    }) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data,
            });
            if (!updatedUser) {
                throw new Error('User not found or no changes made');
            }
            return updatedUser;
        } catch (error) {
            console.error(error);
            throw new Error('Error updating user data');
        }
    }

    async deleteUser(userId: string) {
        try {
            await prisma.listing.deleteMany({
                where: {
                    user_id: userId,
                },
            });

            await prisma.notification.deleteMany({
                where: {
                    subscription: {
                        buyer_id: userId,
                    },
                },
            });

            await prisma.subscription.deleteMany({
                where: {
                    buyer_id: userId,
                },
            });

            const deletedUser = await prisma.user.delete({
                where: { id: userId },
            });

            if (!deletedUser) {
                throw new Error('User not found');
            }

            return deletedUser;
        } catch (error) {
            console.error(error);
            throw new Error('Error deleting user');
        }
    }
}
