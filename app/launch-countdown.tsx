'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DROP_DATE, getCountdown, isPrelaunch } from '../lib/launch';
import { brandMark } from '../lib/responsive-images';

export default function LaunchCountdown({ serverNow }: { serverNow: number }) {
  const [now, setNow] = useState(serverNow);
  const router = useRouter();
  const countdown = getCountdown(now);

  useEffect(() => {
    let opening = false;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (!isPrelaunch(current) && !opening) {
        opening = true;
        router.refresh();
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', tick);
    };
  }, [router]);

  const units = [
    { value: countdown.days, label: 'JOURS' },
    { value: countdown.hours, label: 'HEURES' },
    { value: countdown.minutes, label: 'MINUTES' },
    { value: countdown.seconds, label: 'SECONDES' },
  ];

  return <main className="launch-screen" aria-labelledby="launch-title">
    <div className="launch-atmosphere" aria-hidden="true">
      <img
        src="/images/optimized/campaign-night-1000-414f7cf3.webp"
        srcSet="/images/optimized/campaign-night-600-414f7cf3.webp 600w, /images/optimized/campaign-night-1000-414f7cf3.webp 1000w"
        sizes="100vw"
        width="1000"
        height="667"
        alt=""
        fetchPriority="high"
      />
    </div>

    <header className="launch-header">
      <div className="launch-brand">
        <span className="launch-symbol" aria-hidden="true">
          <img src={brandMark.small} width="160" height="160" alt="" />
        </span>
        <span className="launch-wordmark">TREAU<span>®</span></span>
      </div>
      <span className="launch-status"><i aria-hidden="true" /> DROP À VENIR</span>
    </header>

    <div className="launch-center">
      <div className="launch-intro">
        <h1 id="launch-title">Le drop arrive dans</h1>
        <div className="launch-schedule">
          <time dateTime={DROP_DATE}>1er décembre 2026</time>
          <span>00h00 <i aria-hidden="true">·</i> Heure de Lisbonne</span>
        </div>
      </div>

      <div className="launch-timer" role="timer" aria-live="off" aria-label={`${countdown.days} jours, ${countdown.hours} heures, ${countdown.minutes} minutes, ${countdown.seconds} secondes avant le drop`}>
        {units.map(({ value, label }, index) => <div className="launch-unit" key={label} data-unit={index} aria-hidden="true">
          <span className="launch-number"><span className="launch-number-inner" key={value}>{String(value).padStart(2, '0')}</span></span>
          <span className="launch-label">{label}</span>
        </div>)}
      </div>
      <noscript><p className="launch-nojs">Activez JavaScript pour suivre le compte à rebours en direct.</p></noscript>
    </div>

    <footer className="launch-footer">
      <span className="launch-motto">MOVE DIFFERENT.</span>
      <p>La boutique s’ouvrira automatiquement<br className="launch-footer-break" /> à la fin du compte à rebours.</p>
    </footer>
  </main>;
}
