'use client';
import OptimizedImage from './optimized-image';
import { useRef, useState } from 'react';
import { useProductMotion } from './use-product-motion';
import { ArrowDown } from 'lucide-react';
import DropGallery from './drop-gallery';
import './drop-studio.css';

const base='/images/drop-002/';
const pieces=[
  {id:'hoodie-liseres',name:'Hoodie à liserés',kind:'01 / HOODIE',description:'Noir, lignes grises et signature TREAU discrète. Une silhouette ample, vue de face et de dos.',views:[['Porté','look-ensemble.webp'],['Face','pullover-face.webp'],['Dos','pullover-dos.webp']]},
  {id:'hoodie-zippe',name:'Hoodie zippé',kind:'02 / ZIP HOODIE',description:'Une coupe boxy noire, deux poches devant et un zip argenté qui prolonge la ligne de la capuche.',views:[['Porté','look-zip.webp'],['Face','zip-face.webp']]},
  {id:'pantalon',name:'Pantalon à liserés',kind:'03 / PANTALON',description:'Le pantalon noir assorti : une jambe ample, des lignes grises et un petit marquage TREAU.',views:[['Porté','look-ensemble.webp']]},
];


function DropPiece({piece}:{piece:typeof pieces[number]}){
  const [view,setView]=useState(0),[gallery,setGallery]=useState(false);
  return <article className={'new-drop-piece '+(piece.id==='pantalon'?'is-pants':'')} id={piece.id}>
    <div className={'new-drop-piece-photo '+(piece.views[view][0]==='Porté'?'is-worn':'is-packshot')} data-craft-scene="photo"><div className="craft-photo-art"><OptimizedImage key={view} className="drop-photo-enter" src={base+piece.views[view][1]} alt={`${piece.name} TREAU — ${piece.views[view][0]}`} width="1024" height="1536" loading="lazy"/></div><button type="button" className="drop-expand" aria-label={'Agrandir '+piece.name+' — '+piece.views[view][0]} aria-haspopup="dialog" onClick={()=>setGallery(true)}><span>Voir en grand <span aria-hidden="true">↗</span></span></button></div>
    <div className="new-drop-piece-copy" data-story-reveal><p className="story-eyebrow">{piece.kind}</p><h2>{piece.name}</h2><p>{piece.description}</p>
      {piece.views.length>1&&<div className="drop-view-options" role="group" aria-label={'Vues du '+piece.name.toLowerCase()}>{piece.views.map(([label,src],i)=><button type="button" key={label} aria-pressed={view===i} onClick={()=>setView(i)}><OptimizedImage src={base+src} alt="" sizes="60px" loading="lazy"/><span>{label}</span></button>)}</div>}
      <p className="drop-coming">À VENIR <span>Prix et tailles à confirmer</span></p><a href="#newsletter" className="story-text-link">Être informé du lancement <ArrowDown size={17}/></a>
    </div>
    {gallery&&<DropGallery title={piece.name} views={piece.views.map(([label,src])=>({label,src:base+src}))} index={view} change={setView} close={()=>setGallery(false)} pants={piece.id==='pantalon'}/>}
  </article>;
}

export default function NewDrop(){const root=useRef<HTMLDivElement>(null);useProductMotion(root);return <div className="new-drop-page drop-studio" ref={root}>
  <section className="drop-film" data-story-scene="lookbook" data-pinned aria-labelledby="drop-film-title"><div className="drop-stage">
    <div className="drop-film-picture first" data-story-plane><OptimizedImage src={base+'look-ensemble.webp'} alt="Ensemble noir à liserés porté sur mannequin" width="1024" height="1536" fetchPriority="high"/></div>
    <div className="drop-film-picture second" data-story-plane><OptimizedImage src={base+'look-zip.webp'} alt="Hoodie noir zippé porté sur mannequin" width="1024" height="1536"/></div>
    <div className="drop-film-shade" aria-hidden="true"/>
    <div className="drop-studio-backdrop" aria-hidden="true"/>
    <div className="drop-studio-products" data-story-plane aria-hidden="true">
      <div className="studio-garment studio-pullover"><OptimizedImage src={base+'pullover-face.webp'} sizes="(max-width:700px) 90vw, 45vw" alt="" width="1000" height="1000" loading="lazy"/></div>
      <div className="studio-garment studio-zip"><OptimizedImage src={base+'zip-face.webp'} sizes="(max-width:700px) 90vw, 45vw" alt="" width="1000" height="1000" loading="lazy"/></div>
      <div className="studio-garment-labels"><span>01 / HOODIE À LISERÉS</span><span>02 / HOODIE ZIPPÉ</span></div>
    </div>
    <p className="drop-film-label">TREAU / DROP 002 / PREMIER REGARD</p>
    <div className="drop-film-title" data-story-plane><h1 id="drop-film-title">Le noir.<br/><span>En mouvement.</span></h1><p>Trois nouvelles pièces. Une même ligne.</p></div>
    <div className="drop-film-follow" data-story-plane><p>REGARDEZ DE PLUS PRÈS.</p><h2>La pièce.<br/>Dans le détail.</h2></div>
    <div className="drop-film-controls"><span>À venir · Date à confirmer.</span><a className="story-action" href="#nouvelles-pieces">Explorer les pièces <ArrowDown size={18}/></a></div>
    <div className="drop-film-progress" aria-hidden="true"><i/></div>
  </div></section>
  <div className="new-drop-lineup" id="nouvelles-pieces"><div className="new-drop-lineup-heading"><span className="story-eyebrow">LES NOUVELLES PIÈCES</span><p>Une collection à découvrir, bientôt à porter.</p></div>{pieces.map(piece=><DropPiece piece={piece} key={piece.id}/>)}</div>
  <p className="new-drop-note">Visuels portés générés à partir de vos références de vêtements. Présentation du prochain drop : prix, tailles, composition et date définitive à confirmer avant commercialisation.</p>
</div>;}
