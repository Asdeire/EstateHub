// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
    private jwtSecret = process.env.JWT_SECRET || 'default_secret';
    private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

    async login(email: string, password: string): Promise<string | null> {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const payload = { id: user.id, email: user.email };
        const secret = process.env.JWT_SECRET || 'your_secret_key';

        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        return token;
    }

    async register(name: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role: 'User',
            },
        });

        return user;
    }

    async findUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    }
}
