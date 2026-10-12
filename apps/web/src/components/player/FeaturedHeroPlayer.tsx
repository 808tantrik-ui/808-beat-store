import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
} from 'lucide-react';
import { BeatDTO } from '@shared/types';
import { useAudioStore } from '../../store/useAudioStore';
import { AudioWaveform } from './AudioWaveform';

interface FeaturedHeroPlayerProps {
  beats: BeatDTO[];
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function FeaturedHeroPlayer({ beats = [], onOpenLicenseModal }: FeaturedHeroPlayerProps) {
  // Filter for featured beats or take the first few available beats
  const playlist = useMemo(() => {
    const featured = beats.filter((b) => b && (b.featured || b.previewAudio));
    return featured.length > 0 ? featured : beats;
  }, [beats]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playTrack,
    pauseTrack,
    seek,
    toggleMute,
  } = useAudioStore();

  const activeBeat = playlist[currentIndex] || playlist[0] || beats[0];

  if (!activeBeat) return null;

  const isCurrentTrackPlaying = isPlaying && currentTrack?.id === activeBeat.id;

  const handleTogglePlay = () => {
    if (isCurrentTrackPlaying) {
      pauseTrack();
    } else {
      playTrack(activeBeat);
    }
  };

  const handleNext = () => {
    if (playlist.length <= 1) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    const nextBeat = playlist[nextIdx];
    if (isPlaying) {
      playTrack(nextBeat);
    }
  };

  const handlePrev = () => {
    if (playlist.length <= 1) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    const prevBeat = playlist[prevIdx];
    if (isPlaying) {
      playTrack(prevBeat);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration =
    currentTrack?.id === activeBeat.id && duration > 0 ? duration : activeBeat.duration || 180;
  const effectiveCurrentTime = currentTrack?.id === activeBeat.id ? currentTime : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 px-2 sm:px-0">
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#0f1123]/95 via-[#0a0b16]/95 to-[#070710]/98 border border-white/15 p-4 sm:p-6 shadow-[0_12px_45px_rgba(0,102,255,0.22)] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-electric-blue/50">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-electric-blue/15 blur-3xl pointer-events-none -z-0" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -z-0" />

        {/* Top Header Tag: Live Studio Preview */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 relative z-10 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCurrentTrackPlaying ? 'bg-cyan-400 opacity-75' : 'bg-slate-400 opacity-40'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCurrentTrackPlaying ? 'bg-cyan-400' : 'bg-slate-500'}`} />
            </span>
            <span className="font-mono text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-300">
              {isCurrentTrackPlaying ? 'Now Previewing Master' : 'Featured Studio Beat'}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-electric-blue/20 text-electric-cyan text-[10px] font-mono font-semibold">
              Track {currentIndex + 1} of {playlist.length}
            </span>
          </div>

          {/* Quick Playlist Switcher Controls */}
          {playlist.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Previous Beat"
                aria-label="Previous Featured Beat"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Next Beat"
                aria-label="Next Featured Beat"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Main Player Body: Artwork + Track Details + Playback Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4 relative z-10">
          {/* Artwork with Vinyl/Pulse Animation */}
          <div className="relative group shrink-0">
            <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 ${isCurrentTrackPlaying ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]' : 'border-white/20 shadow-xl'}`}>
              <img
                src={activeBeat.artwork || '/assets/artwork/missing-you.jpg'}
                alt={activeBeat.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isCurrentTrackPlaying ? 'scale-105' : 'group-hover:scale-105'}`}
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Overlay Play/Pause Button on Cover */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-electric-blue/90 hover:bg-electric-blue text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
                aria-label={isCurrentTrackPlaying ? 'Pause Beat' : 'Play Beat'}
              >
                {isCurrentTrackPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>
            </div>

            {/* Vinyl record spinning indicator (desktop) */}
            {isCurrentTrackPlaying && (
              <Disc3 className="absolute -top-2 -right-2 w-6 h-6 text-cyan-400 animate-spin-slow pointer-events-none drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
          </div>

          {/* Track Info & Tags */}
          <div className="flex-1 w-full text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1.5">
              {activeBeat.genre && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase">
                  {activeBeat.genre}
                </span>
              )}
              {activeBeat.bpm && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                  {activeBeat.bpm} BPM
                </span>
              )}
              {activeBeat.key && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                  {activeBeat.key}
                </span>
              )}
              {activeBeat.mood && (
                <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-medium">
                  {activeBeat.mood}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate leading-tight">
              {activeBeat.title}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              Prod. by 808 Beat Store {activeBeat.style ? `• ${activeBeat.style}` : ''}
            </p>

            {/* Interactive Audio Waveform / Scrubber */}
            <div className="mt-3 w-full">
              <AudioWaveform
                currentTime={effectiveCurrentTime}
                duration={effectiveDuration}
                onSeek={(time) => {
                  if (currentTrack?.id !== activeBeat.id) {
                    playTrack(activeBeat);
                  }
                  seek(time);
                }}
                barCount={56}
                height={28}
                interactive={true}
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>{formatSeconds(effectiveCurrentTime)}</span>
                <span>{formatSeconds(effectiveDuration)}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs: Play Button + License CTA */}
          <div className="flex sm:flex-col items-center justify-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`w-full sm:w-36 py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                isCurrentTrackPlaying
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  : 'bg-electric-blue hover:bg-blue-600 text-white shadow-glow-blue'
              }`}
            >
              {isCurrentTrackPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Preview</span>
                </>
              )}
            </button>

            {onOpenLicenseModal && (
              <button
                type="button"
                onClick={() => onOpenLicenseModal(activeBeat)}
                className="w-full sm:w-36 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer border-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Get License</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleMute}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
