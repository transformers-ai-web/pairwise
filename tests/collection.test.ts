import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCards } from '../lib/collection';
import { metaProblems } from '../lib/journeys';
import { problems } from '../lib/problems';

test('Foundations keeps 32 unique problems in 16 cards grouped by difficulty', () => {
  const cards = filterCards(problems, 'All');
  assert.equal(cards.length, 16);
  assert.ok(cards.every(card => card.problems.length === 2));
  assert.deepEqual(cards.map(card => card.problems[0].difficulty), [...Array(5).fill('Easy'), ...Array(10).fill('Medium'), 'Hard']);
  assert.deepEqual(cards.flatMap(card => card.problems.map(p => p.id)).sort(), problems.map(p => p.id).sort());
  for (const difficulty of ['Easy', 'Medium', 'Hard'] as const) {
    assert.ok(filterCards(problems, difficulty).every(card => card.problems.every(problem => problem.difficulty === difficulty)));
  }
});

test('Meta cards progress by difficulty and never mix levels', () => {
  const original = metaProblems.map(p => p.id);
  const hard = filterCards(metaProblems, 'Hard');
  assert.equal(hard.length, 5);
  assert.ok(hard.every(card => card.problems.every(p => p.difficulty === 'Hard')));
  assert.deepEqual(hard.map(card => card.index), [21, 22, 23, 24, 25]);
  assert.deepEqual(metaProblems.map(p => p.id), original);
  const all = filterCards(metaProblems, 'All');
  assert.equal(all.length, 26);
  assert.equal(all.filter(card => card.problems.length === 1).length, 2);
  assert.equal(new Set(all.flatMap(card => card.problems.map(p => p.id))).size, 50);
  assert.ok(all.every(card => new Set(card.problems.map(p => p.difficulty)).size === 1));
  assert.deepEqual(all.map(card => card.problems[0].difficulty), [...Array(4).fill('Easy'), ...Array(17).fill('Medium'), ...Array(5).fill('Hard')]);
  assert.deepEqual(filterCards(metaProblems.slice(0, 8), 'Hard'), []);
});
