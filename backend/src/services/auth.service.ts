import { config } from '../utils/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { EmailService } from './email.service';
import { addMinutes } from 'date-fns';
import cron from 'node-cron';

const prisma = new PrismaClient();

export class AuthService {
    private jwtSecret = config.jwtSecret;
    private jwtExpiresIn = config.jwtExpiresIn;

    constructor(private emailService: EmailService) {
        this.startCronJob();
    }

    private async clearExpiredCodes() {
        await prisma.verificationCode.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }

    private startCronJob() {
        cron.schedule('*/10 * * * *', async () => {
            try {
                console.log('Running cleanup task for expired verification codes...');
                await this.clearExpiredCodes();
                console.log('Expired verification codes cleaned.');
            } catch (error) {
                console.error('Error while cleaning expired verification codes:', error);
            }
        });
    }

    async login(email: string, password: string): Promise<string | null> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid email or password');

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) throw new Error('Invalid email or password');

        return jwt.sign({ id: user.id, email: user.email }, this.jwtSecret, { expiresIn: "24h" });
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
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = addMinutes(new Date(), 5);

        await prisma.verificationCode.create({
            data: { email, code, expiresAt },
        });

        const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
        const subject = 'Verification Code for Registration';
        await this.emailService.sendNotificationEmail(config.emailService.senderEmail, subject, html);
    }

    async verifyCodeAndRegisterUser(email: string, code: string, name: string, password: string, role: 'User' | 'Makler') {
        const record = await prisma.verificationCode.findFirst({
            where: {
                email,
                code,
                expiresAt: { gt: new Date() },
            },
        });

        if (!record) {
            throw new Error('Invalid or expired verification code');
        }

        await prisma.verificationCode.delete({ where: { id: record.id } });

        return await this.register(name, email, password, role);
    }
}
