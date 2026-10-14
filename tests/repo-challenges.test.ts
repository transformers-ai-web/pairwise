import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Pool } from 'pg';
import { getRepoChallenge, listRepoChallenges } from '../lib/repo-challenges-db';
import { sampleRepoChallenge } from '../lib/repo-challenges';

test('repo catalog supports preview, retries failed initialization, and seeds without overwriting edits', async () => {
  const keys = ['DATABASE_URL', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const previous = keys.map(key => process.env[key]);
  const state = globalThis as typeof globalThis & { progressPool?: Pool; repoChallengesSchemaReady?: Promise<void> };
  const previousPool = state.progressPool;
  const calls: { sql: string; values?: unknown[] }[] = [];
  try {
    keys.forEach(key => delete process.env[key]);
    assert.deepEqual(await listRepoChallenges(), [sampleRepoChallenge]);
    assert.equal(await getRepoChallenge('missing'), null);
    assert.equal(await getRepoChallenge(sampleRepoChallenge.id), sampleRepoChallenge);

    process.env.DATABASE_URL = 'postgresql://test-only';
    let fail = true;
    state.progressPool = { query: async (sql: string, values?: unknown[]) => {
      calls.push({ sql, values });
      if (fail) { fail = false; throw new Error('Temporary database failure'); }
      return { rows: sql.startsWith('SELECT') ? [sampleRepoChallenge] : [] };
    } } as unknown as Pool;
    await assert.rejects(listRepoChallenges(), /Temporary database failure/);
    assert.deepEqual(await listRepoChallenges(), [sampleRepoChallenge]);
    const id = "untrusted' OR 1=1 --";
    await getRepoChallenge(id);
    const inserts = calls.filter(call => call.sql.includes('INSERT INTO'));
    assert.equal(inserts.length, 1);
    assert.match(inserts[0].sql, /ON CONFLICT \(id\) DO NOTHING/);
    assert.equal(inserts[0].values?.[0], sampleRepoChallenge.id);
    const lookup = calls.at(-1)!;
    assert.match(lookup.sql, /id = \$1 AND status = 'published'/);
    assert.deepEqual(lookup.values, [id]);
    assert.ok(calls.filter(call => call.sql.startsWith('SELECT')).every(call => call.sql.includes("status = 'published'")));
  } finally {
    keys.forEach((key, index) => { if (previous[index] === undefined) delete process.env[key]; else process.env[key] = previous[index]; });
    state.progressPool = previousPool;
    state.repoChallengesSchemaReady = undefined;
  }
});
