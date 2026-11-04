'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { pageProgress } from '../lib/product-motion';
import {useScrollScenes} from './use-scroll-scenes';

/** One-shot artwork entrances and a scroll indicator; no React renders per frame. */
export default function Scrollcraft() {
  const path = usePathname();
  useScrollScenes(path);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0, needsMeasure = true, height = 0, viewport = 0;
    const render = () => {
      frame = 0;
      if (document.body.style.position === 'fixed') return;
      if (needsMeasure) {
        height = document.documentElement.scrollHeight;
        viewport = window.innerHeight;
        needsMeasure = false;
      }
      if (progress.current) progress.current.style.transform = `scaleX(${pageProgress(window.scrollY,height,viewport)})`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const measure = () => { needsMeasure = true; schedule(); };
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    resize?.observe(document.documentElement);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
    return () => { cancelAnimationFrame(frame); resize?.disconnect(); window.removeEventListener('scroll',schedule); window.removeEventListener('resize',measure); };
  },[path]);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || typeof IntersectionObserver === 'undefined') return;
    const seen = new Set<Element>();
    const root = document.querySelector('#main');
    let scanFrame = 0;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('craft-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0, rootMargin: '0px 0px 35px 0px' });
    const scan = () => {
      scanFrame = 0;
      document.querySelectorAll<HTMLElement>('.campaign-section-heading,.drop-products > article,.story-lineup-track > article,.shop-grid > article,.shop-title,.collections-page > h1,.collection-cover,.about-story > article,.about-photo,.pdp-shot,.pdp-editorial,.rotation-heading,.worlds-heading,.newsletter > div,.newsletter form,.footer-top > div,.footer-brand-symbol').forEach(el => {
        if(el.hasAttribute('data-craft-scene'))return;
        if (seen.has(el)) return;
        seen.add(el);
        const index = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
        el.style.setProperty('--craft-order',String(index % 4));
        el.classList.add('craft-reveal'); observer.observe(el);
      });
    };
    scan();
    const mutation = new MutationObserver(() => { if (!scanFrame) scanFrame = requestAnimationFrame(scan); });
    if (root) mutation.observe(root, { childList: true, subtree: true });
    const stopMotion = () => { if (reduced.matches) seen.forEach(el => el.classList.add('craft-visible')); };
    reduced.addEventListener('change', stopMotion);
    return () => {
      observer.disconnect(); mutation.disconnect(); cancelAnimationFrame(scanFrame);
      reduced.removeEventListener('change', stopMotion);
      seen.forEach(el => { el.classList.remove('craft-reveal', 'craft-visible'); (el as HTMLElement).style.removeProperty('--craft-order'); });
    };
  }, [path]);
  return <div className="site-scroll-progress" aria-hidden="true"><div ref={progress} /></div>;
}
