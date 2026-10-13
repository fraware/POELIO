import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allSchedules, recurrence, repeatedEdges,
  minimumRepairs, scheduleKey, validateCanonical
} from '../.compiled/model.js';

test('256 unique binary schedules', () => {
  const all = allSchedules();
  assert.equal(all.length, 256);
  assert.equal(new Set(all.map(scheduleKey)).size, 256);
  for (const schedule of all) {
    assert.equal(schedule.length, 8);
    assert.ok(schedule.every(value => value === 'A' || value === 'B'));
  }
});

test('strict alternation and recurrence conflict', () => {
  const recurrent = allSchedules().filter(recurrence);
  assert.equal(recurrent.length, 128);
  assert.equal(recurrent.filter(s => repeatedEdges(s).length === 0).length, 0);
});

test('exactly 14 minimum repairs, two at every repeated edge', () => {
  const repairs = minimumRepairs();
  assert.equal(repairs.length, 14);
  assert.equal(new Set(repairs.map(r => scheduleKey(r.schedule))).size, 14);
  for (let edge = 0; edge < 7; edge++) {
    const choices = repairs.filter(r => r.faultEdge === edge);
    assert.equal(choices.length, 2);
    assert.deepEqual(new Set(choices.map(r => r.repeatedCaregiver)), new Set(['A', 'B']));
    for (const choice of choices) {
      assert.ok(recurrence(choice.schedule));
      assert.deepEqual(repeatedEdges(choice.schedule), [edge]);
    }
  }
});

test('canonical validation rejects omissions, duplicates and altered metadata', () => {
  const repairs = minimumRepairs();
  assert.doesNotThrow(() => validateCanonical(repairs));
  assert.throws(() => validateCanonical(repairs.slice(1)), /Expected 14/);
  assert.throws(() => validateCanonical([...repairs.slice(0, 13), repairs[0]]), /Duplicate/);
  assert.throws(
    () => validateCanonical([
      { ...repairs[0], faultEdge: (repairs[0].faultEdge + 1) % 7 },
      ...repairs.slice(1)
    ]),
    /Incorrect canonical/
  );
});
