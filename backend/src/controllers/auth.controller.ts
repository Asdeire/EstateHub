import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();
const authService = new AuthService(emailService);

type LoginRequestBody = {
    email: string;
    password: string;
}

type RegisterRequestBody = {
    name: string;
    code: string;
    email: string;
    password: string;
    role: 'User' | 'Makler';
}

export class AuthController {

    private handleError(reply: FastifyReply, error: unknown) {
        if (error instanceof Error) {
            return reply.status(500).send({ message: error.message });
        }
        console.error('Unexpected error:', error);
        return reply.status(500).send({ message: 'An unknown error occurred' });
    }

    async login(request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                return reply.status(400).send({ message: 'Email and password are required' });
            }

            const token = await authService.login(email, password);

            return reply.status(200).send({ token });
        } catch (error) {
            return this.handleError(reply, error);
        }
    }

    async register(request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) {
        try {
            const { name, email, password, role } = request.body;

            if (!name || !email || !password || !role) {
                return reply.status(400).send({ message: 'Name, email, password, and role are required' });
            }

            const existingUser = await authService.findUserByEmail(email);
            if (existingUser) {
                return reply.status(400).send({ message: 'Email is already in use' });
            }

            await authService.sendVerificationCode(email, 'registration');

            return reply.status(201).send({ message: `Verification code sent to ${email}` });
        } catch (error) {
            return this.handleError(reply, error);
        }
    }

    async verify(request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) {
        try {
            const { email, code, name, password, role } = request.body;

            if (!email || !code || !name || !password || !role) {
                return reply.status(400).send({ message: 'Email, verification code, name, password, and role are required' });
            }

            const user = await authService.verifyCodeAndRegisterUser(email, code, name, password, role);

            return reply.status(201).send({ message: 'User registered successfully', user });
        } catch (error) {
            return this.handleError(reply, error);
        }
    }

    async sendPasswordResetCode(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
        try {
            const { email } = request.body;

            if (!email) {
                return reply.status(400).send({ message: 'Email is required' });
            }

            await authService.sendPasswordResetCode(email);

            return reply.status(200).send({ message: `Password reset code sent to ${email}` });
        } catch (error) {
            return this.handleError(reply, error);
        }
    }

    async requestPasswordReset(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
        try {
            const { email } = request.body;

            if (!email) {
                return reply.status(400).send({ message: 'Email is required' });
            }

            await authService.sendPasswordResetCode(email);

            return reply.status(200).send({ message: 'Password reset code sent to your email' });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ message: error.message });
            }
            console.error('Unexpected error:', error);
            return reply.status(500).send({ message: 'An unknown error occurred' });
        }
    }

    async resetPassword(request: FastifyRequest<{ Body: { email: string, code: string, newPassword: string } }>, reply: FastifyReply) {
        try {
            const { email, code, newPassword } = request.body;

            if (!email || !code || !newPassword) {
                return reply.status(400).send({ message: 'Email, verification code, and new password are required' });
            }

            await authService.resetPassword(email, code, newPassword);

            return reply.status(200).send({ message: 'Password reset successfully' });
        } catch (error) {
            return this.handleError(reply, error);
        }
    }
}
