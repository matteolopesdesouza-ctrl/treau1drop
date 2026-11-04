'use client';
import {useRef,useState,type FormEvent} from 'react';
import {ArrowRight,ArrowUpRight,Search,X} from 'lucide-react';
import type {Product} from '../lib/catalog';
import {imageStyle,money} from '../lib/catalog';
import {matchesSearch} from '../lib/storefront-state';
import OptimizedImage from './optimized-image';
import Link from './navigation-link';

export default function SearchPanel({products,collections,close}:{products:Product[];collections:string[];close:()=>void}){
  const [query,setQuery]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const results=useRef<HTMLDivElement>(null);
  const term=query.trim();
  const pieces=products.filter(p=>p.status!=='Draft'&&matchesSearch(p,term));
  const choose=(value:string)=>{setQuery(value);input.current?.focus({preventScroll:true});};
  function submit(event:FormEvent){
    event.preventDefault();
    input.current?.blur();
    results.current?.focus({preventScroll:true});
    results.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return <div className="treau-search">
    <div className="treau-search-intro"><span className="eyebrow">TROUVEZ VOTRE MOUVEMENT.</span><h2>La bonne pièce.<br/><span>À votre façon.</span></h2></div>
    <form role="search" onSubmit={submit} className="treau-search-form">
      <label className="search-input treau-search-input"><Search size={24} aria-hidden="true"/><span className="shop-sr-only">Rechercher dans le catalogue</span><input ref={input} type="search" enterKeyHint="search" maxLength={120} placeholder="Sweat noir, t-shirt blanc…" value={query} onChange={event=>setQuery(event.target.value)} aria-label="Rechercher dans le catalogue" autoComplete="off" spellCheck={false}/>{query&&<button type="button" aria-label="Effacer la recherche" onClick={()=>choose('')}><X size={20}/></button>}</label>
      <button type="submit" tabIndex={-1} className="shop-sr-only">Afficher les résultats</button>
    </form>
    <div className="treau-search-shortcuts" role="group" aria-label="Idées de recherche">{[['Noir','Noir'],['Blanc','Blanc'],['Sweats','Sweat'],['T-shirts','Tshirt']].map(([label,value])=><button type="button" key={value} aria-pressed={query===value} onClick={()=>choose(value)}>{label}<ArrowUpRight size={13} aria-hidden="true"/></button>)}</div>
    <div className="treau-search-selection" ref={results} tabIndex={-1} role="region" aria-label="Résultats de recherche">
      <div className="treau-search-summary"><span>{term?'VOTRE SÉLECTION':'LES ESSENTIELS TREAU'}</span><p role="status" aria-live="polite" aria-atomic="true">{pieces.length} pièce{pieces.length!==1?'s':''}{term?' pour « '+term+' »':' à découvrir'}</p></div>
      {pieces.length?<div className="treau-search-grid">{pieces.map((p,index)=>{
        const available=p.status==='Published'&&p.variants.some(v=>v.stock>0);
        return <Link href={'/product/'+p.slug} onClick={close} className="treau-search-piece" key={p.id} style={{animationDelay:Math.min(index,5)*25+'ms'}}>
          <div className="treau-search-photo"><OptimizedImage src={p.image} style={imageStyle(p)} sizes="(max-width: 700px) 110px, 160px" width="600" height="600" alt={p.name+' — '+p.colors[0]}/></div>
          <div className="treau-search-piece-copy"><span className="treau-search-collection">{p.collection}</span><h3>{p.name}</h3><span className="treau-search-color">{p.colors.join(' · ')}</span><strong>{money(p.price)}</strong><small data-available={available}>{available?'Disponible':'Épuisé'}</small></div><ArrowUpRight className="treau-search-arrow" size={19} aria-hidden="true"/>
        </Link>;
      })}</div>:<div className="treau-search-empty"><span aria-hidden="true">↗</span><h3>Pas encore<br/>la bonne pièce.</h3><p>Essayez un nom plus court ou une autre couleur.</p><button type="button" className="text-link" onClick={()=>choose('')}>Voir toutes les pièces<ArrowRight size={17}/></button></div>}
    </div>
    {collections.length>0&&<nav className="treau-search-worlds" aria-label="Explorer les collections"><span className="eyebrow">EXPLORER NOS COLLECTIONS</span><div>{collections.map(collection=><Link key={collection} href={'/shop?collection='+encodeURIComponent(collection)} onClick={close}>{collection}<ArrowUpRight size={14} aria-hidden="true"/></Link>)}</div></nav>}
  </div>;
}
