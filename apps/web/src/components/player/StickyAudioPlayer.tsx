import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ShoppingCart,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';
import { useModalStore } from '../../store/useModalStore';
import { AudioWaveform } from './AudioWaveform';
import { BeatDTO } from '@shared/types';

interface StickyAudioPlayerProps {
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function StickyAudioPlayer({ onOpenLicenseModal }: StickyAudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
  } = useAudioStore();

  const { addItem } = useCartStore();
  const { openFullScreenPlayer } = useModalStore();
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectLicense = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onOpenLicenseModal && currentTrack) {
      onOpenLicenseModal(currentTrack);
    } else if (currentTrack.availableLicenses?.[0]) {
      addItem(currentTrack, currentTrack.availableLicenses[0]);
    }
  };

  const handleBarTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Only open if the click was not on an interactive child button
    openFullScreenPlayer();
  };

  // Functional Seek Handlers
  const handleSeekFromEvent = (clientX: number) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newTime = (clickX / rect.width) * duration;
    seek(newTime);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeekFromEvent(e.clientX);
  };

  const handleProgressBarTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleSeekFromEvent(e.touches[0].clientX);
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));

  return (
    <div className="fixed bottom-safe left-2 sm:left-4 right-2 sm:right-4 z-50 mb-1.5 sm:mb-2 bg-[#090912]/92 border border-white/12 rounded-2xl sm:rounded-3xl backdrop-blur-[16px] shadow-[0_15px_45px_rgba(0,0,0,0.85)] transition-all duration-300 overflow-hidden">
      {/* Interactive Song Seek/Progress Bar (Always Active on Top of Player) */}
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onTouchMove={handleProgressBarTouch}
        onTouchStart={handleProgressBarTouch}
        className="relative w-full h-2 sm:h-2.5 bg-white/15 hover:h-3 transition-all cursor-pointer group select-none touch-none"
        title="Tap or drag to seek track"
      >
        <div
          className="h-full bg-gradient-to-r from-electric-blue via-electric-cyan to-white relative"
          style={{ width: `${progressPercent}%` }}
        >
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-glow-blue border border-electric-blue transition-transform active:scale-125" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3">
        {/* ========================================================================= */}
        {/* MOBILE VIEW (< sm screens) */}
        {/* ========================================================================= */}
        <div className="sm:hidden">
          {/* Expanded Drawer: Waveform, Seek & Transport Controls */}
          {isExpandedMobile && (
            <div className="pb-3 mb-2.5 border-b border-white/10 animate-fade-in space-y-2.5">
              {/* Transport Buttons */}
              <div className="flex items-center justify-center gap-6 pt-1">
                <button
                  onClick={prevTrack}
                  aria-label="Previous track"
                  className="text-text-muted hover:text-white transition-colors active:scale-90"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-10 h-10 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-glow-blue hover:bg-electric-blue/90 active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={nextTrack}
                  aria-label="Next track"
                  className="text-text-muted hover:text-white transition-colors active:scale-90"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Waveform & Time */}
              <div className="w-full flex items-center gap-2">
                <span className="text-[10px] font-mono text-electric-cyan w-8 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <AudioWaveform
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={seek}
                    height={26}
                    barCount={36}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-subtle w-8 shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          )}

          {/* Compact Main Mobile Bar */}
          <div
            onClick={handleBarTap}
            className="flex items-center justify-between gap-3 cursor-pointer select-none active:bg-white/[0.03] rounded-xl transition-colors py-0.5"
            title="Tap to open full-screen player"
          >
            {/* Left: Enlarged Rounded Thumbnail & Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-md shrink-0 pointer-events-none"
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white hover:text-electric-cyan transition-colors truncate block">
                  {currentTrack.title}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                  <span className="text-electric-cyan font-mono font-semibold">{currentTrack.bpm} BPM</span>
                  <span>•</span>
                  <span>{currentTrack.key}</span>
                  <span>•</span>
                  <span className="font-mono text-[9px] text-text-muted">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* Right: Play/Pause, Highlighted Accent Price Button, and Expand */}
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-9 h-9 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-glow-blue active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Highlighted Accent Price Button (Clickable Appearance) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectLicense(e);
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-electric-blue via-blue-600 to-electric-cyan text-white text-xs font-extrabold shadow-glow-blue flex items-center gap-1.5 active:scale-95 hover:brightness-110 transition-all border border-white/20 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                <span>₹{currentTrack.availableLicenses?.[0]?.price?.toLocaleString() || '49'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFullScreenPlayer();
                }}
                className="p-1.5 text-text-muted hover:text-white rounded-lg bg-surface-light border border-surface-border/60 active:scale-95 cursor-pointer"
                aria-label="Expand full-screen player"
                title="Expand full-screen player"
              >
                <ChevronUp className="w-4 h-4 text-electric-cyan" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW (>= sm screens, exact original layout) */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-6">
          {/* Left: Beat Information & Thumbnail */}
          <div
            onClick={openFullScreenPlayer}
            className="flex items-center gap-3 w-1/4 min-w-[200px] cursor-pointer group"
            title="Click to expand full-screen player"
          >
            <div className="relative shrink-0">
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                width={52}
                height={52}
                loading="lazy"
                decoding="async"
                className="w-13 h-13 rounded-lg object-cover border border-surface-border shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                <ChevronUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="truncate">
              <span className="text-base font-bold text-white group-hover:text-electric-cyan transition-colors truncate block">
                {currentTrack.title}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-surface-lighter text-electric-cyan font-mono text-[10px]">
                  {currentTrack.bpm} BPM
                </span>
                <span>{currentTrack.key}</span>
                <span className="hidden md:inline">• {currentTrack.style}</span>
              </div>
            </div>
          </div>

          {/* Center: Controls & Interactive Waveform */}
          <div className="w-2/4 flex flex-col items-center">
            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-4 mb-1">
              <button
                onClick={prevTrack}
                aria-label="Previous track"
                className="text-text-muted hover:text-white transition-colors active:scale-90"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-glow-blue hover:bg-electric-blue/90 active:scale-95 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                aria-label="Next track"
                className="text-text-muted hover:text-white transition-colors active:scale-90"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Waveform & Time Track */}
            <div className="w-full flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-text-muted w-9 text-right shrink-0">
                {formatTime(currentTime)}
              </span>

              <div className="flex-1">
                <AudioWaveform
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={seek}
                  height={28}
                  barCount={64}
                />
              </div>

              <span className="text-[11px] font-mono text-text-subtle w-9 shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume & Quick Purchase Shortcut */}
          <div className="w-1/4 flex items-center justify-end gap-3">
            {/* Volume Control (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="text-text-muted hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-surface-border rounded-lg appearance-none cursor-pointer accent-electric-blue"
              />
            </div>

            {/* License Shortcut & Add to Cart */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectLicense}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold border border-surface-border transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-electric-cyan" />
                <span>License</span>
                <span>₹{currentTrack.availableLicenses?.[0]?.price?.toLocaleString() || '1,999'}</span>
              </button>

              <button
                onClick={handleSelectLicense}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold shadow-glow-blue transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
