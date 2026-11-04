'use client';
import OptimizedImage from './optimized-image';
import Link from './navigation-link';
import {ArrowUpRight} from 'lucide-react';
const base='/images/drop-002/';
export function NewDropPreview({compact=false}:{compact?:boolean}) {
  return <section className={'next-drop-preview'+(compact?' is-compact':'')} aria-labelledby={compact?'shop-next-title':'home-next-title'}>
    <div className="next-drop-preview-copy"><p className="story-eyebrow">PREMIER REGARD / DROP 002</p><h2 id={compact?'shop-next-title':'home-next-title'}>Le noir.<br/><span>En mouvement.</span></h2><p>Hoodie à liserés. Zip argenté. Pantalon assorti.<br/>Les nouvelles silhouettes TREAU se dévoilent.</p><Link href="/new-drop" className="story-action">Découvrir les nouvelles pièces <ArrowUpRight size={18}/></Link><small>À venir · Prix, tailles et date à confirmer.</small></div>
    <Link href="/new-drop" className="next-drop-preview-image" data-craft-scene="photo" aria-label="Découvrir le nouveau drop TREAU"><div className="craft-photo-art"><OptimizedImage src={base+'look-ensemble.webp'} alt="Mannequin portant l’ensemble noir TREAU à liserés gris" width="1024" height="1536" loading="lazy"/></div></Link>
    {!compact&&<Link href="/new-drop#hoodie-zippe" className="next-drop-preview-image second-look" data-craft-scene="photo" aria-label="Découvrir le nouveau hoodie zippé"><div className="craft-photo-art"><OptimizedImage src={base+'look-zip.webp'} alt="Mannequin portant le nouveau hoodie zippé noir TREAU" width="1024" height="1536" loading="lazy"/></div></Link>}
  </section>;
}

