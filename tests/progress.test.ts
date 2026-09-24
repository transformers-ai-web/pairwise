import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextPair, normalizeProgress } from '../lib/progress';
import { pairs, problems } from '../lib/problems';
test('discard invalid persisted values and duplicate solved IDs', () => {
  assert.deepEqual(normalizeProgress({ solved: ['two-sum', 'unknown', 'two-sum'], pair: -1 }), { solved: ['two-sum'], pair: 0 });
  assert.deepEqual(normalizeProgress(null), { solved: [], pair: 0 });
});
test('next stays locked until both current problems are solved', () => {
  assert.equal(nextPair({ solved: [], pair: 0 }), 0);
  assert.equal(nextPair({ solved: [pairs[0][0].id], pair: 0 }), 0);
  assert.equal(nextPair({ solved: pairs[0].map(p => p.id), pair: 0 }), 1);
});
test('back returns to the adjacent completed pair and preserves saved checkmarks', () => {
  const progress = normalizeProgress({ solved: pairs[0].map(p => p.id), pair: 1 });
  const previous = { ...progress, pair: nextPair(progress, -1) };
  assert.equal(previous.pair, 0);
  assert.ok(pairs[previous.pair].every(p => previous.solved.includes(p.id)));
  assert.deepEqual(previous.solved, progress.solved);
  assert.equal(nextPair(previous), 1);
  assert.equal(nextPair({ ...previous, solved: previous.solved.slice(1) }), 0);
});
test('navigation visits completed pairs in order and stops at collection boundaries', () => {
  const solved = problems.map(p => p.id);
  assert.equal(nextPair({ solved, pair: 0 }), 1);
  assert.equal(nextPair({ solved, pair: 7 }), 8);
  assert.equal(nextPair({ solved, pair: 7 }, -1), 6);
  assert.equal(nextPair({ solved, pair: 0 }, -1), 0);
  assert.equal(nextPair({ solved, pair: pairs.length - 1 }), pairs.length - 1);
});
test('question bank has unique IDs and complete pairs with secure links', () => {
  assert.equal(new Set(problems.map(p => p.id)).size, problems.length);
  assert.ok(pairs.every(pair => pair.length === 2));
  assert.ok(problems.every(p => new URL(p.url).protocol === 'https:'));
});
