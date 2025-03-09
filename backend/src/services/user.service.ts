import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            return user;
        } catch (error) {   
            console.error(error);
            throw new Error('Error fetching user data');
        }
    }

    async updateUser(userId: string, data: { name?: string; email?: string; password?: string }) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data,
            });
            return updatedUser;
        } catch (error) {
            console.error(error);
            throw new Error('Error updating user data');
        }
    }

    async deleteUser(userId: string) {
        try {
            const deletedUser = await prisma.user.delete({
                where: { id: userId },
            });
            return deletedUser;
        } catch (error) {
            console.error(error);
            throw new Error('Error deleting user');
        }
    }
}
