'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ChevronUp} from 'lucide-react';

type Chapter={id:string;label:string;description:string};
export default function StoryChapterMenu({chapters}:{chapters:Chapter[]}){
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(chapters[0]?.id||'drop');
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const key=chapters.map(chapter=>chapter.id).join('|');
  useEffect(()=>{
    const sections=key.split('|').map(id=>document.getElementById(id)).filter((el):el is HTMLElement=>!!el);
    const update=()=>{
      if(document.hidden)return;
      const line=window.innerHeight*.35;
      let selected=sections[0]?.id||'drop';
      for(const section of sections)if(section.getBoundingClientRect().top<=line)selected=section.id;
      setActive(previous=>previous===selected?previous:selected);
    };
    const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(update,{rootMargin:'-30% 0px -65% 0px',threshold:0});
    sections.forEach(section=>observer?.observe(section));
    const bar=root.current?.closest('[data-purchase-bar]');
    const visibility=new MutationObserver(()=>{if(bar?.getAttribute('data-visible')!=='true')setOpen(false);});
    if(bar)visibility.observe(bar,{attributes:true,attributeFilter:['data-visible']});
    update();
    window.addEventListener('resize',update,{passive:true});window.addEventListener('pageshow',update);document.addEventListener('visibilitychange',update);
    return()=>{observer?.disconnect();visibility.disconnect();window.removeEventListener('resize',update);window.removeEventListener('pageshow',update);document.removeEventListener('visibilitychange',update);};
  },[key]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:Event)=>{if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus({preventScroll:true});}};
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);document.addEventListener('keydown',keyboard);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',keyboard);};
  },[open]);
  const current=chapters.find(chapter=>chapter.id===active)||chapters[0];
  return <div className="story-chapter-menu" ref={root}>
    <button ref={trigger} className="story-chapter-trigger" type="button" aria-label="Explorer les chapitres de la collection" aria-expanded={open} aria-controls={open?'story-chapter-list':undefined} onClick={()=>setOpen(!open)}><span><small>EXPLORER</small><strong>{current?.label||'La collection'}</strong></span><ChevronUp size={17} aria-hidden="true"/></button>
    {open&&<nav className="story-chapter-popup" id="story-chapter-list" aria-label="Chapitres de la collection"><header><span>COLLECTION 001</span><p>À votre rythme.</p></header><ol>{chapters.map((chapter,index)=><li key={chapter.id}><a href={'#'+chapter.id} aria-current={active===chapter.id?'location':undefined} onClick={()=>setOpen(false)}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{chapter.label}</strong><small>{chapter.description}</small></div><ArrowUpRight size={18} aria-hidden="true"/></a></li>)}</ol><p className="story-chapter-hint">Explorez. Revenez. Faites votre choix.</p></nav>}
  </div>;
}
