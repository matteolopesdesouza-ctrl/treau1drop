'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import OptimizedImage from './optimized-image';
import Link from './navigation-link';
import {ArrowLeft,ArrowRight,Heart,Maximize2,Minus,Plus,X} from 'lucide-react';
import {Product,SiteSettings,COLORS,imageStyle,money} from '../lib/catalog';
import {availableToAdd} from '../lib/storefront-state';
import {useDialog} from './use-dialog';
import {productPhotos} from '../lib/product-gallery';
import type {CartItem} from './storefront';
import './product-detail.css';

export default function ProductDetail({p,cart,add,favorite,wished,related,settings}:{
  p:Product;cart:CartItem[];add:(p:Product,s:string,c:string,q?:number)=>void;
  favorite:()=>void;wished:boolean;related:ReactNode;settings:SiteSettings;
}) {
  const [size,setSize]=useState(p.sizes.length===1?p.sizes[0]:'');
  const [color,setColor]=useState(p.colors[0]);
  const [error,setError]=useState('');
  const [guide,setGuide]=useState(false);
  const [quantity,setQuantity]=useState(1);
  const [photoOpen,setPhotoOpen]=useState(false);
  const [photoIndex,setPhotoIndex]=useState(0);
  const photoIndexRef=useRef(0);
  const photos=useMemo(()=>productPhotos(p),[p.image,p.images]);
  const photoTrack=useRef<HTMLDivElement>(null);
  const [magnified,setMagnified]=useState(false);
  const [purchaseVisible,setPurchaseVisible]=useState(true);
  const [pieceVisible,setPieceVisible]=useState(false);
  const [photoNavigationVisible,setPhotoNavigationVisible]=useState(false);
  const purchase=useRef<HTMLButtonElement>(null);
  const piece=useRef<HTMLDivElement>(null);
  const sizeSection=useRef<HTMLDivElement>(null);
  const photoStage=useRef<HTMLDivElement>(null);
  const photoNavigation=useRef<HTMLElement>(null);
  const stock=availableToAdd(p,cart,color,size);
  const remaining=(s:string)=>availableToAdd(p,cart,color,s);
  const soldOut=p.status!=='Published'||!p.variants.some(v=>v.stock>0);
  const unavailable=!!size&&stock===0;

  useDialog(photoOpen?'product-photo':null,()=>setPhotoOpen(false),'[data-product-photo]');
  useEffect(()=>{
    if(typeof IntersectionObserver==='undefined')return;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.target===purchase.current)setPurchaseVisible(entry.isIntersecting);
      if(entry.target===piece.current)setPieceVisible(entry.isIntersecting);
      if(entry.target===photoNavigation.current)setPhotoNavigationVisible(entry.isIntersecting);
    }));
    if(purchase.current)observer.observe(purchase.current);
    if(piece.current)observer.observe(piece.current);
    if(photoNavigation.current)observer.observe(photoNavigation.current);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!photoOpen)return;
    const frame=requestAnimationFrame(()=>{
      const view=photoStage.current;
      if(view)view.scrollTo({left:(view.scrollWidth-view.clientWidth)/2,top:(view.scrollHeight-view.clientHeight)/2,behavior:'instant'});
    });
    return()=>cancelAnimationFrame(frame);
  },[photoOpen,magnified,photoIndex]);
  useEffect(()=>{
    const track=photoTrack.current;
    if(!track)return;
    let width=track.clientWidth;
    const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{
      if(track.clientWidth===width)return;
      width=track.clientWidth;track.scrollTo({left:width*photoIndexRef.current,behavior:'instant'});
    });
    resize?.observe(track);
    return()=>resize?.disconnect();
  },[]);
  useEffect(()=>{
    if(!photoOpen||magnified)return;
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndexRef.current+(event.key==='ArrowRight'?1:-1),true);}
    };
    document.addEventListener('keydown',keyboard);
    return()=>document.removeEventListener('keydown',keyboard);
  },[photoOpen,magnified,photos.length]);
  function showPhoto(index:number,immediate=false){
    const next=Math.max(0,Math.min(photos.length-1,index));
    const track=photoTrack.current;
    if(!track)return;
    track.scrollTo({left:track.clientWidth*next,behavior:immediate||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function updatePhoto(){
    const track=photoTrack.current;
    if(!track)return;
    const next=Math.max(0,Math.min(photos.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));
    if(next!==photoIndexRef.current){photoIndexRef.current=next;setPhotoIndex(next);}
  }

  function chooseSize() {
    const target=sizeSection.current;
    target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    target?.querySelector<HTMLButtonElement>('button[data-size]:not(:disabled)')?.focus({preventScroll:true});
  }
  function submit() {
    if(!size){setError('Sélectionnez votre taille pour continuer.');chooseSize();return;}
    if(quantity>stock){setError('Cette quantité n’est plus disponible.');return;}
    setError('');
    add(p,size,color,quantity);
  }
  function selectColor(c:string) {
    setColor(c);setSize(p.sizes.length===1?p.sizes[0]:'');setQuantity(1);setError('');
  }

  return <div className="product-page">
    <div className="pdp-main" ref={piece}>
      <div className="pdp-gallery">
        <div className="pdp-shot pdp-gallery-shot">
          <div className="pdp-photo-track" id="product-photos" ref={photoTrack} onScroll={updatePhoto} tabIndex={0} role="group" aria-label={'Photos de '+p.name} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowRight'?1:-1));}}}>
            {photos.map((src,index)=><figure className="pdp-photo-slide" key={src} aria-hidden={index!==photoIndex}><OptimizedImage src={src} fetchPriority={index===0?'high':'auto'} loading={index===0?'eager':'lazy'} width="1000" height="1000" sizes="(max-width: 700px) 100vw, 58vw" style={index===0?imageStyle(p,color):undefined} alt={index===0?p.name+' — '+color:p.name+' — photo de collection '+(index+1)}/></figure>)}
          </div>
          <span className="pdp-photo-count" role="status" aria-live="polite" aria-atomic="true">PHOTO {String(photoIndex+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span>
          <button type="button" className="pdp-image-open" aria-label={'Agrandir la photo '+(photoIndex+1)+' de '+p.name} aria-haspopup="dialog" onClick={()=>{setMagnified(false);setPhotoOpen(true);}}>
            <span><Maximize2 size={15}/>Agrandir la photo</span>
          </button>
          {photos.length>1&&<div className="pdp-photo-arrows"><button type="button" aria-label="Photo précédente" disabled={photoIndex===0} onClick={()=>showPhoto(photoIndex-1)}><ArrowLeft size={18}/></button><button type="button" aria-label="Photo suivante" disabled={photoIndex===photos.length-1} onClick={()=>showPhoto(photoIndex+1)}><ArrowRight size={18}/></button></div>}
        </div>
        {photos.length>1&&<nav ref={photoNavigation} className="pdp-photo-nav" aria-label="Choisir une photo du vêtement"><p>LA PIÈCE EN IMAGES.<span>Faites glisser pour découvrir.</span></p><div>{photos.map((src,index)=><button type="button" key={src} aria-label={'Voir la photo '+(index+1)} aria-pressed={photoIndex===index} aria-controls="product-photos" onClick={()=>showPhoto(index)}><OptimizedImage src={src} sizes="64px" width="100" height="100" loading="lazy" style={index===0?imageStyle(p,color):undefined} alt=""/><span>{String(index+1).padStart(2,'0')}</span></button>)}</div></nav>}
      </div>
      <div className="pdp-details">
        <Link href="/shop" className="eyebrow back"><ArrowLeft size={13}/> RETOUR À LA COLLECTION</Link>
        <div className="pdp-topline"><span className="eyebrow">{p.collection} / 001</span><button type="button" aria-label={wished?'Retirer des favoris':'Sauvegarder la pièce'} aria-pressed={wished} onClick={favorite}><Heart fill={wished?'currentColor':'none'} size={20}/></button></div>
        <h1>{p.name}</h1>
        <p className="pdp-price">{money(p.price)}<span>TTC</span></p>
        <div className="pdp-piece-notes"><span>Coupe oversize</span><span>Unisexe</span><span>{p.gsm} GSM</span></div>
        <p className="pdp-description">{p.description}</p>
        <div className="pdp-option"><span>COULEUR : {color.toUpperCase()}</span><div className="color-options">{p.colors.map(c=><button type="button" key={c} className={c===color?'active':''} style={{background:COLORS[c]||c}} onClick={()=>selectColor(c)} aria-label={c} aria-pressed={color===c}/>)}</div></div>
        <div className="pdp-size-section" ref={sizeSection}>
          <div className="size-heading"><span>{size?'VOTRE TAILLE : '+size:'CHOISIR LA TAILLE'}</span><button type="button" onClick={()=>setGuide(!guide)} className="underlined" aria-expanded={guide} aria-controls="product-size-guide">Guide des tailles ↗</button></div>
          {error&&<p className="form-error" id="product-size-error" role="alert">{error}</p>}
          <div className="size-options" role="group" aria-label="Choisir la taille" aria-describedby={error?'product-size-error':undefined}>{p.sizes.map(s=>{
            const available=remaining(s)>0;
            return <button type="button" key={s} data-size disabled={!available} onClick={()=>{setSize(s);setQuantity(1);setError('');}} aria-pressed={size===s} className={size===s?'active':''}>{s}</button>;
          })}</div>
          {guide&&<div className="size-guide" id="product-size-guide"><p>Coupe ample. Prenez votre taille habituelle.</p><table><thead><tr><th>CM</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th></tr></thead><tbody><tr><th>Poitrine</th>{[58,61,64,67,70].map(n=><td key={n}>{n}</td>)}</tr><tr><th>Longueur</th>{[65,68,71,74,77].map(n=><td key={n}>{n}</td>)}</tr></tbody></table><small>Mesures de concept à confirmer avant commercialisation.</small></div>}
        </div>
        <div className="pdp-quantity"><span>QUANTITÉ</span><div className="quantity"><button type="button" disabled={quantity<=1} aria-label="Diminuer la quantité" onClick={()=>setQuantity(quantity-1)}><Minus size={13}/></button><span>{quantity}</span><button type="button" disabled={!size||quantity>=stock} aria-label="Augmenter la quantité" onClick={()=>setQuantity(quantity+1)}><Plus size={13}/></button></div></div>
        <button ref={purchase} type="button" className="button dark add-to-cart" disabled={soldOut||unavailable} onClick={submit}>{soldOut?'ÉPUISÉ':unavailable?'TAILLE INDISPONIBLE':'AJOUTER AU PANIER — '+money(p.price*quantity)}<Plus size={20}/></button>
        <p className="pdp-stock" role="status"><i/>{size?(stock>0?`${stock} pièces disponibles`:'Cette taille est indisponible ou déjà dans votre panier.'):'Sélectionnez une taille'}<span>Livraison offerte dès {money(settings.shippingThreshold)}</span></p>
        <div className="pdp-accordions">{[
          ['DESCRIPTION & COMPOSITION',p.composition],
          ['LIVRAISON & RETOURS','En préouverture : aucune expédition réelle pour les commandes de démonstration. Les conditions définitives seront publiées lors du lancement.'],
          ['ENTRETIEN','Lavage à 30 °C sur l’envers. Séchage à l’air libre. Ne pas repasser directement sur la broderie.'],
          ['LA PIÈCE EN DÉTAIL',`${p.gsm} GSM. Coupe oversize unisexe. Référence ${p.sku}. Visuel de concept.`]
        ].map(([t,d])=><details key={t}><summary>{t}<Plus size={15}/></summary><p>{d}</p></details>)}</div>
      </div>
    </div>
    {!purchaseVisible&&pieceVisible&&!photoNavigationVisible&&!photoOpen&&<div className="pdp-purchase-dock" role="region" aria-label="Achat rapide">
      <div className="pdp-dock-piece"><strong>{p.name}</strong><span>{color}{size?' / '+size:''}{quantity>1?' · Qté '+quantity:''}<b>{money(p.price*quantity)}</b></span></div>
      <button type="button" className="button dark" disabled={soldOut} onClick={!size||unavailable?chooseSize:submit}>{soldOut?'ÉPUISÉ':!size||unavailable?'CHOISIR MA TAILLE':'AJOUTER AU PANIER'}<ArrowRight size={18}/></button>
    </div>}
    <section className="section-pad"><div className="section-heading"><h2>À PORTER<br/><span className="serif">À VOTRE FAÇON.</span></h2><span className="eyebrow">LA SÉLECTION TREAU</span></div><div className="home-products">{related}</div></section>
    {photoOpen&&createPortal(<div className="modal-shell product-zoom-shell">
      <button type="button" className="modal-backdrop" aria-label="Fermer la photo" tabIndex={-1} onClick={()=>setPhotoOpen(false)}/>
      <section className="product-zoom" role="dialog" aria-modal="true" aria-label={'Photo de '+p.name} tabIndex={-1} data-product-photo>
        <header className="product-zoom-header"><div><strong>{p.name}</strong><span>{photoIndex===0?color:'Vue de collection'} / Photo {photoIndex+1} sur {photos.length}</span></div><button type="button" className="product-zoom-toggle" aria-label={magnified?'Revenir à la vue entière':'Voir les détails de la photo'} aria-pressed={magnified} onClick={()=>setMagnified(!magnified)}>{magnified?<Minus size={17}/>:<Plus size={17}/>}<span>{magnified?'Vue entière':'Voir les détails'}</span></button><button type="button" className="product-zoom-close" aria-label="Fermer la photo" onClick={()=>setPhotoOpen(false)}><X size={24}/></button></header>
        <div ref={photoStage} className={'product-zoom-stage'+(magnified?' is-magnified':'')} tabIndex={0} role="region" aria-label="Photo agrandie, faites défiler pour explorer les détails"><div className="product-zoom-canvas"><OptimizedImage src={photos[photoIndex]} sizes={magnified?'200vw':'100vw'} style={photoIndex===0?imageStyle(p,color):undefined} width="1000" height="1000" alt={p.name+' — photo '+(photoIndex+1)}/></div></div>
        <div className="product-zoom-caption"><p>{magnified?'Faites défiler pour explorer les détails.':'Chaque détail compte.'}</p>{photos.length>1&&<div className="product-zoom-pages"><button type="button" aria-label="Photo précédente" disabled={photoIndex===0} onClick={()=>showPhoto(photoIndex-1,true)}><ArrowLeft size={18}/></button><span aria-live="polite">{photoIndex+1} / {photos.length}</span><button type="button" aria-label="Photo suivante" disabled={photoIndex===photos.length-1} onClick={()=>showPhoto(photoIndex+1,true)}><ArrowRight size={18}/></button></div>}<span>VISUEL DE CONCEPT / TREAU</span></div>
      </section>
    </div>,document.body)}
  </div>;
}
