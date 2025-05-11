import TelegramBot from 'node-telegram-bot-api';
import { SubscriptionService } from './subscription.service';
import { config } from '../utils/config';

export class TelegramBotService {
    bot: TelegramBot;
    private subscriptionService: SubscriptionService;

    constructor() {
        this.bot = new TelegramBot(config.telegramBotService.telegramToken);
        this.subscriptionService = new SubscriptionService();
        this.setupWebhook();
    }

    private setupWebhook() {
        const url = `${config.baseUrl}/webhook`;
        console.log('Setting webhook to:', url);
        this.bot.setWebHook(url).catch((error) => {
            console.error('Error setting webhook');
        });

        this.bot.on('message', async (msg) => {
            console.log('Received Telegram message:', msg);
            const chatId = msg.chat.id.toString();

            if (msg.text === '/start') {
                await this.bot.sendMessage(
                    chatId,
                    'Welcome to EstateHub! Send /link to connect your Telegram account using your Telegram username.',
                );
            } else if (msg.text === '/link') {
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
            }
        });

        this.bot.on('webhook_error', (error) => {
            console.error('Webhook error:', error);
        });
    }

    async sendMessage(
        chatId: string,
        message: string | { photo: string },
        options: { caption?: string; parse_mode?: string } = {}
    ): Promise<void> {
        try {
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
        } catch (err) {
            if ((err as any).code === 'ETELEGRAM' && (err as any).response?.error_code === 429) {
                const retryAfter = (err as any).response.parameters.retry_after * 1000;
                console.log(`Rate limit reached. Retrying after ${retryAfter / 1000} seconds.`);
                await new Promise(resolve => setTimeout(resolve, retryAfter));
                await this.sendMessage(chatId, message, options);
            } else {
                console.error('Telegram error:', err);
                throw err;
            }
        }
    }
}