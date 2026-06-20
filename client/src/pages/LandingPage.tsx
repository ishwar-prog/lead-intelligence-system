import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Registering a plugin must happen once, outside any component render -
// doing it at module scope (here) guarantees it only ever runs once,
// regardless of how many times LandingPage mounts/unmounts via routing.
gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Hero words stagger up and fade in on load
      gsap.from('.hero-word', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
      });

      gsap.from('.hero-sub', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });

      // Each feature card animates in independently as it scrolls
      // into view - scrollTrigger.trigger ties the animation's start
      // condition to that specific element's position, not the page's.
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    },
    // scope: cleanup and selector lookups are contained to this ref's
    // subtree only. This is what makes the hook safe to reuse across
    // multiple components without animations leaking into each other.
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden bg-neutral-950 text-white"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
        <span className="text-lg font-semibold tracking-tight">
          Lead Intelligence
        </span>
        <Link
          to="/dashboard"
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium
                     transition-colors hover:bg-white hover:text-black"
        >
          Launch Dashboard
        </Link>
      </nav>

      <section className="mx-auto max-w-5xl px-8 pt-24 pb-32 text-center">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          <span className="hero-word inline-block">AI</span>{' '}
          <span className="hero-word inline-block">that</span>{' '}
          <span className="hero-word inline-block">qualifies</span>{' '}
          <span className="hero-word inline-block">leads</span>{' '}
          <span className="hero-word inline-block text-neutral-500">while</span>{' '}
          <span className="hero-word inline-block text-neutral-500">you</span>{' '}
          <span className="hero-word inline-block text-neutral-500">sleep.</span>
        </h1>

        <p className="hero-sub mx-auto mt-8 max-w-xl text-lg text-neutral-400">
          Score, draft outreach, and route every inbound lead through a
          transparent, human-reviewed AI pipeline — in seconds.
        </p>

        <Link
          to="/dashboard"
          className="hero-sub group mt-10 inline-flex items-center gap-2 rounded-full
                     bg-white px-7 py-3 font-medium text-black transition-transform
                     hover:scale-105"
        >
          Try it live
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-8 pb-32 md:grid-cols-3">
        {[
          {
            title: 'Score in seconds',
            body: 'Every lead is scored against a transparent, explainable rubric — not a black box.',
          },
          {
            title: 'Human in the loop',
            body: 'Every AI draft is reviewable before it ever reaches a prospect.',
          },
          {
            title: 'Built to scale',
            body: 'A background job queue means thousands of leads never block your team.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="feature-card rounded-2xl border border-white/10 bg-white/[0.03] p-8
                       transition-colors hover:border-white/30"
          >
            <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-neutral-400">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}