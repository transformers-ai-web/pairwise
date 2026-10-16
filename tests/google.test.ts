import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleProblems } from '../lib/google';
import { journeys } from '../lib/journeys';
import { filterCards } from '../lib/collection';
import { normalizeProgress, nextPair } from '../lib/progress';

test('Google has 50 unique sourced questions in 25 homogeneous cards', () => {
  assert.equal(googleProblems.length, 50);
  assert.equal(new Set(googleProblems.map(p => p.id)).size, 50);
  assert.ok(googleProblems.every(p => p.sourceKind === 'Community list' && new URL(p.source).protocol === 'https:' && new URL(p.url).protocol === 'https:'));
  const cards = filterCards(googleProblems, 'All');
  assert.equal(cards.length, 25);
  assert.ok(cards.every(card => card.problems.length === 2 && card.problems[0].difficulty === card.problems[1].difficulty));
  assert.deepEqual(cards.map(card => card.problems[0].difficulty), [...Array(4).fill('Easy'), ...Array(14).fill('Medium'), ...Array(7).fill('Hard')]);
  assert.equal(filterCards(googleProblems, 'Hard').length, 7);
});

test('Google storage identity and progress validation are independent', () => {
  assert.equal(new Set(Object.values(journeys).map(j => j.module)).size, 6);
  assert.equal(new Set(Object.values(journeys).map(j => j.localKey)).size, 6);
  const progress = normalizeProgress({ solved: ['two-sum', 'valid-palindrome-ii'], pair: 24, cardLayout: 'difficulty-v1' }, googleProblems);
  assert.deepEqual(progress, { solved: ['two-sum'], pair: 24, cardLayout: 'difficulty-v1' });
  assert.equal(nextPair({ solved: [], pair: 0 }, 1, googleProblems), 0);
  assert.equal(nextPair({ solved: googleProblems.slice(0, 2).map(p => p.id), pair: 0 }, 1, googleProblems), 1);
  assert.equal(nextPair({ solved: googleProblems.map(p => p.id), pair: 24 }, 1, googleProblems), 24);
});
