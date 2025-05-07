import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    emailService: {
        senderEmail: process.env.EMAIL || 'default@example.com',
        resendApiKey: process.env.RESEND_API_KEY || 'default_api_key',
    },
    telegramBotService: {
        apiKey: process.env.TELEGRAM_API_KEY || 'default_telegram_api_key',
        telegramToken: process.env.TELEGRAM_BOT_TOKEN || 'default_telegram_bot_token',
    },
};
