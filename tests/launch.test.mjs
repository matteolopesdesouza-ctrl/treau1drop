import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DROP_TIMESTAMP, getCountdown, isPrelaunch } from '../lib/launch.ts';

test('le drop ouvre exactement le 1er décembre 2026 à minuit à Lisbonne', () => {
  assert.equal(DROP_TIMESTAMP, Date.UTC(2026, 11, 1, 0, 0, 0));
  assert.equal(isPrelaunch(DROP_TIMESTAMP - 1), true);
  assert.equal(isPrelaunch(DROP_TIMESTAMP), false);
  assert.equal(isPrelaunch(DROP_TIMESTAMP + 1), false);
});

test('le chrono décompose le temps et reste positif jusqu’à la dernière milliseconde', () => {
  assert.deepEqual(getCountdown(DROP_TIMESTAMP - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000), { days: 2, hours: 3, minutes: 4, seconds: 5 });
  assert.deepEqual(getCountdown(DROP_TIMESTAMP - 1), { days: 0, hours: 0, minutes: 0, seconds: 1 });
  assert.deepEqual(getCountdown(DROP_TIMESTAMP), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  assert.deepEqual(getCountdown(DROP_TIMESTAMP + 86400000), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});
