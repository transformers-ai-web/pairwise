import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeys } from '../lib/journeys';
import { filterCards } from '../lib/collection';
import { normalizeProgress } from '../lib/progress';

test('journey data survives the server-to-client serialization boundary', () => {
  for (const journey of Object.values(journeys)) {
    const snapshot = JSON.parse(JSON.stringify(journey));
    assert.equal(snapshot.title, journey.title);
    assert.equal(snapshot.localKey, journey.localKey);
    assert.deepEqual(filterCards(snapshot.problems, 'All'), filterCards(journey.problems, 'All'));
    for (const difficulty of ['Easy', 'Medium', 'Hard'] as const) {
      assert.deepEqual(filterCards(snapshot.problems, difficulty), filterCards(journey.problems, difficulty));
    }
    const saved = { solved: [journey.problems[0].id], pair: 3, cardLayout: 'difficulty-v1' };
    assert.deepEqual(normalizeProgress(saved, snapshot.problems), normalizeProgress(saved, journey.problems));
    assert.deepEqual(normalizeProgress({ ...saved, cardLayout: undefined }, snapshot.problems), normalizeProgress({ ...saved, cardLayout: undefined }, journey.problems));
  }
});
