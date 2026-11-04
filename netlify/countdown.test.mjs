import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCountdown, attachCountdown } from './countdown.mjs';

const target = Date.parse('2026-12-01T00:00:00+00:00');
test('the countdown stays positive until the last millisecond and clamps at zero', () => {
  assert.deepEqual(getCountdown(target - 93784000, target), [1, 2, 3, 4]);
  assert.deepEqual(getCountdown(target - 1, target), [0, 0, 0, 1]);
  assert.deepEqual(getCountdown(target, target), [0, 0, 0, 0]);
  assert.deepEqual(getCountdown(target + 1000, target), [0, 0, 0, 0]);
});
test('a tab waking after the drop redirects once and provides a working fallback link', () => {
  const page = new EventTarget();
  const view = new EventTarget();
  page.hidden = false;
  const numbers = Array.from({ length: 4 }, () => ({ textContent: '--' }));
  const timer = { setAttribute(name, value) { this[name] = value; } };
  const nodes = Object.fromEntries(['[data-launch-status]', '#launch-title', '[data-launch-message]', '[data-launch-link]'].map(key => [key, { textContent: '', hidden: true }]));
  nodes['[role="timer"]'] = timer;
  const root = {
    dataset: { launchAt: '2026-12-01T00:00:00+00:00', storeUrl: 'https://treau-studio.matteolopesdesouza.chatgpt.site/' },
    querySelector: key => nodes[key], querySelectorAll: () => numbers,
  };
  let now = target - 2000;
  let callback;
  let clears = 0;
  const redirects = [];
  const cleanup = attachCountdown(root, { now: () => now, page, view, setInterval: fn => { callback = fn; return 1; }, clearInterval: () => clears++, redirect: url => redirects.push(url) });
  assert.deepEqual(numbers.map(node => node.textContent), ['00', '00', '00', '02']);
  now = target + 10000;
  page.dispatchEvent(new Event('visibilitychange'));
  callback();
  view.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(redirects, [root.dataset.storeUrl]);
  assert.equal(nodes['[data-launch-link]'].hidden, false);
  assert.match(timer['aria-label'], /^0 jours/);
  assert.ok(clears >= 1);
  cleanup();
});
