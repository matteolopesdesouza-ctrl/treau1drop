import type { ImgHTMLAttributes } from 'react';
import { responsiveImages } from '../lib/responsive-images';

/** Native srcset keeps custom uploads intact and sends phones a smaller built-in image. */
export default function OptimizedImage({src,sizes='(max-width: 700px) 100vw, 60vw',decoding='async',...props}:ImgHTMLAttributes<HTMLImageElement>){
  const variants=typeof src==='string'?responsiveImages[src]:undefined;
  const fallback=variants?.find(image=>image.width>=600)||variants?.at(-1);
  return <img {...props} src={fallback?.src||src} srcSet={variants?.map(image=>`${image.src} ${image.width}w`).join(', ')} sizes={variants?sizes:undefined} decoding={decoding}/>;
}
