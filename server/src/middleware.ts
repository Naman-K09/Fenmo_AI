import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError, ErrorCodes } from './errors.js';

export function validate<T extends z.ZodSchema>(
  schema: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fields: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fields[path] = err.message;
        });

        throw new AppError(
          'Validation failed',
          ErrorCodes.VALIDATION_FAILED,
          400,
          fields
        );
      }
      next(error);
    }
  };
}