export function getCountdown(now, target) {
  const remaining = Math.max(0, Math.ceil((target - now) / 1000));
  return [Math.floor(remaining / 86400), Math.floor(remaining % 86400 / 3600), Math.floor(remaining % 3600 / 60), remaining % 60];
}

export function attachCountdown(root, {
  now = () => Date.now(),
  redirect = url => window.location.replace(url),
  setInterval = (callback, delay) => window.setInterval(callback, delay),
  clearInterval = id => window.clearInterval(id),
  page = document,
  view = window,
} = {}) {
  const target = Date.parse(root.dataset.launchAt);
  const store = new URL(root.dataset.storeUrl);
  if (!Number.isFinite(target) || store.protocol !== 'https:') throw new Error('Invalid drop configuration.');
  const timer = root.querySelector('[role="timer"]');
  const numbers = Array.from(root.querySelectorAll('.launch-number-inner'));
  const words = ['jour', 'heure', 'minute', 'seconde'];
  let opening = false;
  let interval;

  const tick = () => {
    const current = now();
    const values = getCountdown(current, target);
    values.forEach((value, index) => {
      const text = String(value).padStart(2, '0');
      if (numbers[index].textContent !== text) numbers[index].textContent = text;
    });
    timer.setAttribute('aria-label', values.map((value, index) => value + ' ' + words[index] + (value === 1 ? '' : 's')).join(', ') + ' avant le drop');
    if (current >= target && !opening) {
      opening = true;
      clearInterval(interval);
      root.querySelector('[data-launch-status]').textContent = 'LE DROP EST OUVERT';
      root.querySelector('#launch-title').textContent = 'Le drop est ouvert';
      root.querySelector('[data-launch-message]').textContent = 'Redirection vers la boutique…';
      root.querySelector('[data-launch-link]').hidden = false;
      redirect(store.href);
    }
  };

  interval = setInterval(tick, 1000);
  const onVisible = () => { if (!page.hidden) tick(); };
  page.addEventListener('visibilitychange', onVisible);
  view.addEventListener('pageshow', tick);
  tick();
  return () => {
    clearInterval(interval);
    page.removeEventListener('visibilitychange', onVisible);
    view.removeEventListener('pageshow', tick);
  };
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-launch-at]');
  if (root) attachCountdown(root);
}
