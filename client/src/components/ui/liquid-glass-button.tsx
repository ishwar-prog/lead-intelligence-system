import React, { ButtonHTMLAttributes } from 'react';

export interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

// Shared SVG displacement filter for true glass refraction.
// Filter IDs are global — safe even if rendered alongside LiquidCard's own filter,
// since the ids differ ("liquid-glass-distort" vs "container-glass").
function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="liquid-glass-distort"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.02"
            numOctaves={1}
            seed={2}
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation={1.5} result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale={40}
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation={1.5} result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <>
        <button
          ref={ref}
          className={`relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-black transition-all duration-300 rounded-full group bg-white/[0.05] hover:bg-white/[0.1] border border-white/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 ${className || ''}`}
          style={{
            WebkitBackdropFilter: 'url("#liquid-glass-distort")',
            backdropFilter: 'url("#liquid-glass-distort")',
            boxShadow:
              '0_0_6px_rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.08), inset 1px 1px 1px -0.5px rgba(255,255,255,0.6), inset -1px -1px 1px -0.5px rgba(255,255,255,0.6), inset 0 0 6px 6px rgba(255,255,255,0.12), inset 0 0 2px 2px rgba(255,255,255,0.06), 0 0 12px rgba(255,255,255,0.15)',
          }}
          {...props}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        </button>
        <GlassFilter />
      </>
    );
  }
);
LiquidButton.displayName = 'LiquidButton';