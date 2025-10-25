import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Use a singleton pool for serverless environments (Netlify)
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export const db = drizzle(getPool());
