import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';

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

    async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: { name?: string; email?: string; password?: string } }>, reply: FastifyReply) {
        try {
            const userId = request.params.id;
            const { name, email, password } = request.body;

            if (!userId) {
                return reply.status(400).send({ message: 'User ID is required' });
            }

            if (!name && !email && !password) {
                return reply.status(400).send({ message: 'At least one field (name, email, password) must be provided to update' });
            }

            const updatedUser = await userService.updateUser(userId, { name, email, password });

            if (!updatedUser) {
                return reply.status(404).send({ message: 'User not found or no changes made' });
            }

            return reply.send(updatedUser);
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error updating user data' });
        }
    }

    async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const userId = request.params.id;

            if (!userId) {
                return reply.status(400).send({ message: 'User ID is required' });
            }

            const deletedUser = await userService.deleteUser(userId);

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
