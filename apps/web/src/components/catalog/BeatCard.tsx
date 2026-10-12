import React, { memo } from 'react';
import { Play, Pause, ShoppingCart, ShieldCheck } from 'lucide-react';
import { BeatDTO } from '@shared/types';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';

interface BeatCardProps {
  beat: BeatDTO;
  onOpenLicenseModal: (beat: BeatDTO) => void;
  onNavigateDetail?: (slug: string) => void;
}

function BeatCardComponent({ beat, onOpenLicenseModal, onNavigateDetail }: BeatCardProps) {
  // Granular store selector prevents re-rendering on audio currentTime updates
  const isCurrentlyPlaying = useAudioStore(
    (s) => s.isPlaying && s.currentTrack?.id === beat.id
  );
  const isCurrentActive = useAudioStore((s) => s.currentTrack?.id === beat.id);
  const playTrack = useAudioStore((s) => s.playTrack);
  const pauseTrack = useAudioStore((s) => s.pauseTrack);

  const addItem = useCartStore((s) => s.addItem);

  const minPrice = beat.availableLicenses?.[0]?.price || 1999;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pauseTrack();
    } else {
      playTrack(beat);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (beat.availableLicenses?.[0]) {
      addItem(beat, beat.availableLicenses[0]);
    }
  };

  return (
    <div
      onClick={() => onNavigateDetail?.(beat.slug)}
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isCurrentActive
          ? 'bg-surface-light border-electric-blue/70 shadow-[0_0_20px_rgba(0,102,255,0.25)] ring-1 ring-electric-blue/50'
          : 'bg-surface/90 hover:bg-surface-light border-white/10 hover:border-white/20'
      }`}
    >
      {/* Artwork Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-dark">
        <img
          src={beat.artwork}
          alt={beat.title}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090914] via-black/20 to-transparent pointer-events-none" />

        {/* Hot / Featured Pill */}
        {beat.featured && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-electric-blue/40 border border-electric-blue/60 text-[10px] font-black uppercase text-electric-cyan">
            Hot
          </div>
        )}

        {/* BPM & Key Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 border border-white/15 text-[10px] font-mono text-white whitespace-nowrap">
          {beat.bpm} BPM • {beat.key}
        </div>

        {/* Big Center Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayToggle}
          className={`absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
            isCurrentlyPlaying
              ? 'bg-electric-blue text-white scale-100 shadow-glow-blue'
              : 'bg-black/70 hover:bg-electric-blue text-white sm:opacity-0 group-hover:opacity-100 group-hover:scale-105'
          } cursor-pointer`}
          aria-label={isCurrentlyPlaying ? 'Pause beat' : 'Play beat'}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Info & Actions */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-electric-cyan transition-colors truncate">
            {beat.title}
          </h3>
          <p className="text-xs text-text-muted mt-0.5 font-mono">
            {beat.genre || 'Hip-Hop'} {beat.mood ? `• ${beat.mood}` : ''}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-text-subtle uppercase block">Starting at</span>
            <span className="text-base font-black text-white font-mono">
              ₹{minPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLicenseModal(beat);
              }}
              className="px-3 py-1.5 rounded-xl bg-electric-blue/20 hover:bg-electric-blue border border-electric-blue/40 text-electric-cyan hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Licenses</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              title="Add Standard License to Cart"
              className="p-2 rounded-xl bg-surface-light hover:bg-surface-border border border-white/10 text-white text-xs transition-all active:scale-90 flex items-center justify-center cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BeatCard = memo(BeatCardComponent);
