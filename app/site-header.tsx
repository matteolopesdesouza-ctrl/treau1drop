'use client';
import {brandMark} from '../lib/responsive-images';

import { RefObject } from 'react';
import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react';

type Panel = 'cart' | 'search' | 'menu' | 'quick' | null;

export default function SiteHeader({ path, scrolled, count, panel, openPanel, cartButton }: {
  path: string;
  scrolled: boolean;
  count: number;
  panel: Panel;
  openPanel: (panel: Panel) => void;
  cartButton: RefObject<HTMLButtonElement | null>;
}) {
  const links = [
    ['/shop', 'BOUTIQUE'],
    ['/new-drop', 'LE DROP'],
    ['/collections', 'COLLECTIONS'],
    ['/about', 'LA MARQUE'],
  ];

  return <header className={`site-header ${path === '/' ? `on-hero ${scrolled ? 'is-scrolled' : ''}` : ''}`}>
    {/* Primary navigation uses document links, including when client routing is unavailable. */}
    <a href="/" className="wordmark" aria-label="TREAU, accueil" aria-current={path === '/' ? 'page' : undefined}>
      <span className="brand-symbol"><img src={brandMark.small} width="160" height="160" decoding="async" alt="" /></span>
      <span className="brand-name">TREAU</span>
    </a>
    <nav className="desktop-nav" aria-label="Navigation principale">
      {links.map(([href, label]) => <a key={href} href={href} aria-current={path === href || (href === '/shop' && path.startsWith('/product/')) ? 'page' : undefined}>
        {label}{href === '/new-drop' && <i aria-hidden="true" />}
      </a>)}
    </nav>
    <div className="header-actions">
      <span className="locale" title="Boutique en français · Prix en euros">FR / EUR €</span>
      <button type="button" aria-label="Rechercher" aria-haspopup="dialog" aria-expanded={panel === 'search'} aria-controls={panel === 'search' ? 'storefront-dialog' : undefined} onClick={() => openPanel('search')}>
        <Search size={20} aria-hidden="true" />
      </button>
      <a href="/account" aria-label="Mon compte" aria-current={path === '/account' ? 'page' : undefined}>
        <UserRound size={20} aria-hidden="true" />
      </a>
      <button type="button" ref={cartButton} className="cart-button" aria-label={`Panier, ${count} articles`} aria-haspopup="dialog" aria-expanded={panel === 'cart'} aria-controls={panel === 'cart' ? 'storefront-dialog' : undefined} onClick={() => openPanel('cart')}>
        <ShoppingBag size={20} aria-hidden="true" /><span className="header-cart-count" key={count}>{String(count).padStart(2, '0')}</span>
      </button>
      <button type="button" className="mobile-menu" aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-expanded={panel === 'menu'} aria-controls={panel === 'menu' ? 'storefront-dialog' : undefined} onClick={() => openPanel('menu')}>
        <span>MENU</span><Menu size={23} aria-hidden="true" />
      </button>
    </div>
  </header>;
}
