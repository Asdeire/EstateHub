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
    async login(request: FastifyRequest<{ Body: LoginRequestBody }>, reply: FastifyReply) {
        try {
            const { email, password } = request.body;

            if (!email || !password) {
                return reply.status(400).send({ message: 'Email and password are required' });
            }

            const token = await authService.login(email, password);

            return reply.status(200).send({ token });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(401).send({ message: error.message });
            }
            console.error('Unexpected error:', error);
            return reply.status(500).send({ message: 'An unknown error occurred' });
        }
    }

    async register(request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) {
        try {
            const { name, email, password, role } = request.body;

            if (!name || !email || !password) {
                return reply.status(400).send({ message: 'Name, email, and password are required' });
            }

            const existingUser = await authService.findUserByEmail(email);
            if (existingUser) {
                return reply.status(400).send({ message: 'Email is already in use' });
            }

            await authService.sendVerificationCode(email);

            return reply.status(201).send({ message: 'Verification code sent successfully to ' + email });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ message: error.message });
            }
            console.error('Unexpected error:', error);
            return reply.status(500).send({ message: 'An unknown error occurred' });
        }
    }

    async verify(request: FastifyRequest<{ Body: RegisterRequestBody }>, reply: FastifyReply) {
        try {
            const { email, code, name, password, role } = request.body;

            const user = await authService.verifyCodeAndRegisterUser(email, code, name, password, role);

            return reply.status(201).send({ message: 'User registered successfully', user });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(400).send({ message: error.message });
            }
            console.error('Unexpected error:', error);
            return reply.status(500).send({ message: 'An unknown error occurred' });
        }
    }
}
