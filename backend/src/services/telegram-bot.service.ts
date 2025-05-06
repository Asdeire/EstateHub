import TelegramBot from 'node-telegram-bot-api';
import { SubscriptionService } from './subscription.service';
import { MissingTelegramUsernameError } from './errors';
import { config } from '../utils/config';

export class TelegramBotService {
    private bot: TelegramBot;
    private subscriptionService: SubscriptionService;

    constructor() {
        this.bot = new TelegramBot(config.telegramBotService.telegramToken, { polling: true });
        this.subscriptionService = new SubscriptionService();
        this.setupBot();
    }

    private setupBot() {
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id.toString();
            await this.bot.sendMessage(
                chatId,
                'Welcome to EstateHub! Send /link to connect your Telegram account using your Telegram username.',
            );
        });

        this.bot.onText(/\/link/, async (msg) => {
            const chatId = msg.chat.id.toString();
            const telegramUsername = msg.from?.username;

            if (!telegramUsername) {
                await this.bot.sendMessage(
                    chatId,
                    'Error: You must have a Telegram username set in your Telegram profile to link your account.',
                );
                return;
            }

            try {
                await this.subscriptionService.linkTelegramChatId(telegramUsername, chatId);
                await this.bot.sendMessage(chatId, `Successfully linked Telegram account for ${telegramUsername}.`);
            } catch (err) {
                console.error('Error linking Telegram account:', err);
                await this.bot.sendMessage(
                    chatId,
                    `Error: Could not link account. Please ensure your Telegram username (${telegramUsername}) is registered in EstateHub.`,
                );
            }
        });
    }

    async sendMessage(
        chatId: string,
        message: string | { photo: string },
        options: { caption?: string; parse_mode?: string } = {}
    ): Promise<void> {
        await this.bot.getChat(chatId);
        if (typeof message === 'string') {
            await this.bot.sendMessage(chatId, message, {
                ...options,
                parse_mode: options.parse_mode as TelegramBot.ParseMode,
            });
        } else {
            await this.bot.sendPhoto(chatId, message.photo, {
                ...options,
                parse_mode: options.parse_mode as TelegramBot.ParseMode,
            });
        }
    }

}