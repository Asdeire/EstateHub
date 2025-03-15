import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || 'default_api_key');

export class AuthService {
    private jwtSecret = process.env.JWT_SECRET || 'default_secret';
    private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    private verificationCodes: { [email: string]: string } = {};

    async login(email: string, password: string): Promise<string | null> {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, this.jwtSecret, { expiresIn: '24h' });

        return token;
    }

    async register(name: string, email: string, password: string, role: 'User' | 'Makler') {
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.user.create({
            data: { name, email, password_hash: hashedPassword, role },
        });
    }

    async findUserByEmail(email: string) {
        return await prisma.user.findUnique({ where: { email } });
    }

    async sendVerificationCode(email: string): Promise<void> {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.verificationCodes[email] = verificationCode;

        try {
            const response = await resend.emails.send({
                from: 'EstateHub <onboarding@resend.dev>',
                to: 'c.kutsak.oleksandr@student.uzhnu.edu.ua',
                subject: 'Verification Code for Registration',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
            });

            console.log('Email sent successfully:', response);
        } catch (err) {
            console.error('Error sending verification email:', err);
            throw new Error('Failed to send verification email');
        }
    }

    async verifyCodeAndRegisterUser(email: string, code: string, name: string, password: string, role: 'User' | 'Makler') {
        const storedCode = this.verificationCodes[email];

        if (storedCode && storedCode === code) {
            return await this.register(name, email, password, role);
        } else {
            throw new Error('Invalid or expired verification code');
        }
    }
}