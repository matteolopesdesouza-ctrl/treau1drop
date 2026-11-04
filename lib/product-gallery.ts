import type {Product} from './catalog';

/** The cover is the first view, even when it is repeated in uploaded photos. */
export function productPhotos(product:Pick<Product,'image'|'images'>):string[]{
  return [...new Set([product.image,...product.images].filter(src=>src.trim().length>0))];
}
