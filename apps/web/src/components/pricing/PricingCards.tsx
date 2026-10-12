import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { LicenseDTO } from '@shared/types';

interface PricingCardsProps {
  licenses?: LicenseDTO[];
  onChooseLicense?: (license: LicenseDTO) => void;
}

export function PricingCards({ licenses = [], onChooseLicense }: PricingCardsProps) {
  const nonExLicense = licenses.find((l) => !l.isExclusive && l.name !== 'EXCLUSIVE') || {
    id: 'default-non-exclusive',
    name: 'NON_EXCLUSIVE',
    displayName: 'Non-Exclusive License',
    price: 499,
  } as LicenseDTO;

  const exLicense = licenses.find((l) => l.isExclusive || l.name === 'EXCLUSIVE') || {
    id: 'default-exclusive',
    name: 'EXCLUSIVE',
    displayName: 'Exclusive License',
    price: 4999,
  } as LicenseDTO;

  const handleChoose = (lic: LicenseDTO) => {
    if (onChooseLicense) {
      onChooseLicense(lic);
    }
  };

  return (
    /* Side-by-Side (Aju-Baju) 2-Column Grid on both Mobile and Desktop with 3D Perspective */
    <div
      className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 w-full max-w-5xl mx-auto px-1 sm:px-2 md:px-4 mt-4 sm:mt-6"
      style={{ perspective: '1200px' }}
    >
      {/* CARD 1: Non-Exclusive License */}
      <div className="animate-float-3d bg-gradient-to-b from-[#0c122a] via-[#090e20] to-[#060914] border border-blue-500/40 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-blue-400/80 group">
        {/* Ambient Radial Backlight */}
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono font-bold text-blue-400 uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 truncate">
              Standard Lease
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono text-emerald-400 font-bold hidden sm:inline">
              Instant PDF Clearance
            </span>
          </div>

          <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white mt-0.5 sm:mt-1 leading-tight tracking-tight">
            Non-Exclusive
          </h3>

          {/* Subtitle in brackets to help buyers understand */}
          <p className="text-[9px] sm:text-xs md:text-sm text-cyan-300 font-medium mt-1 sm:mt-1.5 leading-snug bg-blue-950/50 border border-blue-500/20 rounded-lg p-1.5 sm:p-2">
            (Multiple artists can lease; you retain 100% performance royalties)
          </p>

          <p className="text-[10px] sm:text-xs text-slate-300 mt-1.5 sm:mt-2.5 leading-relaxed hidden sm:block">
            Studio master audio files for commercial streaming, singles, and music video releases.
          </p>

          {/* Price Block: ₹999 slashed to ₹499 */}
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs md:text-sm line-through text-slate-400">₹999</span>
              <span className="text-[8px] sm:text-[10px] md:text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 sm:py-0.5 rounded font-mono font-bold">
                50% OFF
              </span>
            </div>
            <div className="text-xl sm:text-2xl md:text-4xl font-black text-white mt-0.5 sm:mt-1 tracking-tight flex items-baseline gap-1">
              <span>₹499</span>
              <span className="text-[9px] sm:text-xs font-normal text-slate-400">/ lease</span>
            </div>
          </div>

          {/* Feature List */}
          <ul className="text-[9px] sm:text-xs text-slate-200 space-y-1.5 sm:space-y-2.5 mt-2.5 sm:mt-5 flex-1">
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Audio:</strong> 24-Bit WAV + MP3</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Streams:</strong> Up to 500k Streams</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Distribution:</strong> 10k copies</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Videos:</strong> Up to 2 Music Videos</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Rights:</strong> Signed PDF Contract</span>
            </li>
          </ul>
        </div>

        {onChooseLicense ? (
          <button
            type="button"
            onClick={() => handleChoose(nonExLicense)}
            className="w-full mt-3 sm:mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider py-2 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-glow-blue cursor-pointer border-0"
          >
            Lease (₹499)
          </button>
        ) : (
          <Link
            to="/beats"
            className="w-full mt-3 sm:mt-6 block text-center bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider py-2 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-glow-blue cursor-pointer"
          >
            Lease (₹499)
          </Link>
        )}
      </div>

      {/* CARD 2: Exclusive License */}
      <div
        className="animate-float-3d bg-gradient-to-b from-[#0c1c24] via-[#08151c] to-[#050d12] border border-teal-500/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-teal-400/80 group"
        style={{ animationDelay: '1.5s' }}
      >
        {/* Ambient Radial Backlight */}
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono font-bold text-teal-300 uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center gap-1 truncate">
              <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-teal-300 shrink-0" />
              <span>Full Buyout</span>
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs font-mono text-cyan-300 font-bold hidden sm:inline">
              Permanently Removed
            </span>
          </div>

          <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white mt-0.5 sm:mt-1 leading-tight tracking-tight">
            Exclusive
          </h3>

          {/* Subtitle in brackets to help buyers understand */}
          <p className="text-[9px] sm:text-xs md:text-sm text-teal-200 font-medium mt-1 sm:mt-1.5 leading-snug bg-teal-950/50 border border-teal-500/30 rounded-lg p-1.5 sm:p-2">
            (Full ownership rights; beat is removed from store permanently after purchase)
          </p>

          <p className="text-[10px] sm:text-xs text-slate-300 mt-1.5 sm:mt-2.5 leading-relaxed hidden sm:block">
            Complete master rights transfer. No other artist can ever lease or purchase this instrumental.
          </p>

          {/* Price Block: ₹11,999 slashed to ₹4,999 */}
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs md:text-sm line-through text-slate-400">₹11,999</span>
              <span className="text-[8px] sm:text-[10px] md:text-xs bg-teal-950/80 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 sm:py-0.5 rounded font-mono font-bold">
                Special
              </span>
            </div>
            <div className="text-xl sm:text-2xl md:text-4xl font-black text-white mt-0.5 sm:mt-1 tracking-tight flex items-baseline gap-1">
              <span>₹4,999</span>
              <span className="text-[9px] sm:text-xs font-normal text-slate-400">/ buyout</span>
            </div>
          </div>

          {/* Feature List */}
          <ul className="text-[9px] sm:text-xs text-slate-200 space-y-1.5 sm:space-y-2.5 mt-2.5 sm:mt-5 flex-1">
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Ownership:</strong> 100% Master Ownership</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Catalog:</strong> Permanently Locked</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Streams:</strong> UNLIMITED on all DSPs</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Broadcast:</strong> TV, Film & Commercial Sync</span>
            </li>
            <li className="flex items-start gap-1 sm:gap-2">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[3]" />
              </span>
              <span><strong>Legal:</strong> Cryptographic Certificate</span>
            </li>
          </ul>
        </div>

        {onChooseLicense ? (
          <button
            type="button"
            onClick={() => handleChoose(exLicense)}
            className="w-full mt-3 sm:mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider py-2 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.35)] cursor-pointer border-0"
          >
            Buyout (₹4,999)
          </button>
        ) : (
          <Link
            to="/beats"
            className="w-full mt-3 sm:mt-6 block text-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider py-2 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.35)] cursor-pointer"
          >
            Buyout (₹4,999)
          </Link>
        )}
      </div>
    </div>
  );
}
