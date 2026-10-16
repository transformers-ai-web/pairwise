import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextPair, normalizeProgress } from '../lib/progress';
import { problems } from '../lib/problems';
import { filterCards } from '../lib/collection';
const pairs = filterCards(problems, 'All').map(card => card.problems);
test('discard invalid persisted values and duplicate solved IDs', () => {
  assert.deepEqual(normalizeProgress({ solved: ['two-sum', 'unknown', 'two-sum'], pair: -1 }), { solved: ['two-sum'], pair: 0, cardLayout: 'difficulty-v1' });
  assert.deepEqual(normalizeProgress(null), { solved: [], pair: 0, cardLayout: 'difficulty-v1' });
});
test('next stays locked until both current problems are solved', () => {
  assert.equal(nextPair({ solved: [], pair: 0 }), 0);
  assert.equal(nextPair({ solved: [pairs[0][0].id], pair: 0 }), 0);
  assert.equal(nextPair({ solved: pairs[0].map(p => p.id), pair: 0 }), 1);
});
test('back returns to the adjacent completed pair and preserves saved checkmarks', () => {
  const progress = normalizeProgress({ solved: pairs[0].map(p => p.id), pair: 1, cardLayout: 'difficulty-v1' });
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

test('old Foundations positions migrate once and solved IDs survive regrouping', () => {
  const solved = ['two-sum', 'group-anagrams', 'weighted-job-scheduling'];
  for (let oldPair = 0; oldPair < 16; oldPair++) {
    const migrated = normalizeProgress({ solved, pair: oldPair });
    assert.ok(pairs[migrated.pair].some(problem => problem.id === problems[oldPair * 2].id));
    assert.deepEqual(migrated.solved, solved);
    assert.deepEqual(normalizeProgress(migrated), migrated);
  }
});
