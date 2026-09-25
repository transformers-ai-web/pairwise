import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackStore, type SqlClient } from '../lib/feedback-db';

test('stores feedback rows through a SQLite-compatible client', async () => {
  const rows: Array<Record<string, unknown>> = [];
  const client = {
    async execute(sql: string, args: unknown[] = []) {
      if (sql.startsWith('INSERT')) {
        rows.push({ id: args[0], category: args[1], message: args[2], pair: args[3], createdAt: args[4] });
      }
      return { columns: [], columnTypes: [], rows, rowsAffected: 0, lastInsertRowid: undefined, toJSON: () => ({ rows }) };
    },
  };
  const store = createFeedbackStore(client as unknown as SqlClient);
  const inserted = await store.insert({ category: 'Bug', message: 'Broken link', pair: 3 });

  assert.ok(inserted.id);
  assert.equal(inserted.category, 'Bug');
  assert.equal(inserted.message, 'Broken link');
  assert.equal(inserted.pair, 3);

  const saved = await store.list();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].category, 'Bug');
  assert.equal(saved[0].message, 'Broken link');
  assert.equal(saved[0].pair, 3);
  assert.match(saved[0].createdAt, /^\d{4}-\d{2}-\d{2}T/);
});
