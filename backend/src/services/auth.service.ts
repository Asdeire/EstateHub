import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';

const mailjet = require('node-mailjet').apiConnect(
    process.env.MAILJET_API_KEY || 'default_api_key',
    process.env.MAILJET_API_SECRET || 'default_api_secret'
);  

const prisma = new PrismaClient();

export class AuthService {
    private jwtSecret = process.env.JWT_SECRET || 'default_secret';
    private jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    private verificationCodes: { [email: string]: string } = {}; 

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

        const token = jwt.sign(payload, secret, { expiresIn: '24h' });

        return token;
    }

    async register(name: string, email: string, password: string, role: 'User' | 'Makler') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role,
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

    // Метод для надсилання коду підтвердження на електронну пошту
    async sendVerificationCode(email: string): Promise<void> {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();  // Генеруємо 6-значний код
        this.verificationCodes[email] = verificationCode;

        try {
            const request = mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'oleksansr20032006@gmail.com',
                            Name: 'EstateHub',
                        },
                        To: [{
                            Email: email,
                        }],
                        Subject: 'Verification Code for Registration',
                        TextPart: `Your verification code is: ${verificationCode}`,
                    },
                ],
            });

            const result = await request;
            console.log('Email sent successfully:', result.body);
            console.log('Full Mailjet response:', JSON.stringify(result.body, null, 2));
        } catch (err) {
            console.error('Error sending verification email:', err);
            throw new Error('Failed to send verification email');
        }
    }

    // Метод для перевірки коду підтвердження
    async verifyCodeAndRegisterUser(email: string, code: string, name: string, password: string, role: 'User' | 'Makler') {
        const storedCode = this.verificationCodes[email];

        // Перевірка коду
        if (storedCode && storedCode === code) {
            // Якщо код правильний, реєструємо користувача
            return await this.register(name, email, password, role);
        } else {
            throw new Error('Invalid or expired verification code');
        }
    }
}


