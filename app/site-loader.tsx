'use client';
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {brandMark} from '../lib/responsive-images';

export default function SiteLoader({children}:{children:ReactNode}){
  const [phase,setPhase]=useState<'loading'|'leaving'|'done'>('loading');
  const [exitMode,setExitMode]=useState<'curtain'|'quick'>('curtain');
  const [progress,setProgress]=useState<number|null>(null);
  const [hydrated,setHydrated]=useState(false);
  const content=useRef<HTMLDivElement>(null);
  const skip=useRef<HTMLButtonElement>(null);
  const dismiss=useRef(()=>{});

  useEffect(()=>{
    let alive=true,finished=false,waiting=false,frame=0,deadline=0,exit=0;
    let observer:MutationObserver|undefined;
    const listeners=new Set<()=>void>();
    const finish=(quick=false)=>{
      if(!alive||finished)return;
      finished=true;
      observer?.disconnect();
      cancelAnimationFrame(frame);clearTimeout(deadline);
      listeners.forEach(cleanup=>cleanup());listeners.clear();
      if(document.activeElement===skip.current)skip.current?.blur();
      const immediate=quick||matchMedia('(prefers-reduced-motion: reduce)').matches;
      setExitMode(immediate?'quick':'curtain');
      setProgress(1);
      setPhase('leaving');
      exit=window.setTimeout(()=>{if(alive)setPhase('done');},immediate?120:560);
    };
    dismiss.current=()=>finish(true);
    const waitForImage=(img:HTMLImageElement)=>new Promise<void>(resolve=>{
      let settled=false;
      const cleanup=()=>{img.removeEventListener('load',settle);img.removeEventListener('error',settle);};
      const settle=()=>{
        if(settled)return;settled=true;cleanup();listeners.delete(cleanup);
        // Failed artwork must never keep the storefront behind a loading screen.
        Promise.resolve().then(()=>img.naturalWidth&&img.decode?img.decode():undefined).catch(()=>{}).then(()=>resolve());
      };
      listeners.add(cleanup);
      img.addEventListener('load',settle,{once:true});img.addEventListener('error',settle,{once:true});
      if(img.complete)settle();
    });
    const check=()=>{
      frame=0;
      const page=content.current;
      if(!alive||finished||waiting||!page)return;
      if(!page.querySelector('main,.admin-gate'))return;
      const controls=page.querySelector('.storefront-controls');
      if(controls?.hasAttribute('disabled')||page.querySelector('main .deferred-loading'))return;
      waiting=true;
      const images=Array.from(page.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"],.site-header img,.admin-gate img')).filter(img=>{
        const box=img.getBoundingClientRect();
        return box.width>0&&box.height>0&&box.bottom>0&&box.top<window.innerHeight;
      });
      let complete=0;
      setProgress(images.length?0:1);
      Promise.all(images.map(img=>waitForImage(img).then(()=>{
        if(alive&&!finished)setProgress(++complete/images.length);
      }))).then(()=>{
        if(!alive||finished)return;
        // Allow decoded artwork and the now-interactive controls to paint first.
        frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>finish());});
      });
    };
    const queue=()=>{if(!frame&&!finished&&alive)frame=requestAnimationFrame(check);};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!finished){event.preventDefault();finish(true);}};
    const restored=(event:PageTransitionEvent)=>{if(event.persisted)finish(true);else queue();};
    const remaining=Math.max(0,4000-performance.now());
    if(remaining===0){finished=true;setPhase('done');}
    else{
      setHydrated(true);
      observer=new MutationObserver(queue);
      if(content.current)observer.observe(content.current,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-busy']});
      deadline=window.setTimeout(()=>finish(true),remaining);
      check();
      if(document.activeElement===document.body)skip.current?.focus({preventScroll:true});
    }
    document.addEventListener('keydown',keyboard);
    window.addEventListener('pageshow',restored);
    return()=>{
      alive=false;observer?.disconnect();cancelAnimationFrame(frame);clearTimeout(deadline);clearTimeout(exit);
      listeners.forEach(cleanup=>cleanup());listeners.clear();
      document.removeEventListener('keydown',keyboard);window.removeEventListener('pageshow',restored);
    };
  },[]);

  return <>
    {phase!=='done'&&<div className="site-loader" data-phase={phase} data-exit={exitMode} aria-label="Chargement de TREAU">
      <div className="site-loader-center">
        <div className="site-loader-brand" aria-hidden="true"><span className="site-loader-symbol"><img src={brandMark.medium} width="320" height="320" alt="" decoding="async"/></span><span className="site-loader-word">{Array.from('TREAU',(letter,index)=><span key={letter} data-letter={letter} style={{'--letter':index} as CSSProperties}><i>{letter}</i></span>)}</span></div>
        <p className="site-loader-motto" aria-hidden="true">MOVE DIFFERENT.</p>
        <div className="site-loader-meter" data-determinate={progress!==null} style={{'--loader-progress':progress??0} as CSSProperties} aria-hidden="true"><i/></div>
        <p className="site-loader-status" role="status" aria-live="polite">Chargement de TREAU…</p>
      </div>
      <div className="site-loader-bottom"><span aria-hidden="true">INDEPENDENT BY DESIGN.</span><button ref={skip} type="button" disabled={!hydrated} onClick={()=>dismiss.current()}>Passer <span aria-hidden="true">↗</span><span className="loader-sr-only"> l’écran de chargement</span></button></div>
    </div>}
    <div ref={content} className="site-content-root" inert={hydrated&&phase==='loading'} aria-busy={phase==='loading'}>{children}</div>
  </>;
}
