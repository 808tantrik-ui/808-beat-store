import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ShoppingCart,
  Share2,
  ShieldCheck,
  Disc3,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useModalStore } from '../../store/useModalStore';
import { AudioWaveform } from './AudioWaveform';
import { BeatDTO } from '@shared/types';
import { producerBrand, brandHelpers } from '@config/brand';

interface FullScreenPlayerModalProps {
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function FullScreenPlayerModal({ onOpenLicenseModal }: FullScreenPlayerModalProps) {
  const navigate = useNavigate();
  const { isFullScreenPlayerOpen, closeFullScreenPlayer, openLicenseModal } = useModalStore();
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

  const producerName = brandHelpers.getProducerName(producerBrand);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullScreenPlayer();
      }
    };
    if (isFullScreenPlayerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullScreenPlayerOpen, closeFullScreenPlayer]);

  if (!isFullScreenPlayerOpen || !currentTrack) {
    return null;
  }

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekFromEvent = (clientX: number) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newTime = (clickX / rect.width) * duration;
    seek(newTime);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    handleSeekFromEvent(e.clientX);
  };

  const handleProgressBarTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      handleSeekFromEvent(e.touches[0].clientX);
    }
  };

  const handleLicenseClick = () => {
    if (onOpenLicenseModal) {
      onOpenLicenseModal(currentTrack);
    } else {
      openLicenseModal(currentTrack);
    }
  };

  const handleGoToDetails = () => {
    closeFullScreenPlayer();
    if (currentTrack.slug) {
      navigate(`/beats/${currentTrack.slug}`);
    }
  };

  const handleShare = async () => {
    const beatUrl = `${window.location.origin}/#/beats/${currentTrack.slug || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentTrack.title} | 808 Beat Store`,
          text: `Listen to "${currentTrack.title}" produced by ${producerName}`,
          url: beatUrl,
        });
      } catch {
        // Share cancelled or not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(beatUrl);
        alert('Beat link copied to clipboard!');
      } catch {
        // ignore
      }
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));

  return (
    <div
      className="fixed inset-0 z-[99] flex flex-col justify-between bg-[#06060e]/95 backdrop-blur-2xl text-white overflow-y-auto animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Full-Screen Music Player"
    >
      {/* Background Dynamic Ambient Backlight Glow from Artwork */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[85vw] h-[85vw] max-w-[800px] max-h-[800px] rounded-full opacity-20 blur-[140px] transform-gpu"
          style={{
            background: 'radial-gradient(circle, #0066FF 0%, #8A2BE2 50%, transparent 80%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06060e]/60 to-[#06060e]" />
      </div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-[#06060e]/60 backdrop-blur-md border-b border-white/10">
        <button
          onClick={closeFullScreenPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
          aria-label="Minimize full-screen player"
        >
          <ChevronDown className="w-4 h-4 text-electric-cyan" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* Center Now Playing Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <span className={`w-0.5 h-3 bg-electric-cyan rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
            <span className={`w-0.5 h-4 bg-white rounded-full ${isPlaying ? 'animate-bounce' : ''}`} />
            <span className={`w-0.5 h-2.5 bg-electric-blue rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase">
            NOW PLAYING
          </span>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-300 hover:text-white cursor-pointer"
          title="Share beat"
          aria-label="Share beat"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Main Stage: Large HD Artwork & Track Information */}
      <div className="max-w-xl mx-auto w-full px-5 py-4 sm:py-8 flex flex-col items-center text-center my-auto">
        {/* Large Artwork with Vinyl Depth & Glow */}
        <div className="relative group mb-6 sm:mb-8">
          <div className="absolute -inset-2 bg-gradient-to-r from-electric-blue via-electric-cyan to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img
              src={currentTrack.artwork}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-[1.02]' : 'scale-100'
              }`}
            />
            {/* Spinning Disc Badge Overlay */}
            <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-electric-cyan">
              <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
          </div>
        </div>

        {/* Track Title & Producer Branding */}
        <div className="space-y-2 mb-6 w-full">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            {currentTrack.title}
          </h2>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
            <span>Prod. by {producerName}</span>
          </div>

          {/* Metadata Badges: BPM, Key, Style */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-electric-cyan font-mono text-xs font-bold">
              {currentTrack.bpm} BPM
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-mono text-xs font-semibold">
              KEY: {currentTrack.key}
            </span>
            {currentTrack.genre && (
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-300 text-xs font-medium">
                {currentTrack.genre}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commercial Clearance</span>
            </span>
          </div>
        </div>

        {/* Live AudioWaveform Visualizer */}
        <div className="w-full mb-3 px-2">
          <AudioWaveform
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            height={36}
            barCount={52}
          />
        </div>

        {/* Scrub / Seek Progress Bar */}
        <div className="w-full space-y-1.5 px-2 mb-6">
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onTouchMove={handleProgressBarTouch}
            onTouchStart={handleProgressBarTouch}
            className="relative w-full h-2.5 bg-white/15 rounded-full hover:h-3 transition-all cursor-pointer select-none touch-none overflow-hidden"
            title="Drag to seek"
          >
            <div
              className="h-full bg-gradient-to-r from-electric-blue via-electric-cyan to-white relative"
              style={{ width: `${progressPercent}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-glow-blue border border-electric-blue" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span className="text-electric-cyan font-bold">{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Big Transport Controls */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <button
            onClick={prevTrack}
            aria-label="Previous track"
            className="text-slate-400 hover:text-white transition-all active:scale-90 p-2"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-electric-blue to-electric-cyan text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            aria-label="Next track"
            className="text-slate-400 hover:text-white transition-all active:scale-90 p-2"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* Volume Slider Bar (Desktop and Tablets) */}
        <div className="hidden sm:flex items-center justify-center gap-3 w-48 mb-6">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-electric-blue"
          />
        </div>

        {/* Action Buttons: License Modal & Track Page */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleLicenseClick}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-electric-blue via-blue-600 to-electric-cyan hover:brightness-110 active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-blue transition-all cursor-pointer border border-white/20"
          >
            <ShoppingCart className="w-4 h-4 fill-current" />
            <span>
              License Beat • ₹{currentTrack.availableLicenses?.[0]?.price?.toLocaleString() || '49'}
            </span>
          </button>

          <button
            onClick={handleGoToDetails}
            className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
          >
            <span>Full Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Audio Specs strip */}
      <div className="px-4 py-3 bg-[#06060e]/80 border-t border-white/10 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-3 flex-wrap">
        <span>24-BIT / 48KHZ WAV MASTER</span>
        <span>•</span>
        <span>320KBPS MP3</span>
        <span>•</span>
        <span>MULTI-TRACK STEMS</span>
        <span>•</span>
        <span>INSTANT DOWNLOAD VAULT</span>
      </div>
    </div>
  );
}
