import dotenv from "dotenv";

dotenv.config();

export const config = {
  isProduction: process.env.NODE_ENV !== "development",
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  appUrl: process.env.APP_URL || "http://localhost:5173",
  cookieSecret:
    process.env.COOKIE_SECRET || "a-string-secret-at-least-256-bits-long",
  cookieDomain: process.env.COOKIE_DOMAIN || "localhost",
  jwtSecret: process.env.JWT_SECRET || "a-string-secret-at-least-256-bits-long",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshSecret:
    process.env.REFRESH_SECRET || "a-string-secret-at-least-256-bits-long",
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  emailService: {
    senderEmail: process.env.SENDER_EMAIL || "default@example.com",
    mailjetApiKey: process.env.MAILJET_API_KEY || "default_api_key",
    mailjetSecretKey: process.env.MAILJET_SECRET_KEY || "default_secret_key",
  },
  telegramBotService: {
    apiKey: process.env.TELEGRAM_API_KEY || "default_telegram_api_key",
    telegramToken:
      process.env.TELEGRAM_BOT_TOKEN || "default_telegram_bot_token",
  },
};
