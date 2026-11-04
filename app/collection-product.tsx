'use client';
import OptimizedImage from './optimized-image';
import { ArrowUpRight, Heart, Plus } from 'lucide-react';
import Link from './navigation-link';
import { Product, imageStyle, money } from '../lib/catalog';

export function CollectionProduct({ product, index = 0, priority = false, wished, onWish, onQuickShop, className = '' }: {
  product: Product;
  index?: number;
  priority?: boolean;
  wished: boolean;
  onWish: () => void;
  onQuickShop: () => void;
  className?: string;
}) {
  const available = product.status === 'Published' && product.variants.some(v => v.stock > 0);
  return <article className={`product-card collection-product ${className}`} data-craft-scene="product" data-craft-order={index%3}>
    <div className="collection-product-stage">
      <span className="collection-product-label">{product.slug === 'signature-hoodie' ? 'LA SIGNATURE' : product.collection}</span>
      <button className={`collection-product-wish ${wished ? 'selected' : ''}`} onClick={onWish}
        aria-label={`${wished ? 'Retirer des' : 'Ajouter aux'} favoris : ${product.name}`} aria-pressed={wished}>
        <Heart size={19} strokeWidth={1.4} fill={wished ? 'currentColor' : 'none'} />
      </button>
      <Link href={`/product/${product.slug}`} className="collection-product-image" aria-label={`Découvrir ${product.name}`}>
        <OptimizedImage sizes="(max-width: 700px) 85vw, 35vw" src={product.image} alt={`${product.name} — ${product.colors[0]}`} style={imageStyle(product)} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} />
        <span className="collection-product-explore"><ArrowUpRight size={24} /></span>
      </Link>
    </div>
    <div className="collection-product-info">
      <Link href={`/product/${product.slug}`}><h3>{product.name}</h3><span>{product.colors.join(' / ')} · Coupe oversize</span></Link>
      <strong>{product.comparePrice && <del>{money(product.comparePrice)}</del>}{money(product.price)}</strong>
    </div>
    <button className="collection-product-add" disabled={!available} onClick={onQuickShop}
      aria-label={available ? `Choisir la taille : ${product.name}` : `${product.name} est épuisé`}>
      <span>{available ? 'Choisir ma taille' : 'Épuisé'}</span><Plus size={18} strokeWidth={1.5} />
    </button>
  </article>;
}

