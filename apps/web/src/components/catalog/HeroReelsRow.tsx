import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ReelConfig {
  id: number;
  col: number; // 0, 1, 2
  row: number; // 0, 1
  poster: string;
  alt: string;
  floatDuration: string;
  floatDelay: string;
  floatKeyframes: string;
}

const REELS: ReelConfig[] = [
  {
    id: 1,
    col: 0,
    row: 0,
    poster: '/reels/reel-1.jpg',
    alt: 'Studio Rapper Performance 1',
    floatDuration: '5.2s',
    floatDelay: '0s',
    floatKeyframes: 'float-tile-0',
  },
  {
    id: 2,
    col: 1,
    row: 0,
    poster: '/reels/reel-2.jpg',
    alt: 'Studio Rapper Performance 2',
    floatDuration: '6.1s',
    floatDelay: '0.8s',
    floatKeyframes: 'float-tile-1',
  },
  {
    id: 3,
    col: 2,
    row: 0,
    poster: '/reels/reel-3.jpg',
    alt: 'Studio Rapper Performance 3',
    floatDuration: '5.7s',
    floatDelay: '1.5s',
    floatKeyframes: 'float-tile-2',
  },
  {
    id: 4,
    col: 0,
    row: 1,
    poster: '/reels/reel-4.jpg',
    alt: 'Studio Rapper Performance 4',
    floatDuration: '6.6s',
    floatDelay: '0.4s',
    floatKeyframes: 'float-tile-3',
  },
  {
    id: 5,
    col: 1,
    row: 1,
    poster: '/reels/reel-5.jpg',
    alt: 'Studio Rapper Performance 5',
    floatDuration: '5.4s',
    floatDelay: '1.9s',
    floatKeyframes: 'float-tile-4',
  },
  {
    id: 6,
    col: 2,
    row: 1,
    poster: '/reels/reel-6.jpg',
    alt: 'Studio Rapper Performance 6',
    floatDuration: '6.3s',
    floatDelay: '1.1s',
    floatKeyframes: 'float-tile-5',
  },
];

// Single source video dimensions (864 x 1024, 3 cols x 2 rows of 288 x 512 each)
const CELL_W = 288;
const CELL_H = 512;
const CELL_ASPECT = CELL_W / CELL_H; // 9/16 = 0.5625

