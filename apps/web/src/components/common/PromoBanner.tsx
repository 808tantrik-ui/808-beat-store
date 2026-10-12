import React from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

interface PromoBannerProps {
  onCtaClick?: () => void;
}

export function PromoBanner({ onCtaClick }: PromoBannerProps) {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-purple-950/80 to-blue-950/80 border border-electric-blue/40 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,102,255,0.25)] backdrop-blur-xl animate-fade-in my-6">
      {/* Background glow effects */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-electric-blue/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-electric-cyan/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-electric-blue to-electric-cyan flex items-center justify-center text-white shadow-glow-blue shrink-0 animate-bounce">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electric-blue/20 border border-electric-blue/40 text-[10px] font-bold text-electric-cyan uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Limited Time Bundle Deal</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Buy 2 Beats, <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-blue-400">Get 1 Free</span>
            </h3>
            <p className="text-xs text-slate-300">
              Add any 3 instrumentals with matching license tiers to your cart — third beat discount automatically applies!
            </p>
          </div>
        </div>

        {onCtaClick && (
          <button
            type="button"
            onClick={onCtaClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-cyan hover:brightness-110 text-white text-xs font-black uppercase tracking-wider shadow-glow-blue flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <span>Explore Beats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
