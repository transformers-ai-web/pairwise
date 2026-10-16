import { Pool } from 'pg';
import type { InterviewModule } from './journeys';

const globalForProgressDb = globalThis as typeof globalThis & {
  progressPool?: Pool;
  // Use a new cache key when the schema changes: Next.js preserves globals on reload.
  progressFaangSchemaReady?: Promise<void>;
  usersSchemaReady?: Promise<void>;
};

function getPool() {
  if (globalForProgressDb.progressPool) return globalForProgressDb.progressPool;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (connectionString) {
    globalForProgressDb.progressPool = new Pool({
      connectionString,
      // Hosted databases use TLS by default; explicit URL SSL options take precedence.
      ssl: true,
      max: 5,
    });
    return globalForProgressDb.progressPool;
  }

  const host = process.env.DB_HOST;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const port = Number(process.env.DB_PORT || 5432);

  if (!host || !database || !user || !password || !Number.isInteger(port)) {
    throw new Error('PostgreSQL is not fully configured. Set DATABASE_URL or all required DB_* variables.');
  }

  globalForProgressDb.progressPool = new Pool({ host, port, database, user, password, max: 5 });
  return globalForProgressDb.progressPool;
}

async function ensureSchema() {
  if (!globalForProgressDb.progressFaangSchemaReady) {
    globalForProgressDb.progressFaangSchemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT NOT NULL,
        module TEXT NOT NULL CHECK (module IN ('interview', 'genai', 'interview-meta', 'interview-google', 'interview-apple', 'interview-amazon', 'interview-netflix')),
        progress JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, module)
      );
      ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_module_check;
      ALTER TABLE user_progress ADD CONSTRAINT user_progress_module_check CHECK (module IN ('interview', 'genai', 'interview-meta', 'interview-google', 'interview-apple', 'interview-amazon', 'interview-netflix'));
    `).then(() => undefined).catch(error => {
      globalForProgressDb.progressFaangSchemaReady = undefined;
      throw error;
    });
  }

  return globalForProgressDb.progressFaangSchemaReady;
}

export async function saveGoogleUser(user: {
  googleId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}) {
  if (!globalForProgressDb.usersSchemaReady) {
    globalForProgressDb.usersSchemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS users (
        google_id TEXT PRIMARY KEY,
        email TEXT,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined).catch(error => {
      globalForProgressDb.usersSchemaReady = undefined;
      throw error;
    });
  }
  await globalForProgressDb.usersSchemaReady;
  await getPool().query(
    `INSERT INTO users (google_id, email, email_verified, name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id)
     DO UPDATE SET email = EXCLUDED.email,
                   email_verified = EXCLUDED.email_verified,
                   name = EXCLUDED.name,
                   updated_at = NOW()`,
    [user.googleId, user.email, user.email !== null && user.emailVerified, user.name]
  );
}

export async function loadUserProgress(userId: string, module: InterviewModule | 'genai') {
  await ensureSchema();
  const result = await getPool().query<{ progress: unknown }>(
    'SELECT progress FROM user_progress WHERE user_id = $1 AND module = $2',
    [userId, module]
  );
  return result.rows[0]?.progress ?? null;
}

export async function saveUserProgress(userId: string, module: InterviewModule | 'genai', progress: unknown) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO user_progress (user_id, module, progress, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (user_id, module)
     DO UPDATE SET progress = EXCLUDED.progress, updated_at = NOW()`,
    [userId, module, JSON.stringify(progress)]
  );
}
