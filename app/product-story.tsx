'use client';
import OptimizedImage from './optimized-image';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import Link from './navigation-link';
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Product, SiteSettings, COLORS, imageStyle, money, prioritizeNeutralProducts } from '../lib/catalog';
import { CollectionProduct } from './collection-product';
import { useProductMotion } from './use-product-motion';
import { NewDropPreview } from './new-drop-preview';
import StoryChapterMenu from './story-chapter-menu';

type Props = {
  products: Product[];
  settings: SiteSettings;
  wishlist: string[];
  favorite: (id: string) => void;
  quickShop: (product: Product) => void;
};

function ProductLineup({ products, wishlist, favorite, quickShop }: Omit<Props, 'settings'>) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const update = () => {
      const start = node.scrollLeft < 8, end = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      const range = node.scrollWidth - node.clientWidth;
      node.parentElement?.style.setProperty('--gallery-progress', String(range > 0 ? Math.max(0,Math.min(1,node.scrollLeft/range)) : 1));
      setEdge(previous => previous.start === start && previous.end === end ? previous : { start, end });
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener('scroll', update); };
  }, [products]);
  const move = (direction: number) => {
    const node = track.current;
    if (!node) return;
    const card = node.firstElementChild as HTMLElement | null;
    node.scrollBy({ left: direction * ((card?.offsetWidth || 300) + 24), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <section className="story-lineup" id="drop" aria-labelledby="lineup-title">
    <div className="story-section-title" data-story-reveal>
      <div><p className="story-eyebrow">COLLECTION 001</p><h2 id="lineup-title">Votre prochaine<br /><span>pièce préférée.</span></h2></div>
      <Link href="/shop" className="story-text-link">Toute la collection <ArrowUpRight size={19} /></Link>
    </div>
    <div className="story-lineup-track" ref={track} tabIndex={0} aria-label="Les pièces TREAU, galerie à faire défiler" onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
      {products.map((p, i) => <CollectionProduct key={p.id} product={p} index={i} wished={wishlist.includes(p.id)} onWish={() => favorite(p.id)} onQuickShop={() => quickShop(p)} />)}
    </div>
    <div className="story-lineup-footer"><p>La bonne pièce. À votre façon.<span className="story-gallery-meter" aria-hidden="true"><i /></span></p><div><button type="button" aria-label="Voir les pièces précédentes" disabled={edge.start} onClick={() => move(-1)}><ChevronLeft size={21} /></button><button type="button" aria-label="Voir les pièces suivantes" disabled={edge.end} onClick={() => move(1)}><ChevronRight size={21} /></button></div></div>
  </section>;
}

function ColorStudio({ products, quickShop }: { products: Product[]; quickShop: Props['quickShop'] }) {
  const [selected, setSelected] = useState(0);
  const tones = prioritizeNeutralProducts(products.filter(p => p.category === 'HOODIES'));
  if (!tones.length) return null;
  const selectedIndex = Math.min(selected, tones.length - 1);
  const product = tones[selectedIndex];
  return <section className="story-color" id="nuances" data-story-scene="color" data-pinned aria-labelledby="color-title">
    <div className="story-color-stage">
    <div className="story-color-intro" data-story-reveal>
      <p className="story-eyebrow">À CHACUN SA NUANCE.</p>
      <h2 id="color-title">Le bon ton.<br /><span>Le vôtre.</span></h2>
      <p>Le noir, intemporel. Le blanc, essentiel. Des volumes libres, à porter à votre façon.</p>
    </div>
    <div className="story-color-art">
      <span className="story-color-word" aria-hidden="true">{product.colors[0]}</span>
      <div className="story-color-pieces">{tones.map((p, i) => {
        const position = (i - selectedIndex + tones.length) % tones.length;
        const slot = position > (tones.length - 1) / 2 ? position - tones.length : position;
        return <div key={p.id} className={`story-color-piece${i === selectedIndex ? ' is-selected' : ''}`} data-story-plane style={{ '--tone-slot': slot, '--tone-distance': Math.abs(slot), zIndex: i === selectedIndex ? 3 : 1 } as CSSProperties}><OptimizedImage src={p.image} alt={i === selectedIndex ? `${p.name}, ${p.colors[0]}` : ''} aria-hidden={i !== selectedIndex} style={imageStyle(p)} width="1000" height="1000" loading="lazy" /></div>;
      })}</div>
      <span className="story-color-art-label">TROIS NUANCES. VOTRE SIGNATURE.<i aria-hidden="true" /></span>
    </div>
    <div className="story-color-copy">
      <div className="story-tone-options" role="group" aria-label="Choisir une couleur de hoodie">{tones.map((p, i) => <button type="button" key={p.id} onClick={() => setSelected(i)} aria-pressed={i === selectedIndex} aria-label={`Voir le hoodie ${p.colors[0]}`}><span style={{ background: COLORS[p.colors[0]] || '#888' }}>{i === selectedIndex && <Check size={15} color={p.colors[0] === 'Craie' || p.colors[0] === 'Blanc' ? '#111' : '#fff'} />}</span><small>{p.colors[0]}</small></button>)}</div>
      <div className="story-color-product" aria-live="polite"><span>{product.name}</span><strong>{money(product.price)}</strong></div>
      <button type="button" className="story-action" onClick={() => quickShop(product)}>Choisir ma taille <Plus size={19} /></button>
      <Link href={`/product/${product.slug}`} className="story-text-link">Voir la pièce en détail <ArrowUpRight size={17} /></Link>
    </div>
    </div>
  </section>;
}

export default function ProductStory({ products, settings, wishlist, favorite, quickShop }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useProductMotion(root);
  const ordered = prioritizeNeutralProducts(products);
  const signature = ordered.find(p => p.slug === 'midnight-hoodie') || ordered[0];
  const white = ordered.find(p => p.colors.includes('Blanc'));
  const lookbook = settings.lookbook[0] && settings.lookbook[0] !== '/images/campaign.webp' ? settings.lookbook[0] : '/images/campaign-night.webp';
  const headline = settings.heroSubtitle.trim() === 'MOVE DIFFERENT.' ? ['Noir.', 'Blanc.'] : [settings.heroSubtitle.trim().split(/\s+/)[0], settings.heroSubtitle.trim().split(/\s+/).slice(1).join(' ')];
  if (!signature) return <div className="empty-state"><h1>Le prochain mouvement arrive.</h1><Link href="/shop">Découvrir TREAU</Link></div>;
  const buy = () => quickShop(signature);
  const chapters=[
    ...(settings.sections.manifesto?[{id:'signature',label:'La signature',description:'L’attitude TREAU.'}]:[]),
    ...(settings.sections.anatomy?[{id:'details',label:'Les détails',description:'Le volume, de plus près.'}]:[]),
    ...(settings.sections.collections&&ordered.some(p=>p.category==='HOODIES')?[{id:'nuances',label:'Les nuances',description:'À chacun son ton.'}]:[]),
    {id:'drop',label:'Les vêtements',description:'Trouvez votre essentiel.'}
  ];

  return <div className="product-story neutral-story" ref={root}>
    <section className="story-hero" data-story-scene="hero" data-pinned aria-labelledby="story-title">
      <div className="story-hero-stage">
        <div className="story-hero-wash" aria-hidden="true" />
        <div className="story-hero-light" aria-hidden="true" />
        <span className="story-hero-background" aria-hidden="true">TREAU</span>
        <div className="story-hero-copy" data-story-plane>
          <p className="story-eyebrow">{settings.heroTitle} · COLLECTION 001</p>
          <h1 id="story-title"><span className="story-title-lead">{headline[0]}</span><span className="story-title-tail">{headline[1]}</span></h1>
          <p>Deux essentiels. Une même attitude.<br />Le mouvement vous appartient.</p>
        </div>
        {white && <div className="story-hero-companion" data-story-plane><OptimizedImage sizes="(max-width: 700px) 75vw, 40vw" src={white.image} alt={`${white.name}, blanc, essentiel TREAU`} style={imageStyle(white)} width="1000" height="1000" fetchPriority="high" /></div>}
        <div className="story-hero-garment" data-story-plane><OptimizedImage sizes="(max-width: 700px) 80vw, 55vw" src={signature.image} alt={`${signature.name}, ${signature.colors[0]}, la pièce signature TREAU`} style={imageStyle(signature)} width="1000" height="1000" fetchPriority="high" /></div>
        <div className="story-hero-detail" data-story-plane><p className="story-eyebrow">REGARDEZ DE PLUS PRÈS.</p><h2>Les essentiels.<br /><span>À votre façon.</span></h2></div>
        {white && <div className="story-mobile-focus" aria-hidden="true"><div className="mobile-focus-black"><span>01 / LE NOIR</span><p>Du volume.<br />De la présence.</p></div><div className="mobile-focus-white"><span>02 / LE BLANC</span><p>L’essentiel.<br />À votre façon.</p></div></div>}
        <div className="story-mobile-progress" aria-hidden="true"><i /></div>
        <div className="story-hero-foot story-hero-black-foot"><div><span>{signature.name}</span><strong>{money(signature.price)}</strong></div><button type="button" className="story-action" onClick={buy}>Choisir le hoodie <Plus size={19} /></button>{white && <button type="button" className="story-white-action" onClick={() => quickShop(white)}>Découvrir le t-shirt blanc <ArrowUpRight size={16} /></button>}</div>
        {white && <div className="story-hero-foot story-hero-white-foot"><div><span>{white.name}</span><strong>{money(white.price)}</strong></div><button type="button" className="story-action" onClick={() => quickShop(white)}>Choisir le t-shirt blanc <Plus size={19} /></button><button type="button" className="story-white-action" onClick={buy}>Découvrir le hoodie noir <ArrowUpRight size={16} /></button></div>}
        <a href="#signature" className="story-scroll-cue" aria-label="Découvrir la signature TREAU"><span>Faites défiler pour découvrir</span><ArrowDown size={15} /></a>
        <div className="story-hero-chapter" aria-hidden="true">01 / LA SIGNATURE</div>
      </div>
    </section>

    {settings.announcement && <p className="story-announcement">{settings.announcement}</p>}

    <NewDropPreview/>

    {!settings.sections.manifesto && <span id="signature" />}

    {settings.sections.manifesto && <section className="story-statement" data-story-scene="statement" data-pinned id="signature" aria-labelledby="statement-title">
      <div className="story-statement-stage">
        <div className="statement-heading"><p className="story-eyebrow">LE STYLE SE RESSENT.</p><span aria-hidden="true">TREAU / 001</span></div>
        <h2 id="statement-title"><span><span>Un essentiel.</span></span><span><span>Rien d’ordinaire.</span></span><span><span>Tout de vous.</span></span></h2>
        <div className="statement-foot"><p>Une silhouette ample, une signature discrète.<br />De la place pour bouger. Et pour être vous.</p><div className="statement-meter" aria-hidden="true"><span><i/></span><span><i/></span><span><i/></span></div></div>
        <div className="statement-rule" aria-hidden="true"><i/></div>
      </div>
    </section>}

    {settings.sections.anatomy && <section className="story-detail" data-story-scene="detail" data-pinned id="details" aria-label="La pièce en trois détails">
      <div className="story-detail-stage">
        <div className="story-detail-top"><span className="story-eyebrow">LA DIFFÉRENCE EST DANS LE DÉTAIL.</span><span>02 / VUE RAPPROCHÉE</span></div>
        <div className="story-detail-camera" data-story-plane><OptimizedImage src={signature.image} alt="Vue rapprochée de la coupe, de la broderie TREAU et des plis du hoodie" style={imageStyle(signature)} loading="lazy" width="1000" height="1000" /></div>
        <div className="story-detail-shade" aria-hidden="true" />
        <div className="story-detail-captions">
          <article className="story-detail-caption detail-caption-one"><span>01 / LE VOLUME</span><h2>Fait pour<br /><em>votre rythme.</em></h2><p>Des épaules tombantes.<br />Un volume qui laisse le mouvement libre.</p></article>
          <article className="story-detail-caption detail-caption-two"><span>02 / LA SIGNATURE</span><h2>Un détail.<br /><em>Toute l’allure.</em></h2><p>Le nom TREAU, simplement.<br />Une signature discrète, au plus près.</p></article>
          <article className="story-detail-caption detail-caption-three"><span>03 / LA SILHOUETTE</span><h2>Ça se voit.<br /><em>Ça se porte.</em></h2><p>Une coupe ample. Des lignes franches.<br />À associer à vos essentiels.</p></article>
        </div>
        <div className="story-detail-progress" aria-hidden="true"><span /><span /><span /></div>
        <p className="story-detail-note">{signature.name} · Collection 001</p>
      </div>
    </section>}

    {settings.sections.collections && <ColorStudio products={products} quickShop={quickShop} />}

    {settings.sections.ticker && <section className="story-breath" data-story-reveal data-story-scene="breath"><p className="story-eyebrow">INDEPENDENT BY DESIGN.</p><h2><span className="story-breath-first">Votre mouvement.</span><span className="story-breath-second">Vos règles.</span></h2><a href="#drop" className="story-text-link">Trouver ma pièce <ArrowDown size={18} /></a></section>}

    <ProductLineup products={settings.sections.tunnel ? ordered : ordered.slice(0,3)} wishlist={wishlist} favorite={favorite} quickShop={quickShop} />

    {settings.sections.lookbook && <section className="story-editorial" data-story-scene="editorial" data-purchase-end aria-labelledby="editorial-title">
      <div className="story-editorial-visual"><OptimizedImage src={lookbook} alt="Silhouette noire TREAU portée avec un pantalon ample" loading="lazy" width="1024" height="1536" /></div>
      <div className="story-editorial-copy" data-story-reveal><p className="story-eyebrow">UNE PIÈCE. VOTRE HISTOIRE.</p><h2 id="editorial-title">La suite<br /><span>se porte.</span></h2><p>Dans votre ville. À votre rythme.<br />Faites de la collection votre signature.</p><button type="button" className="story-action" onClick={buy}>Choisir ma taille <Plus size={19} /></button><Link href="/collections" className="story-text-link">Explorer les collections <ArrowUpRight size={18} /></Link></div>
    </section>}

    <p className="story-concept-note" data-purchase-end={!settings.sections.lookbook ? true : undefined}>Collection en préouverture. Visuels de concept. Commandes de démonstration, sans paiement réel.</p>

    <aside className="story-purchase-bar" data-purchase-bar data-visible="false" aria-label="Explorer la collection et choisir la pièce signature" aria-hidden="true" inert>
      <StoryChapterMenu chapters={chapters}/><button type="button" className="story-action" aria-label={'Choisir ma taille pour '+signature.name+' — '+money(signature.price)} onClick={buy}>Choisir · {money(signature.price)} <Plus size={17} /></button>
    </aside>
  </div>;
}
