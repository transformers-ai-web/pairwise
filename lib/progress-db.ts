import { Pool } from 'pg';

const globalForProgressDb = globalThis as typeof globalThis & {
  progressPool?: Pool;
  progressSchemaReady?: Promise<void>;
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
  if (!globalForProgressDb.progressSchemaReady) {
    globalForProgressDb.progressSchemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT NOT NULL,
        module TEXT NOT NULL CHECK (module IN ('interview', 'genai')),
        progress JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, module)
      )
    `).then(() => undefined).catch(error => {
      globalForProgressDb.progressSchemaReady = undefined;
      throw error;
    });
  }

  return globalForProgressDb.progressSchemaReady;
}

export async function loadUserProgress(userId: string, module: 'interview' | 'genai') {
  await ensureSchema();
  const result = await getPool().query<{ progress: unknown }>(
    'SELECT progress FROM user_progress WHERE user_id = $1 AND module = $2',
    [userId, module]
  );
  return result.rows[0]?.progress ?? null;
}

export async function saveUserProgress(userId: string, module: 'interview' | 'genai', progress: unknown) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO user_progress (user_id, module, progress, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW())
     ON CONFLICT (user_id, module)
     DO UPDATE SET progress = EXCLUDED.progress, updated_at = NOW()`,
    [userId, module, JSON.stringify(progress)]
  );
}
