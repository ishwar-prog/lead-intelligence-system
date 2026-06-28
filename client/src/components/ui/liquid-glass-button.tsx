import React, { type ButtonHTMLAttributes } from 'react';

export interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white transition-all duration-300 rounded-full group bg-white/5 hover:bg-white/10 border border-white/10 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 backdrop-blur-md shadow-sm ${className || ''}`}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#fcd34d] shadow-[0_0_5px_#fcd34d] shrink-0" />
          {children}
        </span>
      </button>
    );
  }
);
LiquidButton.displayName = 'LiquidButton';