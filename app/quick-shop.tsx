'use client';
import OptimizedImage from './optimized-image';
import { FormEvent, useRef, useState } from 'react';
import Link from './navigation-link';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { COLORS, Product, imageStyle, money } from '../lib/catalog';
import { availableToAdd } from '../lib/storefront-state';

type CartLine = { id: string; size: string; color: string; quantity: number };
export default function QuickShop({ product, cart, add, close }: {
  product: Product;
  cart: CartLine[];
  close: () => void;
  add: (product: Product, size: string, color: string, quantity: number) => void;
}) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const sizes = useRef<HTMLFieldSetElement>(null);
  const available = (s: string, c = color) => availableToAdd(product, cart, c, s);
  const stock = size ? available(size) : 0;
  const availableColor = product.status==='Published'&&product.sizes.some(s=>available(s)>0);
  const needsSize = !size||!stock;
  function chooseSize(){
    sizes.current?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    sizes.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({preventScroll:true});
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!size) { setError('Choisissez votre taille pour continuer.');chooseSize();return; }
    if (!stock || product.status !== 'Published') { setError('Cette taille n’est plus disponible.');chooseSize();return; }
    if (quantity > stock) { setError('Cette quantité n’est plus disponible. Réduisez-la pour continuer.'); return; }
    add(product, size, color, quantity);
  }
  return <form className="quick-shop-form" onSubmit={submit}>
    <div className="quick-shop-scroll">
    <div className="quick-shop-image"><OptimizedImage src={product.image} style={imageStyle(product, color)} alt={`${product.name} — ${color}`} /></div>
    <div className="quick-shop-body"><span className="section-kicker">{product.collection}</span>
      <div className="quick-shop-title"><h2>{product.name}</h2><strong>{money(product.price)}</strong></div>
      <p>Une coupe ample. Votre taille habituelle pour un volume oversize.</p>
      <fieldset className="quick-shop-colors"><legend>Couleur : {color}</legend><div>{product.colors.map(c => <button type="button" key={c}
        onClick={() => { if(c===color)return;setColor(c); setSize(product.sizes.length === 1 ? product.sizes[0] : ''); setQuantity(1); setError(''); }}
        aria-pressed={color === c} className={color === c ? 'selected' : ''}><i style={{ background: COLORS[c] || '#777' }} />{c}</button>)}</div></fieldset>
      <fieldset ref={sizes} className="quick-shop-sizes" aria-describedby={error?'quick-size-error':'quick-size-hint'}><legend>Votre taille{size&&<span className="quick-size-selected">{size}</span>}</legend><div>{product.sizes.map(s => <button type="button" key={s}
        disabled={available(s) < 1} aria-pressed={size === s} className={size === s ? 'selected' : ''}
        onClick={() => { setSize(s); setQuantity(1); setError(''); }}>{s}</button>)}</div></fieldset>
      {error?<p className="quick-shop-error" id="quick-size-error" role="alert">{error}</p>:<p className="quick-size-hint" id="quick-size-hint">{size&&stock?'Disponible dans votre taille.':'Les tailles barrées sont indisponibles.'}</p>}
      <div className="quick-shop-quantity"><span>Quantité</span><div className="quantity"><button type="button" disabled={quantity <= 1} aria-label="Diminuer la quantité" onClick={() => setQuantity(quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button type="button" disabled={!size || quantity >= stock} aria-label="Augmenter la quantité" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div></div>
      <Link href={`/product/${product.slug}`} className="quick-shop-details" onClick={close}>Tous les détails de la pièce<ArrowRight size={17} /></Link>
    </div>
    </div>
    <div className="quick-shop-purchase"><p role="status" aria-live="polite">{color}<span>{size?'Taille '+size:'Choisissez votre taille'}{quantity>1?' · Qté '+quantity:''}</span></p><button className="campaign-cta cta-black quick-shop-submit" type="submit" disabled={!availableColor}>{!availableColor?'TAILLES INDISPONIBLES':needsSize?'CHOISIR MA TAILLE':'AJOUTER AU PANIER'}{availableColor&&' — '+money(product.price*quantity)}{needsSize?<ArrowRight size={20}/>:<Plus size={20}/>}</button></div>
  </form>;
}
