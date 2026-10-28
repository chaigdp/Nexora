'use client';
import {useEffect, useState} from 'react';
import {CLOCK_INTERVAL_MS, homeMoment, quoteParts} from '../lib/home-clock';
import s from './home-welcome.module.css';

export default function HomeWelcome() {
  const [moment, setMoment] = useState<ReturnType<typeof homeMoment> | null>(null);
  useEffect(() => {
    const refresh = () => setMoment(homeMoment(new Date()));
    refresh();
    const timer = window.setInterval(refresh, CLOCK_INTERVAL_MS);
    const visible = () => { if(document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const parts = moment ? quoteParts(moment.quote.text) : null;
  return <section className={s.welcome} aria-label="Boas-vindas e inspiração do dia">
    {/* Exact selected asset, not an AI redraw. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={s.mascots} src="/onfly-chai-high-five.png" alt="Mascotes Onfly e chAI comemorando juntos com um toque de mãos" width={1358} height={1158}/>
    <div className={s.content}>
      <div className={s.heading}>
        <div className={s.logoPill}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/onfly-logo.svg" alt="Onfly" width={350} height={110}/>
        </div>
        <div><h1 className={s.title}>{moment?.greeting ?? 'Olá'}, <span className={s.gradient}>Chai</span></h1><time className={s.date}>{moment?.date ?? '\u00a0'}</time></div>
      </div>
      <div className={s.quoteSpace}>
        {moment && parts && <figure className={s.quote} key={`${moment.group}-${moment.slot}`}>
          <blockquote>“{parts.start}{parts.start ? ' ' : ''}<span className={s.gradient}>{parts.end}</span>”</blockquote>
          <figcaption>{moment.quote.author}</figcaption>
        </figure>}
      </div>
      <p className={s.prompt}>{moment?.prompt ?? '\u00a0'}</p>
    </div>
  </section>;
}
