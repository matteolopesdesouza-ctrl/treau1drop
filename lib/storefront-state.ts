import type { Product } from './catalog';

export type CartLine = { id: string; color: string; size: string; quantity: number };
export const MAX_QUANTITY = 20;
export function variantLimit(product: Product | undefined, color: string, size: string) {
  if (!product || product.status !== 'Published') return 0;
  return Math.max(0, Math.min(MAX_QUANTITY, product.variants.find(v => v.color === color && v.size === size)?.stock || 0));
}
export function availableToAdd(product: Product, cart: CartLine[], color: string, size: string) {
  return Math.max(0, variantLimit(product, color, size) - cart.filter(i => i.id === product.id && i.color === color && i.size === size).reduce((n, i) => n + i.quantity, 0));
}
/** Browser storage is untrusted and may contain obsolete variants or old quantities. */
export function restoreCart(input: unknown, products: Product[]): CartLine[] {
  if (!Array.isArray(input)) return [];
  const result: CartLine[] = [];
  for (const raw of input.slice(0, 200)) {
    if (!raw || typeof raw !== 'object') continue;
    const { id, color, size, quantity } = raw;
    if (typeof id !== 'string' || typeof color !== 'string' || typeof size !== 'string' || !Number.isInteger(quantity) || quantity < 1) continue;
    const limit = variantLimit(products.find(p => p.id === id), color, size);
    if (!limit) continue;
    const existing = result.find(i => i.id === id && i.color === color && i.size === size);
    if (existing) existing.quantity = Math.min(limit, existing.quantity + quantity);
    else if (result.length < 40) result.push({ id, color, size, quantity: Math.min(quantity, limit) });
  }
  return result;
}
export function restoreWishlist(input: unknown): string[] {
  return Array.isArray(input) ? [...new Set(input.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 80))].slice(0, 200) : [];
}
export function addCartLine(cart: CartLine[], product: Product, color: string, size: string, quantity: number): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableToAdd(product, cart, color, size)) return cart;
  const existing = cart.some(i => i.id === product.id && i.color === color && i.size === size);
  if (!existing && cart.length >= 40) return cart;
  return existing ? cart.map(i => i.id === product.id && i.color === color && i.size === size ? { ...i, quantity: i.quantity + quantity } : i) : [...cart, { id: product.id, color, size, quantity }];
}
/** Filter choices follow the catalogue, including custom sizes and colours from the studio. */
export function catalogFilterOptions(products: Product[]) {
  const live = products.filter(p => p.status !== 'Draft');
  const sizeOrder = ['XXS','XS','S','M','L','XL','XXL','XXXL','3XL','4XL','5XL'];
  const sizes = [...new Set(live.flatMap(p => p.sizes))].sort((a,b) => {
    const rank = (value: string) => { const index=sizeOrder.indexOf(value.toUpperCase());return index<0?sizeOrder.length:index; };
    return rank(a)-rank(b)||a.localeCompare(b,'fr',{numeric:true});
  });
  return {sizes,colors:[...new Set(live.flatMap(p=>p.colors))],priceCeiling:live.reduce((ceiling,p)=>Math.max(ceiling,Math.ceil(p.price/100)),160)};
}
export function matchesFilters(p: Product, filters: { category: string; collection: string; size: string; color: string; max: number|null; inStock: boolean }) {
  return p.status !== 'Draft' && (filters.category === 'ALL' || p.category === filters.category) && (!filters.collection || p.collection === filters.collection) && (filters.max===null||p.price <= filters.max * 100) &&
    p.variants.some(v => (!filters.size || v.size === filters.size) && (!filters.color || v.color === filters.color) && (!filters.inStock || (p.status === 'Published' && v.stock > 0)));
}
export const searchText = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-‐‑–—'’]/g,' ').trim().toLocaleLowerCase('fr');
const categorySearchTerms:Record<string,string>={
  HOODIES:'hoodie hoodies sweat sweats sweatshirt sweatshirts pull pulls',
  'T-SHIRTS':'t-shirt t-shirts tshirt tshirts tee tees',
  PANTS:'pantalon pantalons jogging joggings pants',
  JACKETS:'veste vestes jacket jackets',
  ACCESSORIES:'accessoire accessoires accessory accessories'
};
const colorSearchTerms:Record<string,string>={Noir:'black',Blanc:'white',Cobalt:'bleu blue',Craie:'ecru beige'};
export function matchesSearch(p: Product, query: string) {
  const words = searchText(query).split(/\s+/).filter(Boolean);
  const text = searchText([p.name,p.sku,p.collection,p.category,categorySearchTerms[p.category]||'',...p.colors,...p.colors.map(color=>colorSearchTerms[color]||''),...p.sizes].join(' '));
  return words.every(word => text.includes(word));
}
