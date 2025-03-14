import { FastifyInstance } from 'fastify';
import { uploadFiles } from '../controllers/upload.controller';

export async function uploadRoutes(fastify: FastifyInstance) {
    fastify.post('/upload', async (req, reply) => {
        const parts = req.parts();

        const files = [];
        for await (const part of parts) {
            files.push(part);
        }

        console.log(files);

        const result = await uploadFiles(files);

        if (result.success) {
            return reply.send(result);
        } else {
            return reply.status(500).send(result);
        }
    });
}
