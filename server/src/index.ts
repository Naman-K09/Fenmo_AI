import express from 'express';
import cors from 'cors';
import categoriesRouter from './routes/categories.js';
import expensesRouter from './routes/expenses.js';
import { AppError } from './errors.js';
import { query } from './db.js';

const app = express();
const PORT = process.env.PORT ?? 3000;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
}));
app.use(express.json({ limit: '16kb' }));

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);

// Health check endpoint - verifies database connectivity
app.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    await query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'degraded',
      reason: 'db_unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

// Global error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      ...(error.fields && { fields: error.fields }),
    });
    return;
  }

  // Handle unexpected errors by logging the full stack trace internally
  console.error(`[UNHANDLED ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.error(error.stack || error);

  // Return a generic error to the client, never leaking stack traces
  res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[${NODE_ENV}] Server running on port ${PORT}`);
});

export default app;
