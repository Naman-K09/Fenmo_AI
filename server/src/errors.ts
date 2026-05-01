export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fields?: Record<string, string>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.fields = fields;
  }
}

export const ErrorCodes = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  CATEGORY_IN_USE: 'CATEGORY_IN_USE',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;