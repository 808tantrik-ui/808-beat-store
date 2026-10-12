import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ShoppingCart, Music2, MoveHorizontal } from 'lucide-react';
import { BeatDTO } from '@shared/types';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';
import { useModalStore } from '../../store/useModalStore';

interface CoverFlow3DProps {
  beats: BeatDTO[];
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function CoverFlow3D({ beats, onOpenLicenseModal }: CoverFlow3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isHorizontalScroll = useRef<boolean | null>(null);
  const hasMovedSignificant = useRef(false);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const pauseTrack = useAudioStore((s) => s.pauseTrack);
  const { addItem } = useCartStore();
  const { openLicenseModal } = useModalStore();

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + beats.length) % beats.length);
  }, [beats.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % beats.length);
  }, [beats.length]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (!beats || beats.length === 0) return null;

  const activeBeat = beats[activeIndex] || beats[0];
  const isCurrentActivePlaying = currentTrack?.id === activeBeat.id && isPlaying;

  const handlePlayToggle = (beat: BeatDTO) => {
    if (currentTrack?.id === beat.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(beat);
    }
  };

  // --- Touch & Mouse Swipe Handlers ---
  const handleDragStart = (clientX: number, clientY: number) => {
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    isHorizontalScroll.current = null;
    hasMovedSignificant.current = false;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number, clientY: number, e?: React.TouchEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;

    const diffX = clientX - dragStartX.current;
    const diffY = clientY - dragStartY.current;

    // Detect gesture direction on first significant movement
    if (isHorizontalScroll.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalScroll.current = Math.abs(diffX) >= Math.abs(diffY);
      }
    }

    // Only drag horizontally if user is swiping left/right
    if (isHorizontalScroll.current) {
      if (e && e.cancelable) {
        e.preventDefault(); // Prevent page vertical bounce during horizontal swipe
      }
      if (Math.abs(diffX) > 12) {
        hasMovedSignificant.current = true;
      }
      // Apply rubber-band damping
      setDragOffset(diffX * 0.7);
    }
  };

  const handleDragEnd = () => {
    if (dragStartX.current !== null && isHorizontalScroll.current) {
      const swipeThreshold = 40; // minimum pixels to trigger slide
      if (dragOffset < -swipeThreshold) {
        handleNext();
      } else if (dragOffset > swipeThreshold) {
        handlePrev();
      }
    }

    dragStartX.current = null;
    dragStartY.current = null;
    isHorizontalScroll.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full py-4 sm:py-10 px-4 select-none overflow-hidden touch-pan-y"
    >
      {/* Section Header */}
      <div className="text-center mb-4 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-lighter/60 border border-surface-border text-electric-cyan text-xs font-semibold uppercase tracking-wider mb-2">
          <Music2 className="w-3.5 h-3.5" />
          Featured Catalog
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          New Releases
        </h2>
        <p className="text-text-muted text-sm mt-1 flex items-center justify-center gap-1.5">
          <span>Swipe left / right or use arrows to explore beats</span>
          <MoveHorizontal className="w-4 h-4 text-electric-cyan animate-pulse inline" />
        </p>
      </div>

      {/* 3D Coverflow Stage with Touch & Drag Listeners */}
      <div
        className={`relative h-[340px] sm:h-[400px] flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY, e)}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (dragStartX.current !== null) {
            handleDragMove(e.clientX, e.clientY);
          }
        }}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {beats.map((beat, idx) => {
          const offset = idx - activeIndex;
          const isCenter = offset === 0;

          // Compute 3D translation & rotation + live drag response
          const stepSpacing = typeof window !== 'undefined' && window.innerWidth < 640 ? 115 : 190;
          const liveDrag = isDragging ? dragOffset : 0;
          const translateX = offset * stepSpacing + liveDrag;
          const translateZ = isCenter ? 120 : -Math.abs(offset) * 110;
          const rotateY = isCenter ? (liveDrag / stepSpacing) * -18 : offset < 0 ? 38 : -38;
          const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.28;
          const zIndex = 20 - Math.abs(offset);

          const isItemPlaying = currentTrack?.id === beat.id && isPlaying;

          return (
            <div
              key={beat.id}
              onClick={(e) => {
                // If user dragged, don't trigger click action
                if (hasMovedSignificant.current) {
                  e.stopPropagation();
                  return;
                }
                if (isCenter) {
                  handlePlayToggle(beat);
                } else {
                  setActiveIndex(idx);
                }
              }}
              className={`absolute w-[220px] h-[280px] sm:w-[270px] sm:h-[340px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl group border ${
                isDragging ? 'transition-none' : 'transition-all duration-500 ease-out'
              }`}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
                borderColor: isCenter
                  ? 'rgba(0, 102, 255, 0.8)'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isCenter
                  ? '0 20px 50px rgba(0, 102, 255, 0.4), 0 0 25px rgba(112, 0, 255, 0.35)'
                  : '0 10px 25px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Artwork Image */}
              <img
                src={beat.artwork}
                alt={beat.title}
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

              {/* Center Play Button Overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isCenter ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-electric-blue/90 text-white flex items-center justify-center shadow-glow-blue backdrop-blur-md transform transition-transform hover:scale-110 active:scale-95">
                  {isItemPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </div>
              </div>

              {/* Card Bottom Metadata */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 to-transparent pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-electric-cyan whitespace-nowrap block">
                  {beat.bpm} BPM • {beat.key}
                </span>
                <h3 className="text-white font-bold text-base truncate mt-0.5">
                  {beat.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                  <span>{beat.style}</span>
                  <span className="font-semibold text-white">
                    ₹{beat.availableLicenses?.[0]?.price?.toLocaleString() || '1,999'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators (Interactive) */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {beats.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex
                ? 'w-6 h-2 bg-electric-cyan shadow-glow-blue'
                : 'w-2 h-2 bg-surface-border hover:bg-text-muted'
            }`}
          />
        ))}
      </div>

      {/* ================= SECTION 1: BOTTOM PLAYER BAR ================= */}
      <div className="w-full flex justify-between items-center px-3 md:px-0 gap-2 max-w-xl mx-auto mt-5">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous Beat"
          className="shrink-0 p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition flex items-center justify-center cursor-pointer border-0"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Player Capsule */}
        <div className="flex-1 flex justify-between items-center bg-[#0d1527] border border-blue-900/60 rounded-full px-2.5 py-1.5 md:px-4 md:py-2 shadow-lg">
          <button
            onClick={() => handlePlayToggle(activeBeat)}
            className="flex items-center text-left text-xs md:text-sm text-white truncate mr-2 hover:text-cyan-400 transition-colors cursor-pointer border-0 bg-transparent"
          >
            {isCurrentActivePlaying ? (
              <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 mr-1.5 shrink-0 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 mr-1.5 shrink-0 fill-current" />
            )}
            <span className="truncate max-w-[110px] sm:max-w-xs md:max-w-none">
              {isCurrentActivePlaying ? 'Pause Preview' : `Play "${activeBeat.title}"`}
            </span>
          </button>

          {/* Mobile par sirf cart icon, desktop par pura text */}
          <button
            onClick={() => {
              if (onOpenLicenseModal) {
                onOpenLicenseModal(activeBeat);
              } else {
                openLicenseModal(activeBeat);
              }
            }}
            className="shrink-0 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 md:px-4 md:py-1.5 transition shadow-glow-blue active:scale-95 cursor-pointer border-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden md:inline ml-2 text-xs font-bold uppercase tracking-wider">Select License</span>
          </button>
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next Beat"
          className="shrink-0 p-1.5 rounded-full hover:bg-white/10 active:scale-90 transition flex items-center justify-center cursor-pointer border-0"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
