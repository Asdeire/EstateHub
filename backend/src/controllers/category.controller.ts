import { FastifyRequest, FastifyReply } from 'fastify';
import { categoryService } from '../services/category.service';

type CreateCategoryDto = {
    name: string;
    description?: string;
}

class CategoryController {
    async create(req: FastifyRequest<{ Body: CreateCategoryDto }>, res: FastifyReply): Promise<void> {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).send(category);
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
            const categories = await categoryService.getAllCategories();
            res.status(200).send(categories);
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
            const category = await categoryService.getCategoryById(id);
            if (!category) {
                res.status(404).send({ message: 'Category not found' });
                return;
            }
            res.status(200).send(category);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }

    async update(req: FastifyRequest<{ Params: { id: string }, Body: CreateCategoryDto }>, res: FastifyReply): Promise<void> {
        const { id } = req.params;

        try {
            const updatedCategory = await categoryService.updateCategory(id, req.body);
            if (!updatedCategory) {
                res.status(404).send({ message: 'Category not found for update' });
                return;
            }
            res.status(200).send(updatedCategory);
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
            const deletedCategory = await categoryService.deleteCategory(id);
            if (!deletedCategory) {
                res.status(404).send({ message: 'Category not found for deletion' });
                return;
            }
            res.status(200).send(deletedCategory);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ message: error.message });
            } else {
                res.status(500).send({ message: 'An unknown error occurred' });
            }
        }
    }
}

export const categoryController = new CategoryController();
