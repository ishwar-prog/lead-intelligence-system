import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface GaugeProps {
  score: number;
  size?: number;
}

/**
 * Gauge — the one bold element this entire design is built around.
 *
 * The needle's rotation maps mathematically to the score: 0 -> -90deg,
 * 100 -> +90deg, a 180-degree sweep. On mount, it animates with a slight
 * elastic overshoot — the way a real physical needle settles into place
 * rather than snapping there instantly. Everything else in this design
 * stays quiet so this element can be the one thing people remember.
 */
export function Gauge({ score, size = 96 }: GaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const angle = -90 + (score / 100) * 180;

  useGSAP(
    () => {
      gsap.fromTo(
        needleRef.current,
        { rotate: -90, transformOrigin: '50% 100%' },
        {
          rotate: angle,
          duration: 1.3,
          ease: 'elastic.out(1, 0.55)',
          transformOrigin: '50% 100%',
        }
      );
    },
    { scope: containerRef, dependencies: [score] }
  );

  const zoneColor =
    score >= 80 ? 'var(--color-brass-dark)' : score >= 50 ? '#9C7A2E' : 'var(--color-steel)';

  return (
    <div ref={containerRef} className="relative" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 100 62" className="h-full w-full">
        <path d="M 8 56 A 42 42 0 0 1 92 56" fill="none" stroke="var(--color-groove)" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 8 56 A 42 42 0 0 1 92 56"
          fill="none"
          stroke={zoneColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 132} 132`}
        />
        <circle cx="50" cy="56" r="3" fill="var(--color-ink)" />
        <line ref={needleRef} x1="50" y1="56" x2="50" y2="20" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span
        className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-xs font-semibold"
        style={{ color: zoneColor }}
      >
        {score}
      </span>
    </div>
  );
}