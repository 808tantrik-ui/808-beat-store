import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, Flame, Crown, ShieldCheck } from 'lucide-react';
import { LicenseDTO } from '@shared/types';
import { producerBrand, brandHelpers } from '@config/brand';

interface PricingCardsProps {
  licenses?: LicenseDTO[];
  onChooseLicense?: (license: LicenseDTO) => void;
}

export function PricingCards({ licenses = [], onChooseLicense }: PricingCardsProps) {
  const nonExPrice = brandHelpers.getNonExclusivePrice(producerBrand); // 49
  const nonExListPrice = brandHelpers.getNonExclusiveListPrice(producerBrand); // 499
  const exPrice = brandHelpers.getExclusivePrice(producerBrand); // 499
  const exListPrice = brandHelpers.getExclusiveListPrice(producerBrand); // 5999

  const nonExLicense = licenses.find((l) => !l.isExclusive && l.name !== 'EXCLUSIVE') || {
    id: 'default-non-exclusive',
    name: 'NON_EXCLUSIVE',
    displayName: 'Non-Exclusive License',
    price: nonExPrice,
  } as LicenseDTO;

  const exLicense = licenses.find((l) => l.isExclusive || l.name === 'EXCLUSIVE') || {
    id: 'default-exclusive',
    name: 'EXCLUSIVE',
    displayName: 'Exclusive License',
    price: exPrice,
  } as LicenseDTO;

  const handleChoose = (lic: LicenseDTO) => {
    if (onChooseLicense) {
      onChooseLicense(lic);
    }
  };

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl mx-auto px-2 sm:px-4 mt-4 sm:mt-6"
      style={{ perspective: '1200px' }}
    >
      {/* CARD 1: Non-Exclusive License (₹49) */}
      <div className="bg-gradient-to-b from-[#0c122a] via-[#090e20] to-[#060914] border border-blue-500/40 hover:border-blue-400 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-400 uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Standard Lease
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span>Limited Time Only 🔥</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
            Non-Exclusive License
          </h3>

          <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-2 leading-snug bg-blue-950/50 border border-blue-500/20 rounded-xl p-2.5">
            Commercial streaming clearance for singles & music videos. Release on Spotify, Apple Music, and YouTube while keeping 100% royalties.
          </p>

          {/* Pricing: ₹499 slashed to ₹49 */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base line-through text-slate-400 font-mono">₹{nonExListPrice}</span>
              <span className="text-[10px] sm:text-xs bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                90% OFF PROMO
              </span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-1 tracking-tight flex items-baseline gap-1.5">
              <span className="text-electric-blue">₹{nonExPrice}</span>
              <span className="text-xs font-normal text-slate-400">/ single lease</span>
            </div>
          </div>

          {/* Features */}
          <ul className="text-xs text-slate-200 space-y-2.5 mt-5 flex-1">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Studio Files:</strong> Uncompressed 24-Bit WAV + 320kbps MP3</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Streaming Limit:</strong> Up to 500,000 Streams Allowed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Music Videos:</strong> Up to 2 Commercial Music Videos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Legal Clearance:</strong> Cryptographically Signed PDF Agreement</span>
            </li>
          </ul>
        </div>

        {onChooseLicense ? (
          <button
            type="button"
            onClick={() => handleChoose(nonExLicense)}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-95 shadow-glow-blue cursor-pointer border-0"
          >
            Lease Now for ₹{nonExPrice}
          </button>
        ) : (
          <Link
            to="/beats"
            className="w-full mt-6 block text-center bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-95 shadow-glow-blue cursor-pointer"
          >
            Lease Now for ₹{nonExPrice}
          </Link>
        )}
      </div>

      {/* CARD 2: Exclusive License (₹499 - RECOMMENDED / BEST VALUE) */}
      <div className="bg-gradient-to-b from-[#131b2e] via-[#0b1522] to-[#060c14] border-2 border-amber-400/80 rounded-2xl md:rounded-3xl p-5 md:p-8 flex flex-col justify-between shadow-[0_0_35px_rgba(251,191,36,0.2)] relative overflow-hidden transition-all duration-300 hover:border-amber-300 group">
        {/* Glow corner ambient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Recommendation Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-1.5 px-4 text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black flex items-center justify-center gap-1.5">
            <Crown className="w-3.5 h-3.5 fill-black" />
            <span>RECOMMENDED / BEST VALUE — FULL OWNERSHIP</span>
          </span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col pt-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Full Sole Buyout</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full animate-pulse">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span>Limited Time Only 🔥</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
            Exclusive License
          </h3>

          <p className="text-xs sm:text-sm text-amber-200/90 font-medium mt-2 leading-snug bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5">
            🔥 <strong>100% Sole Ownership Rights Transfer.</strong> The beat is permanently deleted and unlisted from the store. No other artist can ever buy or use this track again!
          </p>

          {/* Pricing: ₹5,999 slashed to ₹499 */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base line-through text-slate-400 font-mono">₹{exListPrice.toLocaleString()}</span>
              <span className="text-[10px] sm:text-xs bg-amber-950/90 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-black">
                SAVE ₹{(exListPrice - exPrice).toLocaleString()} (92% OFF)
              </span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 mt-1 tracking-tight flex items-baseline gap-1.5">
              <span>₹{exPrice}</span>
              <span className="text-xs font-normal text-slate-400">/ sole buyout</span>
            </div>
          </div>

          {/* Features */}
          <ul className="text-xs text-slate-200 space-y-2.5 mt-5 flex-1">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Full Ownership:</strong> 100% Master & Publishing Rights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Permanently Archived:</strong> Beat removed from store forever</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Unlimited Streams:</strong> Zero stream caps on Spotify, Apple, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Sync & Commercial:</strong> TV, Film, Radio & Worldwide Sync</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span><strong>Studio Package:</strong> 24-Bit WAV + MP3 + Signed Legal Contract</span>
            </li>
          </ul>
        </div>

        {onChooseLicense ? (
          <button
            type="button"
            onClick={() => handleChoose(exLicense)}
            className="w-full mt-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer border-0"
          >
            Claim Exclusive for ₹{exPrice}
          </button>
        ) : (
          <Link
            to="/beats"
            className="w-full mt-6 block text-center bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            Claim Exclusive for ₹{exPrice}
          </Link>
        )}
      </div>
    </div>
  );
}
