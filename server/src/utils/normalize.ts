import { Request, Response, NextFunction } from 'express';

/**
 * Recursively normalizes string fields in an object:
 * - Trims leading/trailing whitespace
 * - Collapses multiple internal spaces into a single space
 */
export function normalizeString(val: string): string {
  return val.trim().replace(/\s+/g, ' ');
}

export function normalizeStrings(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeStrings);
  }

  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      normalized[key] = normalizeString(value);
    } else if (typeof value === 'object') {
      normalized[key] = normalizeStrings(value);
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

/**
 * Express middleware to normalize req.body string fields
 */
export function normalizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = normalizeStrings(req.body);
  }
  next();
}
