export const clampUnit = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function smoothRange(start: number, end: number, value: number) {
  const t = clampUnit((value - start) / Math.max(.0001, end - start));
  return t * t * (3 - 2 * t);
}

export function storyProgress(scroll: number, top: number, height: number, viewport: number, pinned = false) {
  if (pinned) return clampUnit((scroll - top) / Math.max(1, height - viewport));
  return clampUnit((scroll + viewport - top) / Math.max(1, height + viewport));
}

export function pageProgress(scroll: number, height: number, viewport: number) {
  return height > viewport ? clampUnit(scroll / (height - viewport)) : 0;
}

/** Exponential camera easing is independent of the display refresh rate. */
export function dampStoryProgress(current: number, target: number, elapsed: number) {
  const destination = clampUnit(target);
  const next = clampUnit(current) + (destination - clampUnit(current)) * (1 - Math.exp(-Math.max(0, elapsed) / 85));
  return Math.abs(destination - next) < .0003 ? destination : next;
}

export function storyFrame(kind: string, progress: number, mobile: boolean): Record<string, number> {
  const p = clampUnit(progress);
  if (kind === 'lookbook') {
    const approach = smoothRange(0, .85, p);
    return {
      '--look-spread': 12 * (1 - smoothRange(0, .45, p)),
      '--look-scale': 1 + .14 * approach,
      '--look-title-opacity': 1 - smoothRange(.08, .38, p),
      '--look-title-y': -65 * smoothRange(0, .45, p),
      '--look-next-opacity': smoothRange(.49, .66, p),
      '--look-crossfade': mobile ? smoothRange(.18, .43, p) : 1,
      '--look-line': p,
      '--studio-neutral': smoothRange(.4, .6, p),
      '--studio-open': smoothRange(.48, .66, p),
      '--studio-rise': 72 * (1 - smoothRange(.48, .78, p)),
      '--studio-turn': 14 * (1 - smoothRange(.48, .83, p)),
      '--studio-scale': .88 + .12 * smoothRange(.48, .83, p),
      '--studio-switch': mobile ? smoothRange(.76, .96, p) : 0,
    };
  }
  if (kind === 'hero') {
    const arrival = smoothRange(.1, .85, p);
    return {
      '--duo-spread': smoothRange(.06, .78, p),
      '--duo-lift': smoothRange(.08, .8, p),
      '--mobile-black-focus': smoothRange(0, .3, p),
      '--mobile-white-focus': smoothRange(.45, .85, p),
      '--mobile-black-caption': smoothRange(.18, .3, p) * (1 - smoothRange(.43, .55, p)),
      '--mobile-white-caption': smoothRange(.62, .8, p),
      '--mobile-hero-progress': p,
      '--hero-opacity': 1 - smoothRange(mobile ? .03 : .08, mobile ? .24 : .4, p),
      '--hero-rise': -48 * smoothRange(0, .45, p),
      '--hero-shift': mobile ? 0 : -16 * arrival,
      '--hero-turn': (mobile ? -5 : -7) + (mobile ? 9 : 12) * arrival,
      '--hero-scale': 1 + (mobile ? .16 : .42) * arrival,
      '--hero-y': (mobile ? -12 : -22) * Math.sin(arrival * Math.PI / 2),
      '--hero-depth': 8 - 18 * arrival,
      '--hero-wash-scale': .5 + 1.15 * arrival,
      '--hero-wash-opacity': .08 + .55 * arrival,
      '--hero-letter-shift': -5 * arrival,
      '--hero-detail-opacity': smoothRange(.44, .7, p),
      '--hero-detail-rise': 24 * (1 - smoothRange(.44, .7, p)),
      '--hero-light-opacity': .45 + .55 * arrival,
      '--hero-glow-shift': -5 + 10 * arrival,
    };
  }
  if (kind === 'mobile-preview') return {
    '--preview-travel': mobile ? 35 * (1 - 2 * smoothRange(.1, .9, p)) : 0,
    '--preview-scale': mobile ? 1.09 - .09 * smoothRange(.1, .8, p) : 1,
  };
  if (kind === 'detail') {
    const closer = smoothRange(.08, .49, p);
    const returnToPiece = smoothRange(.78, 1, p);
    return {
      '--detail-scale': 1 + (mobile ? 1.15 : 1.8) * closer * (1 - returnToPiece),
      '--detail-turn': -5 * (1 - closer) + 3 * returnToPiece,
      '--detail-first': 1 - smoothRange(.14, .31, p),
      '--detail-second': smoothRange(.22, .38, p) * (1 - smoothRange(.66, .8, p)),
      '--detail-third': smoothRange(.73, .9, p),
      '--detail-line': p,
    };
  }
  if (kind === 'statement') return {
    '--word-one': 1,
    '--word-two': .35 + .65 * smoothRange(.06, .42, p),
    '--word-three': .35 + .65 * smoothRange(.4, .78, p),
    '--statement-second': smoothRange(.06, .42, p),
    '--statement-third': smoothRange(.4, .78, p),
    '--statement-scale': .94 + .06 * smoothRange(0, .8, p),
    '--statement-line': p,
  };
  if (kind === 'editorial') return {
    '--editorial-scale': 1.12 - .12 * smoothRange(.05, .6, p),
    '--editorial-y': 28 - 56 * smoothRange(0, 1, p),
  };
  if (kind === 'color') {
    const fan = smoothRange(.04, .66, p);
    return {
      '--fan-spread': .12 + .88 * fan,
      '--fan-tilt': 3 + 11 * fan,
      '--fan-rise': (mobile ? 28 : 60) * (1 - fan),
      '--fan-scale': .92 + .08 * fan,
      '--color-text-shift': (mobile ? 8 : 28) * (1 - 2 * p),
      '--fan-line': fan,
    };
  }
  if (kind === 'breath') return {
    '--breath-travel': (mobile ? 8 : 42) * (1 - 2 * smoothRange(.1, .9, p)),
  };
  return { '--story-progress': p };
}

/** Scroll entrances settle before the visitor reaches the product controls. */
export function craftFrame(kind:string,progress:number,mobile:boolean,order=0):Record<string,number> {
  const p=clampUnit(progress);
  const stagger=Math.max(0,Math.min(2,Number.isFinite(order)?order:0))*(mobile ? .018 : .035);
  const arrival=smoothRange(.02+stagger,.38+stagger,p);
  if(kind==='product')return {
    '--craft-rise':(mobile?44:76)*(1-arrival),
    '--craft-scale':.86+.14*arrival,
    '--craft-tilt':(mobile?9:16)*(1-arrival),
    '--craft-opacity':.3+.7*arrival,
  };
  if(kind==='photo')return {
    '--craft-reveal':smoothRange(.015,.38,p),
    '--craft-photo-scale':1.09-.09*smoothRange(.03,.7,p),
    '--craft-photo-y':(mobile?10:22)*(1-2*smoothRange(.05,.95,p)),
  };
  return {};
}
