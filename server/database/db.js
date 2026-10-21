import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

let pool = null;
let pgliteInstance = null;

// Determine connection strategy
if (databaseUrl && databaseUrl.trim().length > 0) {
  console.log('[Database] Connecting to external PostgreSQL via DATABASE_URL');
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost') ? { rejectUnauthorized: false } : false,
  });
} else {
  console.log('[Database] No external DATABASE_URL found. Initializing embedded PostgreSQL (PGlite)');
  const dbDir = path.resolve(__dirname, '../../.pglite');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  pgliteInstance = new PGlite(dbDir);
}

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL statement with $1, $2 placeholders
 * @param {Array} params - Parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export async function query(text, params = []) {
  if (pool) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount };
    } finally {
      client.release();
    }
  } else if (pgliteInstance) {
    // PGlite interface
    const res = await pgliteInstance.query(text, params);
    return { rows: res.rows, rowCount: res.rows ? res.rows.length : 0 };
  } else {
    throw new Error('Database connection not initialized');
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Async function receiving a query executor
 */
export async function transaction(callback) {
  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await callback((t, p) => client.query(t, p));
      await client.query('COMMIT');
      return res;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else if (pgliteInstance) {
    return await pgliteInstance.transaction(async (tx) => {
      return await callback((t, p) => tx.query(t, p));
    });
  }
}

export default {
  query,
  transaction,
};
