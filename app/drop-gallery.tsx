'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,ArrowRight,Expand,RotateCcw,X} from 'lucide-react';
import OptimizedImage from './optimized-image';
import {useDialog} from './use-dialog';

type View={label:string;src:string};

function GalleryPhoto({view,title,pants}:{view:View;title:string;pants:boolean}){
  const [state,setState]=useState<'loading'|'ready'|'failed'>('loading');
  const [retry,setRetry]=useState(0);
  return <div className={'drop-gallery-photo'+(pants?' is-pants':'')}>
    <OptimizedImage key={retry} src={view.src} sizes="100vw" alt={title+' — '+view.label} width="1000" height="1000" onLoad={()=>setState('ready')} onError={()=>setState('failed')} className={state==='ready'?'is-ready':''}/>
    {state==='loading'&&<div className="drop-gallery-loading" role="status"><span/>Chargement de la photo…</div>}
    {state==='failed'&&<div className="drop-gallery-error" role="alert"><p>La photo n’a pas pu être chargée.</p><button type="button" onClick={()=>{setState('loading');setRetry(retry+1);}}><RotateCcw size={16}/>Réessayer</button></div>}
  </div>;
}

export default function DropGallery({title,views,index,change,close,pants=false}:{title:string;views:View[];index:number;change:(index:number)=>void;close:()=>void;pants?:boolean}){
  const changeRef=useRef(change);changeRef.current=change;
  const indexRef=useRef(index);indexRef.current=index;
  const touch=useRef<{x:number;y:number}|null>(null);
  const move=(direction:number)=>change((index+direction+views.length)%views.length);
  useDialog('drop-gallery',close,'[data-drop-gallery]');
  useEffect(()=>{
    const keyboard=(event:KeyboardEvent)=>{
      if(views.length<2||event.altKey||event.ctrlKey||event.metaKey)return;
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
        event.preventDefault();changeRef.current((indexRef.current+(event.key==='ArrowRight'?1:-1)+views.length)%views.length);
      }
    };
    document.addEventListener('keydown',keyboard);
    return()=>document.removeEventListener('keydown',keyboard);
  },[views.length]);
  return createPortal(<div className="modal-shell drop-gallery-shell">
    <button type="button" className="modal-backdrop" aria-label="Fermer la galerie" tabIndex={-1} onClick={close}/>
    <section className="drop-gallery" role="dialog" aria-modal="true" aria-label={'Galerie '+title} tabIndex={-1} data-drop-gallery>
      <header><div><span>TREAU / DROP 002</span><h2>{title}</h2></div><button type="button" aria-label="Fermer la galerie" onClick={close}><X size={23}/></button></header>
      <div className="drop-gallery-stage" onTouchStart={event=>{touch.current=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;}} onTouchEnd={event=>{
        const start=touch.current;touch.current=null;
        if(!start||views.length<2||!event.changedTouches.length)return;
        const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;
        if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);
      }}>
        <GalleryPhoto key={index} view={views[index]} title={title} pants={pants}/>
        {views.length>1&&<><button type="button" className="drop-gallery-prev" aria-label="Photo précédente" onClick={()=>move(-1)}><ArrowLeft size={21}/></button><button type="button" className="drop-gallery-next" aria-label="Photo suivante" onClick={()=>move(1)}><ArrowRight size={21}/></button></>}
      </div>
      <footer><p role="status" aria-live="polite"><strong>{views[index].label}</strong><span>{String(index+1).padStart(2,'0')} / {String(views.length).padStart(2,'0')}</span></p><div className="drop-gallery-thumbs" role="group" aria-label="Choisir une photo">{views.map((view,i)=><button type="button" key={view.src} aria-label={'Voir la photo '+view.label} aria-pressed={index===i} onClick={()=>change(i)}><OptimizedImage src={view.src} alt="" sizes="60px"/><span>{view.label}</span></button>)}</div>{views.length>1&&<small><Expand size={12}/> Faites glisser ou utilisez les flèches pour explorer.</small>}</footer>
    </section>
  </div>,document.body);
}
