import { FastifyRequest, FastifyReply } from 'fastify';
import { tagService } from '../services/tag.service';
import { z } from 'zod';

export const createTagSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

class TagController {
    async create(req: FastifyRequest, res: FastifyReply): Promise<void> {
        try {
            const parsed = createTagSchema.parse(req.body);
            const tag = await tagService.createTag(parsed);
            res.status(201).send(tag);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getAll(req: FastifyRequest, res: FastifyReply): Promise<void> {
        try {
            const tags = await tagService.getAllTags();
            res.status(200).send(tags);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async getById(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const tag = await tagService.getTagById(id);
            if (!tag) {
                res.status(404).send({ message: 'Tag not found' });
                return;
            }
            res.status(200).send(tag);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async update(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const parsed = createTagSchema.partial().parse(req.body);
            const updatedTag = await tagService.updateTag(id, parsed);
            if (!updatedTag) {
                res.status(404).send({ message: 'Tag not found for update' });
                return;
            }
            res.status(200).send(updatedTag);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                res.status(400).send({ message: error.errors });
            } else if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const deletedTag = await tagService.deleteTag(id);
            if (!deletedTag) {
                res.status(404).send({ message: 'Tag not found for deletion' });
                return;
            }
            res.status(200).send(deletedTag);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }
}

export const tagController = new TagController();
