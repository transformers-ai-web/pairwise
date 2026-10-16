import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeys } from '../lib/journeys';
import { remainingJourneys } from '../lib/faang';
import { filterCards } from '../lib/collection';
import { normalizeProgress, nextPair } from '../lib/progress';

for (const [company, journey] of Object.entries(remainingJourneys)) {
  test(`${company} has 50 sourced questions in 25 ordered same-difficulty cards`, () => {
    const bank = journey.problems;
    assert.equal(bank.length, 50);
    assert.equal(new Set(bank.map(p => p.id)).size, 50);
    assert.ok(bank.every(p => p.sourceKind && new URL(p.url).protocol === 'https:' && new URL(p.source).protocol === 'https:'));
    const cards = filterCards(bank, 'All');
    assert.equal(cards.length, 25);
    assert.ok(cards.every(c => c.problems.length === 2 && c.problems[0].difficulty === c.problems[1].difficulty));
    const rank = { Easy: 0, Medium: 1, Hard: 2 };
    assert.ok(cards.every((c, i) => i === 0 || rank[c.problems[0].difficulty] >= rank[cards[i - 1].problems[0].difficulty]));
    for (const difficulty of ['Easy', 'Medium', 'Hard'] as const) {
      assert.ok(filterCards(bank, difficulty).length > 0);
      assert.ok(filterCards(bank, difficulty).every(c => c.problems.every(p => p.difficulty === difficulty)));
    }
    const solved = bank.map(p => p.id);
    assert.deepEqual(normalizeProgress({ solved, pair: 24, cardLayout: 'difficulty-v1' }, bank), { solved, pair: 24, cardLayout: 'difficulty-v1' });
    assert.equal(nextPair({ solved: [], pair: 0 }, 1, bank), 0);
    assert.equal(nextPair({ solved, pair: 24 }, 1, bank), 24);
  });
}

test('all six journeys have independent storage identities', () => {
  assert.equal(Object.keys(journeys).length, 6);
  assert.equal(new Set(Object.values(journeys).map(j => j.module)).size, 6);
  assert.equal(new Set(Object.values(journeys).map(j => j.localKey)).size, 6);
});

test('Netflix never presents editorial exercises as reported questions', () => {
  const bank = remainingJourneys.netflix.problems;
  assert.equal(bank.filter(p => p.sourceKind === 'General practice').length, 49);
  const reported = bank.filter(p => p.sourceKind === 'Candidate report');
  assert.equal(reported.length, 1);
  assert.equal(reported[0].id, 'lru-cache');
  assert.ok(bank.filter(p => p.sourceKind === 'General practice').every(p => p.source === p.url));
});
