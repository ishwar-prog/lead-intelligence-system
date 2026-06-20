import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Gauge } from '../components/Gauge';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.hero-word', { y: 30, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.3 });
      gsap.from('.hero-sub', { y: 16, opacity: 0, duration: 0.7, delay: 0.8, ease: 'power3.out' });

      gsap.utils.toArray<HTMLElement>('.panel-card').forEach((card) => {
        gsap.from(card, {
          y: 40, opacity: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative min-h-screen" style={{ background: 'var(--color-paper)' }}>
      <div className="grain-texture" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-8 py-7">
        <span className="font-mono text-sm uppercase tracking-[0.15em]" style={{ color: 'var(--color-brass-dark)' }}>
          LEAD-INTEL // 01
        </span>
        <Link to="/dashboard" className="instrument-card rounded-full px-5 py-2 text-sm font-medium">
          Open Console
        </Link>
      </nav>

      <section className="relative z-10 mx-auto max-w-4xl px-8 pt-16 pb-24 text-center">
        <div className="mb-8 flex justify-center">
          <Gauge score={100} size={140} />
        </div>
        <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          <span className="hero-word inline-block">Every</span>{' '}
          <span className="hero-word inline-block">lead,</span>{' '}
          <span className="hero-word inline-block">measured</span>{' '}
          <span className="hero-word inline-block">to</span>{' '}
          <span className="hero-word inline-block" style={{ color: 'var(--color-brass-dark)' }}>the</span>{' '}
          <span className="hero-word inline-block" style={{ color: 'var(--color-brass-dark)' }}>degree.</span>
        </h1>
        <p className="hero-sub mx-auto mt-6 max-w-lg text-[15px] text-[#5b5347]">
          A calibrated AI instrument that scores, drafts, and routes inbound
          leads — reviewed by a human before anything ships.
        </p>
        <Link
          to="/dashboard"
          className="hero-sub mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3 font-medium text-white"
          style={{ background: 'var(--color-ink)' }}
        >
          Calibrate a lead →
        </Link>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-5 px-8 pb-28 md:grid-cols-3">
        {[
          { label: '01 · SCORE', title: 'Rubric, not guesswork', body: 'Five weighted factors, shown in full — never a black box.' },
          { label: '02 · REVIEW', title: 'Human-in-the-loop', body: 'Every draft sits in review before it reaches a prospect.' },
          { label: '03 · SCALE', title: 'Queued, not blocking', body: 'A governed background instrument, not a hammer on the API.' },
        ].map((f) => (
          <div key={f.title} className="panel-card screw instrument-card relative p-7">
            <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: 'var(--color-steel)' }}>{f.label}</span>
            <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b5347]">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}