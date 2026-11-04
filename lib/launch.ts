// Midnight in Lisbon on 1 December (UTC+00:00 in winter).
export const DROP_DATE = '2026-12-01T00:00:00+00:00';
export const DROP_TIMESTAMP = Date.parse(DROP_DATE);

export function isPrelaunch(now = Date.now()) {
  return now < DROP_TIMESTAMP;
}

export function getCountdown(now: number) {
  const remaining = Math.max(0, Math.ceil((DROP_TIMESTAMP - now) / 1000));
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}
