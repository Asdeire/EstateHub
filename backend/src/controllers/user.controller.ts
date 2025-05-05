import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import bcrypt from 'bcrypt';

const userService = new UserService();

export class UserController {
    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const userId = request.params.id;

            if (!userId) {
                return reply.status(400).send({ message: 'User ID is required' });
            }

            const user = await userService.getUserById(userId);
            if (!user) {
                return reply.status(404).send({ message: 'User not found' });
            }

            return reply.send(user);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error retrieving user data' });
        }
    }

    async updateUser(
        request: FastifyRequest<{
            Params: { id: string },
            Body: {
                name?: string;
                email?: string;
                password?: string;
                telegram_username?: string;
            }
        }>,
        reply: FastifyReply
    ) {
        try {
            const userId = request.params.id;
            const { name, email, password, telegram_username } = request.body;

            if (!userId) {
                return reply.status(400).send({ message: 'User ID is required' });
            }

            if (!name && !email && !password && !telegram_username) {
                return reply.status(400).send({
                    message: 'At least one field (name, email, password, telegram_username) must be provided to update',
                });
            }

            const dataToUpdate: {
                name?: string;
                email?: string;
                password_hash?: string;
                telegram_username?: string;
            } = {};

            if (name) dataToUpdate.name = name;
            if (email) dataToUpdate.email = email;
            if (telegram_username) dataToUpdate.telegram_username = telegram_username;
            if (password) dataToUpdate.password_hash = await bcrypt.hash(password, 10);

            const updatedUser = await userService.updateUser(userId, dataToUpdate);

            if (!updatedUser) {
                return reply.status(404).send({ message: 'User not found or no changes made' });
            }

            return reply.send(updatedUser);
        } catch (error: any) {
            console.error(error);
            return reply.status(500).send({ message: error.message || 'Error updating user data' });
        }
    }

    async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const userIdFromParams = request.params.id;
            const userIdFromToken = (request as any).user?.id;

            if (!userIdFromToken) {
                return reply.status(401).send({ message: 'Unauthorized: No token provided' });
            }

            if (userIdFromParams !== userIdFromToken) {
                return reply.status(403).send({ message: 'Forbidden: You can only delete your own account' });
            }

            const deletedUser = await userService.deleteUser(userIdFromParams);

            if (!deletedUser) {
                return reply.status(404).send({ message: 'User not found' });
            }

            return reply.status(200).send({ message: 'User successfully deleted' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error deleting user' });
        }
    }
}
