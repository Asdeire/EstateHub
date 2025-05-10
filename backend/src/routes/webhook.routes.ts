import { FastifyInstance } from 'fastify';
import { TelegramBotService } from '../services/telegram-bot.service';

export async function webhookRoutes(fastify: FastifyInstance) {
    const telegramBotService = new TelegramBotService();

    fastify.post('/webhook', async (request, reply) => {
        try {
            console.log('Received Telegram update:', request.body);
            await telegramBotService.bot.processUpdate(request.body as any);
            return { ok: true };
        } catch (err) {
            console.error('Error processing webhook update:', err);
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });
}