export function HeroReelsRow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const isIntersectingRef = useRef(false);
  const isTabVisibleRef = useRef(true);
  const isRenderingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const rvfcIdRef = useRef<number | null>(null);

  const [shouldFallbackToPoster, setShouldFallbackToPoster] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Parallax tilt on desktop
  const mousePosRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });
  const tiltContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Reduced motion checks only (do not disable for Save-Data so mobile users see video reels)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setShouldFallbackToPoster(true);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Shared Drawing Loop: draws all 6 canvases from the single 864x1024 video
  const renderCanvases = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !isIntersectingRef.current || !isTabVisibleRef.current) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    REELS.forEach((reel, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const displayW = Math.round(rect.width);
      const displayH = Math.round(rect.height);

      if (displayW === 0 || displayH === 0) return;

      const targetW = Math.round(displayW * dpr);
      const targetH = Math.round(displayH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const targetAR = displayW / displayH;
      const cellX = reel.col * CELL_W;
      const cellY = reel.row * CELL_H;

      let sW = CELL_W;
      let sH = CELL_H;
      let sX = cellX;
      let sY = cellY;

      // Exact centered cover crop calculation
      if (targetAR > CELL_ASPECT) {
        sH = Math.round(CELL_W / targetAR);
        sY = Math.round(cellY + (CELL_H - sH) / 2);
      } else if (targetAR < CELL_ASPECT) {
        sW = Math.round(CELL_H * targetAR);
        sX = Math.round(cellX + (CELL_W - sW) / 2);
      }

      ctx.drawImage(video, sX, sY, sW, sH, 0, 0, targetW, targetH);
    });
  }, []);

  // Frame scheduler using requestVideoFrameCallback with rAF fallback
  const startLoop = useCallback(() => {
    if (isRenderingRef.current) return;
    isRenderingRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const onFrame = () => {
        if (!isRenderingRef.current) return;
        renderCanvases();
        rvfcIdRef.current = (video as any).requestVideoFrameCallback(onFrame);
      };
      rvfcIdRef.current = (video as any).requestVideoFrameCallback(onFrame);
    } else {
      let lastTime = 0;
      const fpsInterval = 1000 / 24; // 24 fps cap
      const animLoop = (time: number) => {
        if (!isRenderingRef.current) return;
        if (time - lastTime >= fpsInterval) {
          lastTime = time;
          renderCanvases();
        }
        rafIdRef.current = requestAnimationFrame(animLoop);
      };
      rafIdRef.current = requestAnimationFrame(animLoop);
    }
  }, [renderCanvases]);

  const stopLoop = useCallback(() => {
    isRenderingRef.current = false;
    const video = videoRef.current;
    if (video && rvfcIdRef.current !== null && 'cancelVideoFrameCallback' in video) {
      (video as any).cancelVideoFrameCallback(rvfcIdRef.current);
      rvfcIdRef.current = null;
    }
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // Ensure DOM element has muted & playsinline set directly for iOS / Android autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');
    }

    // Attempt mobile autoplay unlock on first touch/interaction
    const unlockPlay = () => {
      const v = videoRef.current;
      if (v && v.paused) {
        v.play()
          .then(() => {
            startLoop();
          })
          .catch(() => {});
      }
    };

    window.addEventListener('touchstart', unlockPlay, { passive: true, once: true });
    window.addEventListener('scroll', unlockPlay, { passive: true, once: true });
    window.addEventListener('click', unlockPlay, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', unlockPlay);
      window.removeEventListener('scroll', unlockPlay);
      window.removeEventListener('click', unlockPlay);
    };
  }, [startLoop]);

  // IntersectionObserver & Visibility API
  useEffect(() => {
    if (shouldFallbackToPoster) return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      isTabVisibleRef.current = visible;
      const video = videoRef.current;
      if (!visible) {
        stopLoop();
        video?.pause();
      } else if (isIntersectingRef.current) {
        video?.play().catch(() => {});
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        isIntersectingRef.current = isIntersecting;
        const video = videoRef.current;

        if (isIntersecting && isTabVisibleRef.current) {
          video
            ?.play()
            .then(() => {
              startLoop();
            })
            .catch(() => {
              // On mobile, if play rejects before user gesture, still start loop when frame is ready
              startLoop();
            });
        } else {
          video?.pause();
          stopLoop();
        }
      },
      { rootMargin: '100px 0px', threshold: 0.05 }
    );

    observer.observe(el);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      stopLoop();
    };
  }, [shouldFallbackToPoster, startLoop, stopLoop]);

  // Desktop Pointer Parallax Effect (smooth tilt up to 8 deg)
  useEffect(() => {
    if (isMobile || shouldFallbackToPoster) return;

    let parallaxRaf: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const nx = (e.clientX - centerX) / (rect.width / 2 || 1);
      const ny = (e.clientY - centerY) / (rect.height / 2 || 1);
      mousePosRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const tiltLoop = () => {
      const targetTiltY = mousePosRef.current.x * 7; // up to 7 deg Y tilt
      const targetTiltX = -mousePosRef.current.y * 6; // up to 6 deg X tilt

      // Smooth lerp
      currentTiltRef.current.x += (targetTiltX - currentTiltRef.current.x) * 0.08;
      currentTiltRef.current.y += (targetTiltY - currentTiltRef.current.y) * 0.08;

      if (tiltContainerRef.current) {
        tiltContainerRef.current.style.transform = `rotateX(${currentTiltRef.current.x.toFixed(
          2
        )}deg) rotateY(${currentTiltRef.current.y.toFixed(2)}deg)`;
      }

      parallaxRaf = requestAnimationFrame(tiltLoop);
    };

    parallaxRaf = requestAnimationFrame(tiltLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(parallaxRaf);
    };
  }, [isMobile, shouldFallbackToPoster]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[1100px] mx-auto px-4 sm:px-3 pt-3 sm:pt-6 pb-2 sm:pb-4 select-none"
      style={{ perspective: '900px' }}
    >
      {/* 
        Single hidden master video kept in the DOM at 1px x 1px with opacity 0.01 
        (ensures hardware video decoding across budget mobile browsers)
      */}
      {!shouldFallbackToPoster && (
        <video
          ref={videoRef}
          src="/reels/reels-grid.mp4"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            opacity: 0.01,
            pointerEvents: 'none',
            zIndex: -999,
          }}
          onError={() => setShouldFallbackToPoster(true)}
          onLoadedData={() => {
            if (isIntersectingRef.current && isTabVisibleRef.current) {
              videoRef.current?.play().catch(() => {});
              startLoop();
            }
          }}
        />
      )}

      {/* Tilt Parallax wrapper (desktop only, identity on mobile) */}
      <div
        ref={tiltContainerRef}
        className="w-full transition-transform duration-75 ease-out"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* 
          Layout: 
          - Phones (<= 640px): 3 x 2 grid, gap 8px (gap-2), side padding 16px (px-4)
          - Desktop (>= 641px): 1 x 6 single row, gap 12px (sm:gap-3), centered
        */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 items-center justify-center">
          {REELS.map((reel, idx) => {
            return (
              <div
                key={reel.id}
                className={`relative w-full aspect-[3/4] sm:aspect-[9/16] overflow-hidden rounded-[10px] sm:rounded-[14px] bg-[#0c0e17] cursor-pointer group reel-tile-${idx}`}
                style={{
                  border: '1.5px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: isMobile
                    ? '0 0 8px rgba(59, 110, 255, 0.4), 0 6px 14px rgba(0, 0, 0, 0.5)'
                    : '0 0 14px rgba(59, 110, 255, 0.45), 0 6px 14px rgba(0, 0, 0, 0.5)',
                  animation: shouldFallbackToPoster
                    ? 'none'
                    : `${reel.floatKeyframes} ${reel.floatDuration} ease-in-out infinite alternate ${reel.floatDelay}`,
                  willChange: 'transform',
                }}
              >
                {shouldFallbackToPoster ? (
                  <img
                    src={reel.poster}
                    alt={reel.alt}
                    className="w-full h-full object-cover rounded-[9px] sm:rounded-[13px]"
                    loading="lazy"
                  />
                ) : (
                  <canvas
                    ref={(el) => {
                      canvasRefs.current[idx] = el;
                    }}
                    className="w-full h-full block object-cover rounded-[9px] sm:rounded-[13px]"
                  />
                )}

                {/* Subtle depth gradient sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none rounded-[9px] sm:rounded-[13px]" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded High-Performance CSS 3D Float Keyframes */}
      <style>{`
        @keyframes float-tile-0 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(-5px) rotateX(2.5deg) rotateY(-5deg) translateZ(10px); }
        }
        @keyframes float-tile-1 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(4px) rotateX(-3deg) rotateY(6deg) translateZ(6px); }
        }
        @keyframes float-tile-2 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(-4px) rotateX(3deg) rotateY(-4deg) translateZ(12px); }
        }
        @keyframes float-tile-3 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(5px) rotateX(-2deg) rotateY(5deg) translateZ(8px); }
        }
        @keyframes float-tile-4 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(-3px) rotateX(2deg) rotateY(-6deg) translateZ(11px); }
        }
        @keyframes float-tile-5 {
          0%   { transform: translateY(0px) rotateX(0deg) rotateY(0deg) translateZ(0px); }
          100% { transform: translateY(4px) rotateX(-3deg) rotateY(4deg) translateZ(7px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .reel-tile-0, .reel-tile-1, .reel-tile-2, .reel-tile-3, .reel-tile-4, .reel-tile-5 {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
