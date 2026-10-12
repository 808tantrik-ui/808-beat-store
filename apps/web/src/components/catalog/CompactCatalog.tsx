import React, { memo } from 'react';
import { Play, Pause, ShoppingCart, ShieldCheck } from 'lucide-react';
import { BeatDTO } from '@shared/types';
import { useAudioStore } from '../../store/useAudioStore';
import { useCartStore } from '../../store/useCartStore';

interface CompactCatalogProps {
  beats: BeatDTO[];
  onOpenLicenseModal: (beat: BeatDTO) => void;
  onNavigateDetail?: (slug: string) => void;
  limit?: number;
}

function CompactCatalogComponent({
  beats,
  onOpenLicenseModal,
  onNavigateDetail,
  limit,
}: CompactCatalogProps) {
  const currentTrackId = useAudioStore((s) => s.currentTrack?.id);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const pauseTrack = useAudioStore((s) => s.pauseTrack);
  const addItem = useCartStore((s) => s.addItem);

  const displayBeats = limit ? beats.slice(0, limit) : beats;

  return (
    <div className="space-y-2.5 w-full">
      {displayBeats.map((beat, index) => {
        const isCurrentActive = currentTrackId === beat.id;
        const isCurrentlyPlaying = isCurrentActive && isPlaying;
        const minPrice = beat.availableLicenses?.[0]?.price || 49;
        const cutPrice = beat.availableLicenses?.[0]?.defaultPrice || 499;

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
            key={beat.id}
            onClick={() => onNavigateDetail?.(beat.slug)}
            className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isCurrentActive
                ? 'bg-gradient-to-r from-electric-blue/20 via-surface-light to-surface border-electric-blue/60 shadow-[0_0_20px_rgba(0,102,255,0.25)]'
                : 'bg-surface/80 hover:bg-surface-light border-white/5 hover:border-white/15'
            }`}
          >
            {/* Left: Thumbnail & Title Info */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {/* Index number */}
              <span className="hidden sm:inline-block w-5 text-center font-mono text-xs text-slate-300 font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Square Thumbnail with Play Action */}
              <div
                onClick={handlePlayToggle}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform bg-surface-dark"
              >
                <img
                  src={beat.artwork}
                  alt={beat.title}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all ${
                    isCurrentlyPlaying
                      ? 'bg-electric-blue/70 opacity-100'
                      : 'bg-black/50 sm:opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-current" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-xs sm:text-sm truncate group-hover:text-electric-cyan transition-colors">
                    {beat.title}
                  </h4>
                  {beat.featured && (
                    <span className="hidden xs:inline-flex items-center px-1.5 py-0.2 rounded bg-electric-blue/20 border border-electric-blue/40 text-[9px] font-bold text-electric-cyan uppercase">
                      Hot
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] sm:text-xs text-slate-300 font-mono overflow-hidden">
                  <span className="text-electric-cyan font-bold whitespace-nowrap shrink-0">{beat.bpm} BPM</span>
                  <span className="text-slate-500 shrink-0">•</span>
                  <span className="whitespace-nowrap shrink-0 font-medium text-slate-200">{beat.key}</span>
                  <span className="hidden sm:inline text-slate-500 shrink-0">•</span>
                  <span className="hidden sm:inline text-slate-300 truncate">{beat.genre || 'Hip-Hop'}</span>
                  {beat.mood && (
                    <>
                      <span className="hidden md:inline text-slate-500 shrink-0">•</span>
                      <span className="hidden md:inline text-slate-300 truncate">{beat.mood}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Price & License / Cart Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Starting Price Tag */}
              <div className="text-right hidden xxs:block">
                <span className="text-[10px] line-through text-slate-400 font-mono block">₹{cutPrice}</span>
                <span className="text-xs sm:text-sm font-black text-electric-blue font-mono">
                  ₹{minPrice.toLocaleString()}
                </span>
              </div>

              {/* Licenses Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLicenseModal(beat);
                }}
                className="px-2 sm:px-3 py-1.5 rounded-xl bg-electric-blue/20 hover:bg-electric-blue border border-electric-blue/50 text-electric-cyan hover:text-white text-[10px] sm:text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Licenses</span>
              </button>

              {/* Quick Add to Cart Button */}
              <button
                type="button"
                onClick={handleQuickAdd}
                title="Add to Cart"
                className="p-1.5 sm:p-2 rounded-xl bg-surface-light hover:bg-surface-border border border-white/15 text-slate-200 hover:text-white text-xs transition-all active:scale-90 flex items-center justify-center cursor-pointer shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-electric-cyan" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const CompactCatalog = memo(CompactCatalogComponent);
