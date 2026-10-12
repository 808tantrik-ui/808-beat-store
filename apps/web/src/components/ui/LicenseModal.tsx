import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ShieldCheck, ShoppingCart, Sparkles, Flame, Crown } from 'lucide-react';
import { BeatDTO, LicenseDTO } from '@shared/types';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { producerBrand, brandHelpers } from '@config/brand';

interface LicenseModalProps {
  beat: BeatDTO | null;
  onClose: () => void;
  onNavigateCheckout?: () => void;
}

export function LicenseModal({ beat, onClose, onNavigateCheckout }: LicenseModalProps) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useModalStore();
  const [selectedLicenseId, setSelectedLicenseId] = useState<string>('');

  if (!beat) return null;

  const nonExPrice = brandHelpers.getNonExclusivePrice(producerBrand); // 49
  const nonExListPrice = brandHelpers.getNonExclusiveListPrice(producerBrand); // 499
  const exPrice = brandHelpers.getExclusivePrice(producerBrand); // 499
  const exListPrice = brandHelpers.getExclusiveListPrice(producerBrand); // 5999

  const defaultLicenses: LicenseDTO[] = [
    {
      id: 'default-non-exclusive',
      name: 'NON_EXCLUSIVE',
      displayName: 'Non-Exclusive License',
      price: nonExPrice,
      defaultPrice: nonExListPrice,
      description: 'Standard lease for independent singles, DSP streaming (Spotify/Apple Music), and YouTube.',
      includedFiles: ['MP3', 'WAV', 'LICENSE_PDF'],
      commercialUsage: 'Commercial streaming & distribution clearance',
      streamingLimit: 500000,
      distributionLimit: 10000,
      musicVideoLimit: 2,
      radioBroadcasting: true,
      forProfitPerformances: true,
      creditRequirement: 'Prod. by [PRODUCER_NAME]',
      isExclusive: false,
    },
    {
      id: 'default-exclusive',
      name: 'EXCLUSIVE',
      displayName: 'Exclusive License',
      price: exPrice,
      defaultPrice: exListPrice,
      description: '🔥 100% Full Sole Master Ownership. The beat is permanently deleted from store upon purchase!',
      includedFiles: ['MP3', 'WAV', 'LICENSE_PDF', 'LEGAL_CONTRACT'],
      commercialUsage: 'Unlimited Commercial Streams, Radio, TV & Worldwide Sync',
      streamingLimit: null,
      distributionLimit: null,
      musicVideoLimit: null,
      radioBroadcasting: true,
      forProfitPerformances: true,
      creditRequirement: 'Prod. by [PRODUCER_NAME]',
      isExclusive: true,
    },
  ];

  const rawLicenses = beat.availableLicenses && beat.availableLicenses.length > 0
    ? beat.availableLicenses
    : defaultLicenses;

  // Ensure current active promotional prices are mapped correctly
  const licenses = rawLicenses.map((lic) => {
    const isEx = lic.isExclusive || lic.name === 'EXCLUSIVE';
    return {
      ...lic,
      price: isEx ? exPrice : nonExPrice,
      defaultPrice: isEx ? exListPrice : nonExListPrice,
    };
  });

  const activeLicense = licenses.find((l) => l.id === selectedLicenseId) || licenses[1] || licenses[0]; // defaults to exclusive for high value upsell

  const handleAddToCart = (redirect = false) => {
    if (activeLicense) {
      addItem(beat, activeLicense);
      onClose();
      if (redirect) {
        if (!isAuthenticated) {
          openAuthModal('buy_now');
        } else if (onNavigateCheckout) {
          onNavigateCheckout();
        } else {
          navigate('/checkout');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#0c0d14] border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between bg-surface-light">
          <div className="flex items-center gap-3">
            <img
              src={beat.artwork}
              alt={beat.title}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-lg object-cover border border-surface-border shrink-0"
            />
            <div>
              <span className="text-[10px] font-mono text-electric-cyan uppercase whitespace-nowrap block">
                {beat.bpm} BPM • {beat.key}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{beat.title}</h2>
              <p className="text-[11px] text-text-muted">Select commercial rights agreement below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* License Options List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {licenses.map((lic) => {
            const isSelected = lic.id === (activeLicense?.id || licenses[0]?.id);
            const isExclusive = lic.isExclusive || lic.name === 'EXCLUSIVE';
            const cutPrice = isExclusive ? exListPrice : nonExListPrice;
            const currentPrice = isExclusive ? exPrice : nonExPrice;

            return (
              <div
                key={lic.id}
                onClick={() => setSelectedLicenseId(lic.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isExclusive
                    ? isSelected
                      ? 'bg-amber-950/20 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                      : 'bg-surface-light/40 border-amber-500/40 hover:border-amber-400/80 hover:bg-surface-light'
                    : isSelected
                    ? 'bg-electric-blue/10 border-electric-blue shadow-glow-blue/20'
                    : 'bg-surface-light/40 border-surface-border hover:border-surface-border/80 hover:bg-surface-light'
                }`}
              >
                {/* Highlight Badge for Exclusive */}
                {isExclusive && (
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                    <Crown className="w-3 h-3 fill-black" />
                    <span>RECOMMENDED / BEST VALUE</span>
                  </div>
                )}

                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? isExclusive ? 'border-amber-400 bg-amber-400 text-black' : 'border-electric-blue bg-electric-blue text-white'
                        : 'border-surface-border'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{lic.displayName}</h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">
                        <Flame className="w-2.5 h-2.5 fill-orange-400" />
                        <span>Limited Time Only 🔥</span>
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-snug">{lic.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-electric-cyan font-mono">
                      <span>Files: {lic.includedFiles.join(' + ')}</span>
                      <span>•</span>
                      <span>{lic.streamingLimit ? `${lic.streamingLimit.toLocaleString()} Streams` : 'Unlimited Streams'}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-border/50">
                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 sm:gap-0">
                    <span className="text-xs line-through text-slate-400 font-mono">₹{cutPrice.toLocaleString()}</span>
                    <div className={`text-xl font-black ${isExclusive ? 'text-amber-400' : 'text-white'}`}>
                      ₹{currentPrice.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Instant Download
                  </span>
                </div>
              </div>
            );
          })}

          {/* Selected License Features Breakdown */}
          {activeLicense && (
            <div className="p-4 rounded-xl bg-surface-lighter/50 border border-surface-border text-xs text-text-muted mt-4">
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-electric-cyan" />
                <span>Included With {activeLicense.displayName}:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{activeLicense.commercialUsage}</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Master MP3 & 24-Bit Studio Master WAV</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cryptographically Verified PDF License Agreement</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{activeLicense.isExclusive ? 'Beat permanently deleted from store' : 'Commercial Release Clearance'}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-surface-border bg-surface-light flex items-center justify-between gap-3">
          <div className="text-xs text-text-muted">
            Payable: <span className="font-black text-white text-base">₹{(activeLicense?.price || nonExPrice).toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddToCart(false)}
              className="px-4 py-2.5 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold border border-surface-border flex items-center gap-1.5 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add To Cart</span>
            </button>

            <button
              onClick={() => handleAddToCart(true)}
              className="px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold shadow-glow-blue transition-all"
            >
              Buy Now (₹{(activeLicense?.price || nonExPrice).toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
