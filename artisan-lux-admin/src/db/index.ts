import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __db_pool__: Pool | undefined;
  // eslint-disable-next-line no-var
  var __db_drizzle__: ReturnType<typeof drizzleNode> | undefined;
  // eslint-disable-next-line no-var
  var __db_inited__: boolean | undefined;
}

// Prefer Vercel Postgres pooled driver when available to avoid connection storms
function shouldUseVercelDriver() {
  // Use Vercel pooled driver ONLY when the required env is present
  return !!process.env.POSTGRES_URL;
}

let db: ReturnType<typeof drizzleNode> | ReturnType<typeof drizzleVercel>;
let pool: Pool | undefined;

if (shouldUseVercelDriver()) {
  // Uses Vercel-managed pooled connections
  db = drizzleVercel(sql, { schema });
} else {
  // Fallback: node-postgres with a singleton pool to reuse connections across invocations
  pool = global.__db_pool__ ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
  if (!global.__db_pool__) global.__db_pool__ = pool;
  db = global.__db_drizzle__ ?? drizzleNode(pool, { schema });
  if (!global.__db_drizzle__) global.__db_drizzle__ = db as ReturnType<typeof drizzleNode>;
}

export { db };
export { schema };

// Best-effort initializer to ensure core auth tables exist in the admin DB.
// Prevents "missing table: sessions/admins" on fresh databases.
async function initCoreTables() {
  try {
    if (shouldUseVercelDriver()) {
      // admins
      await sql`CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(160) NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS admins_email_unique ON admins(email)`;

      // sessions
      await sql`CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id),
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_unique ON sessions(token)`;
    } else if (pool) {
      // admins
      await pool.query(`CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(160) NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);
      await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS admins_email_unique ON admins(email)`);

      // sessions
      await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id),
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )`);
      await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_unique ON sessions(token)`);
    }
  } catch (e) {
    console.error("[admin-db] initCoreTables error:", e);
  }
}

if (!global.__db_inited__) {
  global.__db_inited__ = true;
  // Fire-and-forget to avoid impacting cold start; creation is idempotent
  void initCoreTables();
}
