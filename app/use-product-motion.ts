'use client';

import { RefObject, useEffect } from 'react';
import { dampStoryProgress, storyFrame, storyProgress } from '../lib/product-motion';

/** Native scrolling. Only visible scenes receive transform/opacity writes. */
export function useProductMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width: 700px)');
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-story-scene]'));
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-story-reveal]'));
    const active = new Set<HTMLElement>();
    const displayed = new Map<HTMLElement, number>();
    const bar = root.querySelector<HTMLElement>('[data-purchase-bar]');
    const finale = root.querySelector<HTMLElement>('[data-purchase-end]');
    const showroom = scenes.find(el => el.dataset.storyScene === 'color');
    let boxes = new Map<HTMLElement, { top: number; height: number; pinned: boolean; stageHeight: number }>();
    let frame = 0, measurement = 0, disposed = false, lastTime = 0;
    let viewport = window.innerHeight;
    let layoutHeight = window.innerHeight, layoutWidth = window.innerWidth, lastScroll = window.scrollY;
    let resizeAnchor: { el: HTMLElement; progress: number } | null = null;
    let heroBottom = Infinity, finaleTop = Infinity;

    const setBar = (visible: boolean) => {
      if (!bar || bar.dataset.visible === String(visible)) return;
      bar.dataset.visible = String(visible);
      bar.setAttribute('aria-hidden', String(!visible));
      bar.inert = !visible;
    };
    const render = (time: number) => {
      frame = 0;
      if (disposed || document.hidden || document.body.style.position === 'fixed') { lastTime = 0; return; }
      const y = window.scrollY;
      lastScroll = y;
      const showroomBox = showroom && boxes.get(showroom);
      const choosingColor = showroomBox && y > showroomBox.top - viewport * .15 && y < showroomBox.top + showroomBox.height - viewport * .35;
      setBar(y > heroBottom - viewport * .15 && y < finaleTop - viewport * .45 && !choosingColor);
      if (reduced.matches) { lastTime = 0; return; }
      const elapsed = lastTime ? Math.min(64, time - lastTime) : 16.67;
      lastTime = time;
      let moving = false;
      active.forEach(el => {
        const box = boxes.get(el);
        if (!box) return;
        const target = storyProgress(y, box.top, box.height, box.pinned ? box.stageHeight : viewport, box.pinned);
        const previous = displayed.get(el);
        const p = previous === undefined || Math.abs(target - previous) > .6 ? target : dampStoryProgress(previous, target, elapsed);
        displayed.set(el, p);
        if (p !== target) moving = true;
        if (el.dataset.storyScene === 'hero') {
          const piece = phone.matches && p >= .6 ? 'white' : 'black';
          if (el.dataset.mobilePiece !== piece) el.dataset.mobilePiece = piece;
        }
        const values = storyFrame(el.dataset.storyScene || '', p, phone.matches);
        for (const [key, value] of Object.entries(values)) {
          const next = value.toFixed(4);
          if (el.style.getPropertyValue(key) !== next) el.style.setProperty(key, next);
        }
      });
      if (moving) frame = requestAnimationFrame(render);
      else lastTime = 0;
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
    const measure = () => {
      measurement = 0;
      if (disposed || document.body.style.position === 'fixed') return;
      viewport = window.innerHeight;
      boxes = new Map(scenes.map(el => {
        const stage = el.querySelector<HTMLElement>('.story-hero-stage,.story-statement-stage,.story-detail-stage,.story-color-stage,.drop-stage');
        return [el, {
          top: el.getBoundingClientRect().top + window.scrollY,
          height: el.offsetHeight,
          pinned: !!stage && getComputedStyle(stage).position === 'sticky',
          stageHeight: stage?.offsetHeight || viewport,
        }];
      }));
      const hero = scenes.find(el => el.dataset.storyScene === 'hero');
      const heroBox = hero && boxes.get(hero);
      heroBottom = heroBox ? heroBox.top + heroBox.height : Infinity;
      finaleTop = finale ? finale.getBoundingClientRect().top + window.scrollY : Infinity;
      if (resizeAnchor) {
        const box = boxes.get(resizeAnchor.el);
        if (box) window.scrollTo({ top: box.top + box.height * resizeAnchor.progress, behavior: 'instant' });
        resizeAnchor = null;
      }
      schedule();
    };
    const queueMeasure = () => { if (!measurement && !disposed) measurement = requestAnimationFrame(measure); };
    const layoutResize = () => {
      if (window.innerWidth !== layoutWidth || (!phone.matches && window.innerHeight !== layoutHeight)) {
        // Preserve a chapter on rotation, but never move the page when phone browser bars retract.
        if (!resizeAnchor) {
          const entry = Array.from(boxes.entries()).find(([,box]) => lastScroll >= box.top && lastScroll < box.top + box.height);
          if (entry) resizeAnchor = { el: entry[0], progress: (lastScroll - entry[1].top) / Math.max(1, entry[1].height) };
        }
      }
      layoutHeight = window.innerHeight;
      layoutWidth = window.innerWidth;
      queueMeasure();
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          if (el.hasAttribute('data-story-scene')) { active.add(el); el.classList.add('story-scene-active'); }
          if (el.hasAttribute('data-story-reveal')) {
            el.classList.add('story-revealed');
            if (!el.hasAttribute('data-story-scene')) observer.unobserve(el);
          }
        } else { active.delete(el); displayed.delete(el); el.classList.remove('story-scene-active'); }
      }
      schedule();
    }, { rootMargin: '80px 0px', threshold: 0 });
    scenes.forEach(el => observer.observe(el));
    reveals.forEach(el => observer.observe(el));
    const resize = new ResizeObserver(queueMeasure);
    resize.observe(root);
    const bodyChange = new MutationObserver(queueMeasure);
    bodyChange.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    const preference = () => { if (reduced.matches) scenes.forEach(el => delete el.dataset.mobilePiece); root.dataset.motion = reduced.matches ? 'reduced' : 'ready'; displayed.clear(); lastTime = 0; queueMeasure(); };
    preference();
    measure();
    document.fonts.ready.then(queueMeasure);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', layoutResize, { passive: true });
    window.visualViewport?.addEventListener('resize', queueMeasure, { passive: true });
    window.addEventListener('pageshow', queueMeasure);
    document.addEventListener('visibilitychange', queueMeasure);
    reduced.addEventListener('change', preference);
    phone.addEventListener('change', queueMeasure);
    return () => {
      disposed = true;
      observer.disconnect(); resize.disconnect(); bodyChange.disconnect();
      cancelAnimationFrame(frame); cancelAnimationFrame(measurement);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', layoutResize);
      window.visualViewport?.removeEventListener('resize', queueMeasure);
      window.removeEventListener('pageshow', queueMeasure); document.removeEventListener('visibilitychange', queueMeasure);
      reduced.removeEventListener('change', preference); phone.removeEventListener('change', queueMeasure);
      delete root.dataset.motion;
    };
  }, [rootRef]);
}
