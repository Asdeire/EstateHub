import { FastifyRequest, FastifyReply } from 'fastify';
import { tagService } from '../services/tag.service';

interface CreateTagDto {
    name: string;
}

class TagController {
    async create(req: FastifyRequest<{ Body: CreateTagDto }>, res: FastifyReply): Promise<void> {
        try {
            const tag = await tagService.createTag(req.body);
            res.status(201).send(tag);
        } catch (error: unknown) {
            if (error instanceof Error) {
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

    async update(req: FastifyRequest<{ Params: { id: string }, Body: CreateTagDto }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const updatedTag = await tagService.updateTag(id, req.body);
            if (!updatedTag) {
                res.status(404).send({ message: 'Tag not found for update' });
                return;
            }
            res.status(200).send(updatedTag);
        } catch (error: unknown) {
            if (error instanceof Error) {
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
