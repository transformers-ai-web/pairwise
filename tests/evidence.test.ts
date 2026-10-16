import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeys } from '../lib/journeys';
import { initialReportedBanks, legacyCompanyBanks, reportedProblems } from '../lib/reported-problems';
import { normalizeProgress, nextPair } from '../lib/progress';
import { filterCards } from '../lib/collection';

test('every active company question has company-specific candidate evidence', () => {
  for (const company of Object.keys(reportedProblems) as (keyof typeof reportedProblems)[]) {
    const bank = journeys[company].problems;
    assert.equal(bank, reportedProblems[company]);
    assert.equal(new Set(bank.map(p => p.id)).size, bank.length);
    for (const p of bank) {
      assert.equal(p.sourceKind, 'Candidate report');
      assert.equal(p.evidence?.company, company);
      assert.ok(p.evidence?.summary && p.evidence.title && p.evidence.context && p.evidence.date);
      assert.ok(p.source.startsWith('https://'));
      assert.ok(!p.source.includes('5798204'));
    }
    const cards = filterCards(bank, 'All');
    assert.equal(cards.flatMap(c => c.problems).length, bank.length);
    assert.ok(cards.every(c => new Set(c.problems.map(p => p.difficulty)).size === 1));
  }
  assert.ok(!journeys.google.problems.some(p => p.id === 'two-sum'));
  assert.ok(journeys.netflix.problems.length >= 5);
  assert.equal(journeys.netflix.problems[0].evidence?.match, 'Reported variation');
  assert.ok(journeys.netflix.problems[0].source.includes('/comment/'));
});

test('expanded journeys retain the question on a previously saved evidence card', () => {
  for (const company of Object.keys(reportedProblems) as (keyof typeof reportedProblems)[]) {
    const bank = reportedProblems[company];
    const oldCards = filterCards(initialReportedBanks[company], 'All');
    assert.ok(bank.length > initialReportedBanks[company].length);
    for (const old of oldCards) {
      const saved = normalizeProgress({ pair: old.index, solved: old.problems.map(p => p.id), cardLayout: 'evidence-v1' }, bank);
      assert.equal(saved.cardLayout, 'evidence-v2');
      assert.ok(filterCards(bank, 'All')[saved.pair].problems.some(p => old.problems.some(previous => previous.id === p.id)));
      assert.deepEqual(normalizeProgress(saved, bank), saved);
    }
  }
});

test('source audit preserves historical completions and migrates position only once', () => {
  for (const company of Object.keys(reportedProblems) as (keyof typeof reportedProblems)[]) {
    const bank = reportedProblems[company];
    const legacy = legacyCompanyBanks[company];
    const retained = bank.find(p => legacy.some(old => old.id === p.id)) ?? bank[0];
    const removed = legacy.find(p => !bank.some(current => current.id === p.id))!;
    const oldCards = filterCards(legacy, 'All');
    const pair = oldCards.findIndex(c => c.problems.some(p => p.id === retained.id));
    const migrated = normalizeProgress({ solved: [retained.id, removed.id, 'invalid'], pair, cardLayout: 'difficulty-v1' }, bank);
    assert.deepEqual(migrated.solved, [retained.id, removed.id]);
    if (pair >= 0) assert.ok(filterCards(bank, 'All')[migrated.pair].problems.some(p => p.id === retained.id));
    else assert.ok(migrated.pair >= 0 && migrated.pair < filterCards(bank, 'All').length);
    assert.deepEqual(normalizeProgress(migrated, bank), migrated);
    assert.equal(bank.filter(p => migrated.solved.includes(p.id)).length, 1);
    const allDone = normalizeProgress({ ...migrated, solved: [...legacy, ...bank].map(p => p.id) }, bank);
    assert.equal(bank.filter(p => allDone.solved.includes(p.id)).length, bank.length);
    assert.ok(nextPair(allDone, 1, bank) < filterCards(bank, 'All').length);
  }
});
