export const CONSENT_KEY = 'treau.consent';
export const CONSENT_COOKIE = 'treau_consent';
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60;
export type CookieConsent = { version: 1; analytics: boolean; savedAt: number; expiresAt: number };

export function createConsent(analytics: boolean, now = Date.now()): CookieConsent {
  return { version: 1, analytics, savedAt: now, expiresAt: now + CONSENT_MAX_AGE * 1000 };
}

/** Missing, expired or malformed choices always leave audience measurement off. */
export function parseConsent(value: string | null | undefined, now = Date.now()): CookieConsent | null {
  if (!value) return null;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object') return null;
    const c = data as Partial<CookieConsent>;
    if (c.version !== 1 || typeof c.analytics !== 'boolean' || typeof c.savedAt !== 'number' || typeof c.expiresAt !== 'number') return null;
    if (!Number.isFinite(c.savedAt) || !Number.isFinite(c.expiresAt) || c.savedAt > now + 60000 || c.expiresAt <= now || c.expiresAt <= c.savedAt || c.expiresAt - c.savedAt > CONSENT_MAX_AGE * 1000) return null;
    return c as CookieConsent;
  } catch { return null; }
}

export function consentFromCookie(header: string | null | undefined, now = Date.now()) {
  const value = header?.split(';').map(part => part.trim()).find(part => part.startsWith(`${CONSENT_COOKIE}=`));
  if (!value) return null;
  try { return parseConsent(decodeURIComponent(value.slice(CONSENT_COOKIE.length + 1)), now); }
  catch { return null; }
}
