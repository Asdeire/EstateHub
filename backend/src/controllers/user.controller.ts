import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { userIdParamSchema, updateUserBodySchema } from '../schemas/user.schemas';
import bcrypt from 'bcrypt';

const userService = new UserService();

export class UserController {

    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = userIdParamSchema.parse(request.params);

            const user = await userService.getUserById(id);
            return reply.send(user);
        } catch (error: any) {
            console.error(error);
            return reply.status(400).send({ message: error.message || 'Invalid input' });
        }
    }

    async updateUser(request: FastifyRequest<{
        Params: { id: string },
        Body: {
            name?: string;
            email?: string;
            password?: string;
            telegram_username?: string;
        }
    }>, reply: FastifyReply) {
        try {
            const { id } = userIdParamSchema.parse(request.params);
            const parsedBody = updateUserBodySchema.parse(request.body);

            const dataToUpdate: {
                name?: string;
                email?: string;
                password_hash?: string;
                telegram_username?: string;
            } = {};

            if (parsedBody.name) dataToUpdate.name = parsedBody.name;
            if (parsedBody.email) dataToUpdate.email = parsedBody.email;
            if (parsedBody.telegram_username) dataToUpdate.telegram_username = parsedBody.telegram_username;
            if (parsedBody.password) dataToUpdate.password_hash = await bcrypt.hash(parsedBody.password, 10);

            const updatedUser = await userService.updateUser(id, dataToUpdate);
            return reply.send(updatedUser);
        } catch (error: any) {
            console.error(error);
            return reply.status(400).send({ message: error.message });
        }
    }


    async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = userIdParamSchema.parse(request.params);
            const userIdFromToken = (request as any).user?.id;

            if (!userIdFromToken) {
                return reply.status(401).send({ message: 'Unauthorized: No token provided' });
            }

            if (id !== userIdFromToken) {
                return reply.status(403).send({ message: 'Forbidden: You can only delete your own account' });
            }

            const deletedUser = await userService.deleteUser(id);
            return reply.status(200).send({ message: 'User successfully deleted' });
        } catch (error: any) {
            console.error(error);
            return reply.status(400).send({ message: error.message || 'Invalid input' });
        }
    }

}
