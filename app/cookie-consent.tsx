'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, X } from 'lucide-react';
import { CONSENT_COOKIE, CONSENT_KEY, CONSENT_MAX_AGE, CookieConsent, consentFromCookie, createConsent, parseConsent } from '../lib/consent';
import { randomId } from '../lib/client-id';
import { useDialog } from './use-dialog';

const PrivacyContext = createContext<(() => void) | null>(null);

export function CookieSettingsButton({ className = '' }: { className?: string }) {
  const open = useContext(PrivacyContext);
  return <button type="button" className={className} onClick={open || undefined}>Gérer mes cookies</button>;
}

function readChoice() {
  const cookie = consentFromCookie(document.cookie);
  if (cookie) return cookie;
  try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}

export default function CookieConsentProvider({ children }: { children: ReactNode }) {
  const path = usePathname() || '/';
  const [choice, setChoice] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [notice, setNotice] = useState('');
  const visitRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const read = () => { const saved = readChoice(); setChoice(saved); setReady(true); };
    const storage = (e: StorageEvent) => { if (e.key === CONSENT_KEY || e.key === null) read(); };
    const visibility = () => { if (!document.hidden) read(); };
    read();
    addEventListener('storage', storage);
    addEventListener('pageshow', read);
    document.addEventListener('visibilitychange', visibility);
    return () => { removeEventListener('storage', storage); removeEventListener('pageshow', read); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!choice?.analytics) {
      visitRequest.current?.abort();
      try { sessionStorage.removeItem('treau.visit'); } catch { /* Storage can be unavailable. */ }
      return;
    }
    if (path.startsWith('/admin')) return;
    let session = randomId();
    try { session = sessionStorage.getItem('treau.visit') || session; sessionStorage.setItem('treau.visit', session); } catch { /* The page can still be counted without persistence. */ }
    const controller = new AbortController();
    visitRequest.current = controller;
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session }), signal: controller.signal }).catch(() => {}).finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [ready, choice?.analytics, path]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const showPreferences = useCallback(() => {
    setAnalytics(readChoice()?.analytics || false);
    setOpen(true);
  }, []);
  useDialog(open ? 'cookie-preferences' : null, () => setOpen(false), '[data-privacy-dialog]');

  const save = (allow: boolean) => {
    const saved = createConsent(allow);
    const value = JSON.stringify(saved);
    let persistent = false;
    try {
      document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      persistent = !!consentFromCookie(document.cookie);
    } catch { /* A choice can still be kept in memory. */ }
    try { localStorage.setItem(CONSENT_KEY, value); persistent = true; } catch { /* Keep this visit usable when storage is blocked. */ }
    if (!allow) {
      visitRequest.current?.abort();
      try { sessionStorage.removeItem('treau.visit'); } catch { /* Nothing else to clear. */ }
    }
    setChoice(saved);
    setOpen(false);
    setNotice(persistent ? (allow ? 'Votre choix est enregistré. Mesure d’audience activée.' : 'Votre choix est enregistré. Seuls les éléments nécessaires restent actifs.') : 'Votre choix est appliqué pour cette page. Votre navigateur empêche sa mémorisation.');
  };

  return <PrivacyContext.Provider value={showPreferences}>
    {children}
    {ready && !choice && !open && <section className="cookie-banner" role="region" aria-label="Choix des cookies">
      <div className="cookie-heading"><ShieldCheck size={23} aria-hidden="true" /><span>TREAU · CONFIDENTIALITÉ</span></div>
      <h2>Vos cookies, votre choix.</h2>
      <p>Le panier et les favoris utilisent un stockage nécessaire. Avec votre accord, nous mesurons aussi les visites pour améliorer la boutique. Aucun traceur publicitaire.</p>
      <a href="/policies/privacy" className="cookie-policy">Lire la politique de confidentialité ↗</a>
      <div className="cookie-choices"><button type="button" onClick={() => save(false)}>Tout refuser</button><button type="button" onClick={() => save(true)}>Tout accepter</button></div>
      <button type="button" className="cookie-customize" onClick={showPreferences}>Personnaliser mes choix</button>
    </section>}
    {open && <div className="modal-shell privacy-shell">
      <button type="button" className="modal-backdrop" aria-label="Fermer les préférences cookies" tabIndex={-1} onClick={() => setOpen(false)} />
      <section className="modal-content privacy-panel" role="dialog" aria-modal="true" aria-labelledby="privacy-title" data-privacy-dialog tabIndex={-1}>
        <header className="panel-heading"><span>VOTRE CONFIDENTIALITÉ</span><button type="button" aria-label="Fermer les préférences cookies" onClick={() => setOpen(false)}><X size={22} /></button></header>
        <div className="privacy-body"><ShieldCheck className="privacy-icon" size={30} aria-hidden="true" /><h2 id="privacy-title">Vous gardez le contrôle.</h2><p>Vos choix sont conservés pendant 180 jours. Vous pouvez les modifier à tout moment avec « Gérer mes cookies ».</p>
          <div className="privacy-category"><div><h3>Nécessaires</h3><p>Panier, favoris, sécurité de la connexion et mémorisation de votre choix.</p></div><span className="privacy-always">Toujours actifs</span></div>
          <label className="privacy-category privacy-optional"><div><h3>Mesure d’audience</h3><p>Compter les visites et les pages consultées dans la boutique. Aucun suivi publicitaire entre sites.</p></div><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} aria-label="Autoriser la mesure d’audience" /></label>
          <a className="cookie-policy" href="/policies/privacy" onClick={() => setOpen(false)}>Politique de confidentialité ↗</a>
          <div className="cookie-choices"><button type="button" onClick={() => save(false)}>Tout refuser</button><button type="button" onClick={() => save(true)}>Tout accepter</button></div>
          <button type="button" className="privacy-save" onClick={() => save(analytics)}>Enregistrer mes choix</button>
        </div>
      </section>
    </div>}
    {notice && <div className="privacy-notice" role="status">{notice}</div>}
  </PrivacyContext.Provider>;
}
