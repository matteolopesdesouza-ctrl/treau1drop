'use client';
import { FormEvent, useRef, useState } from 'react';
import Link from './navigation-link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, LockKeyhole, X } from 'lucide-react';
import { Product, SiteSettings, imageStyle, money } from '../lib/catalog';
import { CartLine } from '../lib/storefront-state';
import { randomId } from '../lib/client-id';
import { requestJSON } from '../lib/request';
import type { StoreUser } from './storefront';

export default function Checkout({ cart, products, settings, user, clear, loaded }: {
  cart: CartLine[]; products: Product[]; settings: SiteSettings; user: StoreUser; clear: () => void; loaded: boolean;
}) {
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('');
  const [form, setForm] = useState({ name: user?.displayName || '', email: user?.email || '', address: '', city: '', postalCode: '', country: 'Portugal' });
  const [coupon, setCoupon] = useState(''), [couponBusy, setCouponBusy] = useState(false), [couponMessage, setCouponMessage] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number; cartKey: string } | null>(null);
  const requestLock = useRef(false), couponLock = useRef(false);
  const idempotency = useRef({ payload: '', key: '' });
  const cartKey = JSON.stringify(cart);
  const subtotal = cart.reduce((n, c) => n + (products.find(p => p.id === c.id)?.price || 0) * c.quantity, 0);
  const validCoupon = applied?.cartKey === cartKey ? applied : null;
  const discount = validCoupon?.discount || 0;
  const shipping = subtotal >= settings.shippingThreshold ? 0 : settings.shippingFee;
  const total = Math.max(0, subtotal - discount) + shipping;
  const locked = busy || couponBusy;
  async function validateCoupon(event: FormEvent) {
    event.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (couponLock.current || requestLock.current) return;
    if (!code) { setCouponMessage('Saisissez un code avant de l’appliquer.'); return; }
    couponLock.current = true; setCouponBusy(true); setCouponMessage(''); setApplied(null);
    try {
      const data = await requestJSON<{ discount: number }>('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, items: cart }) });
      setApplied({ code, discount: data.discount, cartKey });
      setCouponMessage(`Code ${code} appliqué.`);
    } catch (e) { setCouponMessage(e instanceof Error ? e.message : 'Code invalide.'); }
    finally { couponLock.current = false; setCouponBusy(false); }
  }
  async function order() {
    if (requestLock.current || couponLock.current) return;
    requestLock.current = true; setBusy(true); setError('');
    const payload = JSON.stringify({ items: cart, shipping: form, coupon: validCoupon?.code || '' });
    if (idempotency.current.payload !== payload) idempotency.current = { payload, key: randomId() };
    try {
      const result = await requestJSON<{ number: string }>('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...JSON.parse(payload), idempotencyKey: idempotency.current.key }) });
      setDone(result.number); clear(); window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Impossible de créer la commande.'); }
    finally { requestLock.current = false; setBusy(false); }
  }
  function next(event: FormEvent) { event.preventDefault(); setError(''); setStep(s => s + 1); }
  if (!loaded) return <section className="empty-state missing" role="status">CHARGEMENT DE VOTRE PANIER…</section>;
  if (done) return <section className="checkout-success section-pad"><Check size={42} strokeWidth={1}/><p className="eyebrow">COMMANDE {done}</p><h1>VOUS ÊTES<br/>DANS LE MOUVEMENT.</h1><p>Votre commande de démonstration a été enregistrée. Aucun paiement n’a été prélevé et aucune expédition n’est prévue.</p><Link href="/account" className="button dark">MES COMMANDES <ArrowUpRight/></Link><Link href="/shop" className="text-link">CONTINUER LA VISITE <ArrowRight size={18}/></Link></section>;
  if (!cart.length) return <section className="empty-state missing"><h1>VOTRE PANIER EST VIDE.</h1><Link className="button dark" href="/shop">EXPLORER LE DROP <ArrowRight/></Link></section>;
  return <section className="checkout-page section-pad"><Link href="/shop" className="text-link"><ArrowLeft size={16}/> RETOUR AU SHOP</Link><h1>MAKE IT YOURS.</h1><p className="demo-notice">BOUTIQUE EN PRÉOUVERTURE — Commande de démonstration, sans débit ni expédition.</p>
    <div className="checkout-layout"><div><ol className="checkout-steps">{['Informations', 'Livraison', 'Confirmation'].map((t, i) => <li key={t} aria-current={step === i ? 'step' : undefined} className={step === i ? 'active' : step > i ? 'complete' : ''}>{i + 1}. {t}</li>)}</ol>
      {!user ? <div className="account-signin"><h2>CONNECTEZ-VOUS POUR CONTINUER.</h2><p>Votre commande sera rattachée à votre compte.</p><a href="/signin-with-chatgpt?return_to=%2Fcheckout" target="_top" className="button dark">SE CONNECTER <ArrowUpRight/></a></div> : step < 2 ? <form className="form-stack" onSubmit={next}>
        {(step === 0 ? ['name', 'email'] : ['address', 'city', 'postalCode', 'country']).map(key => {
          const k = key as keyof typeof form;
          const labels = { name: 'Nom complet', email: 'E-mail', address: 'Adresse de livraison', city: 'Ville', postalCode: 'Code postal', country: 'Pays' };
          const max = { name: 150, email: 200, address: 200, city: 100, postalCode: 30, country: 100 };
          const autocomplete = { name: 'name', email: 'email', address: 'street-address', city: 'address-level2', postalCode: 'postal-code', country: 'country-name' };
          return <label key={k}>{labels[k]}<input required type={k === 'email' ? 'email' : 'text'} minLength={k === 'name' || k === 'country' ? 2 : k === 'address' ? 3 : 1} maxLength={max[k]} autoComplete={autocomplete[k]} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}/></label>;
        })}<button className="button dark" type="submit">CONTINUER <ArrowRight size={18}/></button>{step > 0 && <button type="button" className="text-link" onClick={() => setStep(s => s - 1)}>RETOUR</button>}
      </form> : <div className="checkout-payment"><LockKeyhole size={28}/><h2>COMMANDE DE DÉMONSTRATION</h2><p>Aucune carte bancaire ne sera demandée. Validez pour essayer le suivi des commandes et la gestion du stock.</p><div className="shipping-review">{form.name}<br/>{form.address}<br/>{form.postalCode} {form.city}, {form.country}<br/>{form.email}</div>{error && <p role="alert" className="form-error">{error}</p>}<button className="button dark" disabled={locked} onClick={order}>{busy ? 'ENREGISTREMENT…' : 'CONFIRMER LA COMMANDE DÉMO'}<ArrowRight size={18}/></button><button className="text-link" disabled={locked} onClick={() => setStep(1)}>MODIFIER LA LIVRAISON</button><button className="text-link" disabled={locked} onClick={() => setStep(0)}>MODIFIER MES INFORMATIONS</button></div>}
    </div><aside className="checkout-summary"><h2>VOTRE SÉLECTION ({cart.reduce((n, c) => n + c.quantity, 0)})</h2>{cart.map((c, i) => { const p = products.find(p => p.id === c.id); return p ? <article key={i}><img src={p.image} alt={p.name} style={imageStyle(p, c.color)}/><div><strong>{p.name}</strong><span>{c.color} / {c.size} / Qté {c.quantity}</span></div><b>{money(p.price * c.quantity)}</b></article> : null; })}
      <form className="coupon-field" onSubmit={validateCoupon}><input placeholder="Code de réduction" aria-label="Code de réduction" maxLength={32} autoComplete="off" disabled={locked} value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setApplied(null); setCouponMessage(''); }}/><button type="submit" disabled={locked}>{couponBusy ? 'VÉRIFICATION…' : 'APPLIQUER'}</button></form>
      <p role="status">{applied && !validCoupon ? 'Votre panier a changé. Appliquez à nouveau le code.' : couponMessage}</p>
      {validCoupon && <button className="text-link remove-coupon" disabled={locked} onClick={() => { setApplied(null); setCoupon(''); setCouponMessage('Code retiré.'); }}>RETIRER LE CODE <X size={14}/></button>}
      <div className="summary-line"><span>Sous-total</span><span>{money(subtotal)}</span></div>{discount > 0 && <div className="summary-line"><span>Réduction</span><span>−{money(discount)}</span></div>}<div className="summary-line"><span>Livraison</span><span>{shipping ? money(shipping) : 'OFFERTE'}</span></div><div className="summary-total"><span>TOTAL TTC</span><strong>{money(total)}</strong></div>
    </aside></div>
  </section>;
}
