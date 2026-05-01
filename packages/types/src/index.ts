// Entity types
export interface Category {
  id: string;
  name: string;
  createdAt: string; // ISO string from TIMESTAMPTZ
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: string; // NUMERIC as string to preserve precision
  description: string;
  date: string; // ISO date string
  createdAt: string; // ISO string from TIMESTAMPTZ
  idempotencyKey?: string;
}

// Request body types
export interface CreateCategoryBody {
  name: string;
}

export interface CreateExpenseBody {
  categoryId: string;
  amount: number;
  description: string;
  date: string; // ISO 8601
  idempotencyKey: string;
}

// Filter types
export interface ExpenseFilters {
  categoryId?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  minAmount?: number;
  maxAmount?: number;
}

// API response shapes
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string>;
};
