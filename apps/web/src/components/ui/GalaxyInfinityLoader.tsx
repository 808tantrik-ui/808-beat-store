import React, { useEffect, useState } from 'react';

interface GalaxyInfinityLoaderProps {
  onLoaded?: () => void;
  maxDurationMs?: number;
}

export function GalaxyInfinityLoader({
  onLoaded,
  maxDurationMs = 800,
}: GalaxyInfinityLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Fast, optimized initial splash duration: stays for maxDurationMs then smoothly fades out
    const timer = setTimeout(() => {
      setIsFading(true);
      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onLoaded) onLoaded();
      }, 350); // 350ms smooth transition
      return () => clearTimeout(removeTimer);
    }, maxDurationMs);

    return () => clearTimeout(timer);
  }, [maxDurationMs, onLoaded]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05050a] text-white transition-opacity duration-350 ease-out select-none pointer-events-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="808 Beat Store Loading Screen"
      role="status"
    >
      {/* Background Deep Space Ambient Nebula */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-cyan-500/15 blur-[120px] transform-gpu" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#05050a]/80 to-[#05050a]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Galaxy Infinity Symbol */}
        <div className="relative w-72 h-40 sm:w-80 sm:h-44 flex items-center justify-center">
          <svg
            viewBox="0 0 300 160"
            className="w-full h-full filter drop-shadow-[0_0_24px_rgba(0,102,255,0.6)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Outer Neon Glow */}
              <filter id="infinity-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Clip path defining the Infinity Loop Geometry */}
              <clipPath id="infinity-galaxy-clip">
                <path
                  d="M 150,80 C 115,35 45,35 45,80 C 45,125 115,125 150,80 C 185,35 255,35 255,80 C 255,125 185,125 150,80 Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </clipPath>

              {/* Dynamic Galaxy Linear & Radial Gradients */}
              <linearGradient id="galaxy-stream" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF">
                  <animate
                    attributeName="stop-color"
                    values="#00F0FF;#0066FF;#8A2BE2;#FF007F;#00F0FF"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="35%" stopColor="#8A2BE2">
                  <animate
                    attributeName="stop-color"
                    values="#8A2BE2;#FF007F;#00F0FF;#0066FF;#8A2BE2"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="70%" stopColor="#0066FF">
                  <animate
                    attributeName="stop-color"
                    values="#0066FF;#00F0FF;#8A2BE2;#FF007F;#0066FF"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#00F0FF">
                  <animate
                    attributeName="stop-color"
                    values="#00F0FF;#8A2BE2;#FF007F;#0066FF;#00F0FF"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>

              {/* Swirling Nebula Core */}
              <radialGradient id="nebula-pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#00F0FF" stopOpacity="0.6" />
                <stop offset="75%" stopColor="#8A2BE2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#050512" stopOpacity="0.9" />
              </radialGradient>
            </defs>

            {/* Backplate subtle track shadow */}
            <path
              d="M 150,80 C 115,35 45,35 45,80 C 45,125 115,125 150,80 C 185,35 255,35 255,80 C 255,125 185,125 150,80 Z"
              fill="none"
              stroke="#0a0a18"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Galaxy & Cosmos Universe Content Clipped Inside Infinity Loop */}
            <g clipPath="url(#infinity-galaxy-clip)">
              {/* Deep Space Base */}
              <rect width="300" height="160" fill="#04040c" />

              {/* Flowing Cosmic Gradient Layer */}
              <rect width="300" height="160" fill="url(#galaxy-stream)" opacity="0.85" />

              {/* Rotating Cosmos Nebulae Stars Group */}
              <g className="animate-galaxy-spin" style={{ transformOrigin: '75px 80px' }}>
                <circle cx="75" cy="80" r="55" fill="url(#nebula-pulse)" opacity="0.75" />
                {/* Twinkling Starfield in Left Loop */}
                <circle cx="55" cy="65" r="1.5" fill="#ffffff" className="animate-pulse" />
                <circle cx="95" cy="90" r="1.8" fill="#ffffff" />
                <circle cx="65" cy="95" r="1.2" fill="#00F0FF" />
                <circle cx="85" cy="60" r="2.2" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="72" cy="74" r="1.4" fill="#E0E7FF" />
                <circle cx="48" cy="82" r="1" fill="#A78BFA" />
              </g>

              <g className="animate-galaxy-spin-reverse" style={{ transformOrigin: '225px 80px' }}>
                <circle cx="225" cy="80" r="55" fill="url(#nebula-pulse)" opacity="0.75" />
                {/* Twinkling Starfield in Right Loop */}
                <circle cx="205" cy="65" r="1.6" fill="#ffffff" className="animate-pulse" />
                <circle cx="245" cy="92" r="1.4" fill="#ffffff" />
                <circle cx="215" cy="96" r="2" fill="#00F0FF" />
                <circle cx="235" cy="62" r="1.8" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                <circle cx="222" cy="75" r="1.3" fill="#E0E7FF" />
                <circle cx="250" cy="80" r="1" fill="#C084FC" />
              </g>

              {/* Shooting Cosmic Comet dust lines */}
              <path
                d="M 50,80 Q 75,50 150,80 T 250,80"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5"
                strokeDasharray="15 35"
                className="animate-cosmic-flow"
              />
              <path
                d="M 250,80 Q 225,110 150,80 T 50,80"
                fill="none"
                stroke="rgba(0,240,255,0.8)"
                strokeWidth="2"
                strokeDasharray="20 40"
                className="animate-cosmic-flow-reverse"
              />
            </g>

            {/* Glowing Neon Outline Contour on Infinity Edge */}
            <path
              d="M 150,80 C 115,35 45,35 45,80 C 45,125 115,125 150,80 C 185,35 255,35 255,80 C 255,125 185,125 150,80 Z"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeDasharray="6 8"
              className="animate-pulse"
              opacity="0.9"
              filter="url(#infinity-glow)"
            />
          </svg>
        </div>

        {/* Brand Name Typography */}
        <div className="mt-4 text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-[0.3em] uppercase bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,102,255,0.5)]">
            808 Beat Store
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
              Initializing Studio Universe
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes galaxySpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes galaxySpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes cosmicFlow {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-galaxy-spin {
          animation: galaxySpin 8s linear infinite;
        }
        .animate-galaxy-spin-reverse {
          animation: galaxySpinReverse 10s linear infinite;
        }
        .animate-cosmic-flow {
          animation: cosmicFlow 3s linear infinite;
        }
        .animate-cosmic-flow-reverse {
          animation: cosmicFlow 3.5s linear infinite reverse;
        }
      `}</style>
    </div>
  );
}
