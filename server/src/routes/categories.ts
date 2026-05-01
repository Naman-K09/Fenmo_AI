import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { queryMany } from '../db.js';
import { validate } from '../middleware.js';
import { AppError, ErrorCodes } from '../errors.js';

// Types (temporarily inline until types package is built)
interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface CreateCategoryBody {
  name: string;
}

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be 50 characters or less')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Category name cannot be empty after trimming'),
});

// Helper function to normalize category name
function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

// GET /categories - Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await queryMany<Category>(
      'SELECT id, name, created_at as "createdAt" FROM categories ORDER BY name ASC'
    );

    res.json({ data: categories });
  } catch (error) {
    throw new AppError('Failed to fetch categories', ErrorCodes.INTERNAL_ERROR);
  }
});

// POST /categories - Create a new category
router.post('/', validate(createCategorySchema), async (req: Request, res: Response) => {
  try {
    const { name } = req.body as CreateCategoryBody;
    const normalizedName = normalizeCategoryName(name);

    // Try to insert the category
    const result = await queryMany<Category>(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id, name, created_at as "createdAt"',
      [normalizedName]
    );

    if (result.length === 0) {
      throw new AppError('Failed to create category', ErrorCodes.INTERNAL_ERROR);
    }

    res.status(201).json({ data: result[0] });
  } catch (error) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      throw new AppError(
        'Category already exists',
        ErrorCodes.DUPLICATE_CATEGORY,
        409
      );
    }

    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to create category', ErrorCodes.INTERNAL_ERROR);
  }
});

// DELETE /categories/:id - Delete a category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists and has expenses
    const expensesCount = await queryMany<{ count: number }>(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = $1',
      [id]
    );

    if (expensesCount[0]?.count > 0) {
      throw new AppError(
        'Cannot delete a category that has expenses attached',
        ErrorCodes.CATEGORY_IN_USE,
        409
      );
    }

    // Delete the category
    const deleteResult = await queryMany(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (deleteResult.length === 0) {
      throw new AppError(
        'Category not found',
        ErrorCodes.CATEGORY_NOT_FOUND,
        404
      );
    }

    res.status(204).send();
  } catch (error) {
    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to delete category', ErrorCodes.INTERNAL_ERROR);
  }
});

export default router;