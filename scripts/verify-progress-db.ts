import { loadEnvConfig } from '@next/env';
import { Pool } from 'pg';
import assert from 'node:assert/strict';
import { journeys } from '../lib/journeys';
import { randomUUID } from 'node:crypto';
import { loadUserProgress, saveUserProgress } from '../lib/progress-db';

async function main() {
  loadEnvConfig(process.cwd());
  const e = process.env;
  const pool = new Pool(e.DATABASE_URL ? { connectionString: e.DATABASE_URL, ssl: true, connectionTimeoutMillis: 5000 } : { host: e.DB_HOST, port: Number(e.DB_PORT || 5432), database: e.DB_NAME, user: e.DB_USER, password: e.DB_PASSWORD, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  // Exercise production storage code in a transaction; no test rows are retained.
  Object.assign(globalThis, { progressPool: client, progressSchemaReady: Promise.resolve() });
  try {
    // Apply the real migration before the rollback-only data check.
    await loadUserProgress(`storage-check-${randomUUID()}`, 'interview-meta');
    await client.query('BEGIN');
    const user = `storage-check-${randomUUID()}`;
    for (const module of [...Object.values(journeys).map(j => j.module), 'genai'] as const) {
      const value = module === 'genai' ? { completed: [], pair: 0 } : { solved: [Object.values(journeys).find(j => j.module === module)!.problems[0].id], pair: 0, cardLayout: 'difficulty-v1' };
      await saveUserProgress(user, module, value);
      assert.deepEqual(await loadUserProgress(user, module), value);
      console.log(`${module}: database save/load passed`);
    }
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
}
main().catch(error => { console.error({ code: error.code, message: error.message }); process.exitCode = 1; });
