import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextPair, normalizeProgress } from '../lib/progress';
import { pairs, problems } from '../lib/problems';
test('discard invalid persisted values and duplicate solved IDs', () => {
  assert.deepEqual(normalizeProgress({ solved: ['two-sum', 'unknown', 'two-sum'], pair: -1 }), { solved: ['two-sum'], pair: 0 });
  assert.deepEqual(normalizeProgress(null), { solved: [], pair: 0 });
});
test('skip completed pairs and wrap back to unfinished work', () => {
  const solved = pairs[1].map(p => p.id);
  assert.equal(nextPair({ solved, pair: 0 }), 2);
  assert.equal(nextPair({ solved, pair: pairs.length - 1 }), 0);
  assert.equal(nextPair({ solved, pair: 2 }, -1), 0);
});
test('keep the last unfinished pair and handle collection completion', () => {
  const solved = problems.slice(2).map(p => p.id);
  assert.equal(nextPair({ solved, pair: 0 }), 0);
  assert.equal(nextPair({ solved: problems.map(p => p.id), pair: 7 }), 7);
});
test('question bank has unique IDs and complete pairs with secure links', () => {
  assert.equal(new Set(problems.map(p => p.id)).size, problems.length);
  assert.ok(pairs.every(pair => pair.length === 2));
  assert.ok(problems.every(p => new URL(p.url).protocol === 'https:'));
});
