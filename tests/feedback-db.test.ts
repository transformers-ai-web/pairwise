import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createFeedbackStore } from '../lib/feedback-db';

test('stores feedback rows in a file-based sqlite database', async () => {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'pairwise-feedback-'));
  let store: ReturnType<typeof createFeedbackStore> | undefined;

  try {
    store = createFeedbackStore({ dbPath: path.join(tempDir, 'feedback.sqlite') });
    const inserted = await store.insert({ category: 'Bug', message: 'Broken link', pair: 3 });

    assert.ok(inserted.id);
    assert.equal(inserted.category, 'Bug');
    assert.equal(inserted.message, 'Broken link');
    assert.equal(inserted.pair, 3);

    const rows = await store.list();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].category, 'Bug');
    assert.equal(rows[0].message, 'Broken link');
    assert.equal(rows[0].pair, 3);
    assert.match(rows[0].createdAt, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    if (store) {
      await store.close();
    }
    rmSync(tempDir, { recursive: true, force: true });
  }
});
