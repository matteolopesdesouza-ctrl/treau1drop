'use client';
import {useEffect} from 'react';
import {craftFrame,dampStoryProgress,storyProgress} from '../lib/product-motion';

type Scene={kind:string;order:number;top:number;height:number;progress?:number};

/** Cached geometry, visible artwork only, and no React state updates on scroll. */
export function useScrollScenes(path:string|null) {
  useEffect(()=>{
    const root=document.querySelector('main');
    if(!root||typeof IntersectionObserver==='undefined')return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const phone=matchMedia('(max-width: 700px)');
    const scenes=new Map<HTMLElement,Scene>();
    const active=new Set<HTMLElement>();
    let frame=0,measurement=0,discovery=0,lastTime=0,viewport=window.innerHeight,disposed=false;

    const render=(time:number)=>{
      frame=0;
      if(disposed||reduced.matches||document.hidden||document.body.style.position==='fixed'){lastTime=0;return;}
      const elapsed=lastTime?Math.min(64,time-lastTime):16.67;
      lastTime=time;
      let moving=false;
      const y=window.scrollY;
      active.forEach(el=>{
        const scene=scenes.get(el);
        if(!scene)return;
        const target=storyProgress(y,scene.top,scene.height,viewport);
        const progress=scene.progress===undefined||Math.abs(target-scene.progress)>.6?target:dampStoryProgress(scene.progress,target,elapsed);
        scene.progress=progress;
        if(progress!==target)moving=true;
        const values=craftFrame(scene.kind,progress,phone.matches,scene.order);
        for(const [key,value] of Object.entries(values)){
          const next=value.toFixed(4);
          if(el.style.getPropertyValue(key)!==next)el.style.setProperty(key,next);
        }
        if(!el.hasAttribute('data-craft-ready'))el.setAttribute('data-craft-ready','');
      });
      if(moving)frame=requestAnimationFrame(render);
      else lastTime=0;
    };
    const schedule=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(render);};
    const measure=()=>{
      measurement=0;
      if(disposed||document.body.style.position==='fixed')return;
      viewport=window.innerHeight;
      const y=window.scrollY;
      scenes.forEach((scene,el)=>{scene.top=el.getBoundingClientRect().top+y;scene.height=el.offsetHeight;});
      schedule();
    };
    const queueMeasure=()=>{if(!measurement&&!disposed)measurement=requestAnimationFrame(measure);};
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        const el=entry.target as HTMLElement;
        if(entry.isIntersecting){active.add(el);el.setAttribute('data-craft-active','');}
        else{active.delete(el);el.removeAttribute('data-craft-active');}
      }
      schedule();
    },{rootMargin:'100px 0px',threshold:0});
    const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(queueMeasure);
    const scan=()=>{
      discovery=0;
      for(const el of scenes.keys())if(!el.isConnected){observer.unobserve(el);resize?.unobserve(el);scenes.delete(el);active.delete(el);}
      root.querySelectorAll<HTMLElement>('[data-craft-scene]').forEach(el=>{
        if(scenes.has(el))return;
        scenes.set(el,{kind:el.dataset.craftScene||'',order:Number(el.dataset.craftOrder)||0,top:0,height:1});
        observer.observe(el);resize?.observe(el);
      });
      queueMeasure();
    };
    const mutation=new MutationObserver(()=>{if(!discovery&&!disposed)discovery=requestAnimationFrame(scan);});
    mutation.observe(root,{childList:true,subtree:true});
    resize?.observe(document.documentElement);
    const bodyChange=new MutationObserver(queueMeasure);
    bodyChange.observe(document.body,{attributes:true,attributeFilter:['style']});
    const preference=()=>{
      if(reduced.matches)scenes.forEach((scene,el)=>{el.removeAttribute('data-craft-ready');scene.progress=undefined;});
      lastTime=0;
      queueMeasure();
    };
    scan();
    document.fonts.ready.then(queueMeasure);
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',queueMeasure,{passive:true});
    window.addEventListener('pageshow',queueMeasure);
    document.addEventListener('visibilitychange',queueMeasure);
    reduced.addEventListener('change',preference);
    return()=>{
      disposed=true;
      cancelAnimationFrame(frame);cancelAnimationFrame(measurement);cancelAnimationFrame(discovery);
      observer.disconnect();resize?.disconnect();mutation.disconnect();bodyChange.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',queueMeasure);
      window.removeEventListener('pageshow',queueMeasure);document.removeEventListener('visibilitychange',queueMeasure);
      reduced.removeEventListener('change',preference);
      scenes.forEach((scene,el)=>{
        el.removeAttribute('data-craft-ready');el.removeAttribute('data-craft-active');
        Object.keys(craftFrame(scene.kind,0,false)).forEach(key=>el.style.removeProperty(key));
      });
    };
  },[path]);
}
