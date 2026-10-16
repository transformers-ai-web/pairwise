import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadUserProgress, saveUserProgress } from '../lib/progress-db';

test('journey schema migration runs despite a cached pre-journey schema', async () => {
  const state = globalThis as typeof globalThis & {
    progressPool?: unknown;
    progressSchemaReady?: Promise<void>;
    progressFaangSchemaReady?: Promise<void>;
  };
  const queries: string[] = [];
  const previousPool = state.progressPool;
  state.progressSchemaReady = Promise.resolve();
  Object.assign(state, { progressJourneysSchemaReady: Promise.resolve(), progressGoogleSchemaReady: Promise.resolve() });
  delete state.progressFaangSchemaReady;
  state.progressPool = { query: async (sql: string) => {
    queries.push(sql);
    return { rows: [] };
  } };
  try {
    await saveUserProgress('test-user', 'interview-netflix', { solved: [], pair: 0 });
    assert.match(queries[0], /ALTER TABLE user_progress/);
    assert.match(queries[0], /'interview-netflix'/);
    assert.match(queries[1], /INSERT INTO user_progress/);
    await loadUserProgress('test-user', 'interview');
    assert.equal(queries.filter(sql => sql.includes('ALTER TABLE')).length, 1);
  } finally {
    state.progressPool = previousPool;
    delete state.progressSchemaReady;
    delete state.progressFaangSchemaReady;
  }
});
