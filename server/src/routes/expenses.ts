import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { queryMany, queryOne } from '../db.js';
import { validate } from '../middleware.js';
import { AppError, ErrorCodes } from '../errors.js';
import { normalizeBody } from '../utils/normalize.js';

// Types
interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface Expense {
  id: string;
  amount: string;
  categoryId: string;
  description: string;
  date: string;
  createdAt: string;
  idempotencyKey?: string;
}

interface ExpenseResponse {
  id: string;
  amount: string;
  category: {
    id: string;
    name: string;
  };
  description: string;
  date: string;
  createdAt: string;
}

interface ExpenseWithTotal {
  id: string;
  amount: string;
  category_id: string;
  category_name: string;
  description: string;
  date: string;
  created_at: string;
  total_sum: string;
}

interface CreateExpenseBody {
  categoryId: string;
  amount: string;
  description: string;
  date: string;
}

// Query parameter validation schema
const getExpensesQuerySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  sort: z.enum(['date_desc']).optional().default('date_desc'),
}).strict();

const router = Router();

// Validation schemas
const createExpenseSchema = z.object({
  categoryId: z.string()
    .uuid('Category ID must be a valid UUID'),
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a positive number with at most 2 decimal places'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in ISO format (YYYY-MM-DD)'),
});

// Middleware to check for Idempotency-Key header
function requireIdempotencyKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = req.headers['idempotency-key'];
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new AppError(
      'Idempotency-Key header is required',
      ErrorCodes.VALIDATION_FAILED,
      400
    );
  }
  next();
}

const expensesGetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});

// GET /expenses - Get all expenses with filtering and sorting
router.get('/', expensesGetLimiter, async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    let params: z.infer<typeof getExpensesQuerySchema>;
    try {
      params = getExpensesQuerySchema.parse(req.query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fields: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          const path = err.path.join('.');
          fields[path] = err.message;
        });
        throw new AppError(
          'Invalid query parameters',
          ErrorCodes.VALIDATION_FAILED,
          400,
          fields
        );
      }
      throw error;
    }

    // Build dynamic SQL query with parameterized placeholders
    let sqlQuery = `
      SELECT
        e.id,
        e.amount,
        e.category_id,
        c.name as category_name,
        e.description,
        e.date,
        e.created_at,
        COALESCE(SUM(e.amount) OVER (), '0.00') as total_sum
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
    `;

    const queryParams: (string | undefined)[] = [];
    let paramIndex = 1;

    // Conditionally append WHERE clause
    if (params.categoryId) {
      sqlQuery += ` WHERE e.category_id = $${paramIndex}`;
      queryParams.push(params.categoryId);
      paramIndex++;
    }

    // Append ORDER BY
    sqlQuery += ` ORDER BY e.date DESC, e.created_at DESC`;

    // Execute query
    const expenses = await queryMany<ExpenseWithTotal>(sqlQuery, queryParams);

    // Extract total from first row (all rows have the same total_sum)
    const totalSum = expenses.length > 0
      ? expenses[0].total_sum
      : '0.00';

    // Format total to exactly 2 decimal places
    const formattedTotal = parseFloat(totalSum).toFixed(2);

    // Transform response
    const data: ExpenseResponse[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: {
        id: expense.category_id,
        name: expense.category_name,
      },
      description: expense.description,
      date: expense.date,
      createdAt: expense.created_at,
    }));

    res.json({
      data,
      total: formattedTotal,
      count: expenses.length,
    });
  } catch (error) {
    // Re-throw if it's already an AppError
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'Failed to fetch expenses',
      ErrorCodes.INTERNAL_ERROR,
      500
    );
  }
});

const expensesPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: { error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});

// POST /expenses - Create a new expense (idempotent)
router.post(
  '/',
  expensesPostLimiter,
  normalizeBody,
  requireIdempotencyKey,
  validate(createExpenseSchema),
  async (req: Request, res: Response) => {
    try {
      const { categoryId, amount, description, date } = req.body as CreateExpenseBody;
      const idempotencyKey = req.headers['idempotency-key'] as string;

      // Step 3: Verify category exists
      const category = await queryOne<Category>(
        'SELECT id, name FROM categories WHERE id = $1',
        [categoryId]
      );

      if (!category) {
        throw new AppError(
          'Category not found',
          ErrorCodes.CATEGORY_NOT_FOUND,
          400
        );
      }

      // Try to insert the expense with idempotency key
      try {
        const result = await queryMany<{
          id: string;
          amount: string;
          category_id: string;
          description: string;
          date: string;
          created_at: string;
        }>(
          `INSERT INTO expenses (amount, category_id, description, date, idempotency_key)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, amount, category_id, description, date, created_at`,
          [amount, categoryId, description, date, idempotencyKey]
        );

        if (result.length === 0) {
          throw new AppError(
            'Failed to create expense',
            ErrorCodes.INTERNAL_ERROR,
            500
          );
        }

        const expense = result[0];
        const response: ExpenseResponse = {
          id: expense.id,
          amount: expense.amount,
          category: {
            id: category.id,
            name: category.name,
          },
          description: expense.description,
          date: expense.date,
          createdAt: expense.created_at,
        };

        res.status(201).json({ data: response });
      } catch (error) {
        // Handle duplicate idempotency key (PostgreSQL error 23505)
        if (error instanceof Error && 'code' in error && error.code === '23505') {
          // Fetch the existing expense by idempotency key
          const existingResult = await queryMany<{
            id: string;
            amount: string;
            category_id: string;
            description: string;
            date: string;
            created_at: string;
          }>(
            `SELECT id, amount, category_id, description, date, created_at
             FROM expenses
             WHERE idempotency_key = $1`,
            [idempotencyKey]
          );

          if (existingResult.length === 0) {
            throw new AppError(
              'Failed to fetch existing expense',
              ErrorCodes.INTERNAL_ERROR,
              500
            );
          }

          const expense = existingResult[0];
          const response: ExpenseResponse = {
            id: expense.id,
            amount: expense.amount,
            category: {
              id: category.id,
              name: category.name,
            },
            description: expense.description,
            date: expense.date,
            createdAt: expense.created_at,
          };

          res.status(200).json({ data: response });
          return;
        }

        // Re-throw if it's already an AppError
        if (error instanceof AppError) {
          throw error;
        }

        throw new AppError(
          'Failed to create expense',
          ErrorCodes.INTERNAL_ERROR,
          500
        );
      }
    } catch (error) {
      // Re-throw if it's already an AppError
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to create expense',
        ErrorCodes.INTERNAL_ERROR,
        500
      );
    }
  }
);

export default router;