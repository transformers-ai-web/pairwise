import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeys, metaProblems } from '../lib/journeys';
import { normalizeProgress, nextPair } from '../lib/progress';
import { filterCards } from '../lib/collection';

test('original journey retains its bank and storage identity', () => {
  assert.equal(journeys.foundations.problems.length, 32);
  assert.equal(journeys.foundations.localKey, 'pairwise-preview-v1');
  assert.equal(journeys.foundations.module, 'interview');
  assert.notEqual(journeys.meta.localKey, journeys.foundations.localKey);
  assert.notEqual(journeys.meta.module, journeys.foundations.module);
});
test('Meta progress validates against its own bank and boundaries', () => {
  assert.deepEqual(normalizeProgress({ solved: ['two-sum', metaProblems[0].id, metaProblems[0].id], pair: 26 }, metaProblems), { solved: [metaProblems[0].id], pair: 0, cardLayout: 'difficulty-v1' });
  assert.equal(nextPair({ solved: [metaProblems[0].id], pair: 0 }, 1, metaProblems), 0);
  assert.equal(nextPair({ solved: filterCards(metaProblems, 'All')[0].problems.map(p => p.id), pair: 0 }, 1, metaProblems), 1);
  assert.equal(nextPair({ solved: metaProblems.map(p => p.id), pair: 25 }, 1, metaProblems), 25);
  assert.equal(nextPair({ solved: [], pair: 0 }, -1, metaProblems), 0);
});
test('Meta collection has complete pairs, unique problems, and report links', () => {
  assert.equal(metaProblems.length, 50);
  assert.equal(new Set(metaProblems.map(p => p.id)).size, 50);
  assert.ok(metaProblems.every(p => new URL(p.source).pathname.startsWith('/discuss/post/')));
  assert.ok(metaProblems.every(p => p.sourceKind));
  assert.ok(metaProblems.some(p => p.difficulty === 'Hard'));
});

test('regrouping migrates old positions and preserves saved completion', () => {
  const original = ['valid-palindrome-ii', 'minimum-remove-to-make-valid-parentheses', 'diameter-of-binary-tree', 'lowest-common-ancestor-of-a-binary-tree', 'subarray-sum-equals-k', 'product-of-array-except-self', 'diagonal-traverse', 'next-permutation'];
  assert.deepEqual(metaProblems.slice(0, 8).map(p => p.id), original);
  const saved = normalizeProgress({ solved: original, pair: 3 }, metaProblems);
  const cards = filterCards(metaProblems, 'All');
  assert.deepEqual(saved, { solved: original, pair: 6, cardLayout: 'difficulty-v1' });
  assert.equal(nextPair(saved, 1, metaProblems), 7);
  for (let pair = 0; pair < 25; pair++) {
    const migrated = normalizeProgress({ solved: original, pair }, metaProblems);
    assert.ok(cards[migrated.pair].problems.some(p => p.id === metaProblems[pair * 2].id));
    assert.deepEqual(normalizeProgress(migrated, metaProblems), migrated);
  }
  assert.equal(normalizeProgress({ solved: [], pair: 25, cardLayout: 'difficulty-v1' }, metaProblems).pair, 25);
});

test('a solo card unlocks after its one problem is solved', () => {
  const solo = filterCards(metaProblems, 'All')[3];
  assert.equal(solo.problems.length, 1);
  assert.equal(nextPair({ solved: [], pair: 3 }, 1, metaProblems), 3);
  assert.equal(nextPair({ solved: [solo.problems[0].id], pair: 3 }, 1, metaProblems), 4);
});
