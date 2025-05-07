import { FastifyInstance } from 'fastify';
import { TelegramBotService } from '../services/telegram-bot.service';
import { config } from '../utils/config';
import { Update } from 'node-telegram-bot-api';

const telegramBotService = new TelegramBotService();

export async function webhookRoutes(fastify: FastifyInstance) {
    fastify.post(`/webhook/${config.telegramBotService.telegramToken}`, async (request, reply) => {
        try {
            const update = request.body as Update;

            await telegramBotService.bot.processUpdate(update);
            reply.status(200).send({ success: true });
        } catch (err) {
            console.error('Error processing Telegram webhook:', err);
            reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }
    });
}
