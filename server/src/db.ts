import 'dotenv/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

// Typed query helpers
export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

export async function queryMany<T extends QueryResultRow>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function query(
  sql: string,
  params?: any[]
): Promise<QueryResult> {
  return pool.query(sql, params);
}