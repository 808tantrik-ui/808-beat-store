import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ShieldCheck, ShoppingCart, Sparkles, Music, Lock } from 'lucide-react';
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

  const defaultLicenses: LicenseDTO[] = [
    {
      id: 'default-non-exclusive',
      name: 'NON_EXCLUSIVE',
      displayName: 'Non-Exclusive License',
      price: brandHelpers.getNonExclusivePrice(producerBrand),
      defaultPrice: brandHelpers.getNonExclusivePrice(producerBrand),
      description: 'Ideal for independent singles, streaming releases, and music videos.',
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
      price: brandHelpers.getExclusivePrice(producerBrand),
      defaultPrice: brandHelpers.getExclusivePrice(producerBrand),
      description: 'Full sole ownership transfer. The beat is permanently archived and removed from store.',
      includedFiles: ['MP3', 'WAV', 'LICENSE_PDF', 'LEGAL_CONTRACT'],
      commercialUsage: 'Unlimited Commercial Streams & Sync Licensing',
      streamingLimit: null,
      distributionLimit: null,
      musicVideoLimit: null,
      radioBroadcasting: true,
      forProfitPerformances: true,
      creditRequirement: 'Prod. by [PRODUCER_NAME]',
      isExclusive: true,
    },
  ];

  const licenses = beat.availableLicenses && beat.availableLicenses.length > 0
    ? beat.availableLicenses
    : defaultLicenses;
  const activeLicense = licenses.find((l) => l.id === selectedLicenseId) || licenses[0];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-light">
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
              <h2 className="text-lg font-bold text-white leading-tight">{beat.title}</h2>
              <p className="text-xs text-text-muted">Select rights agreement for commercial usage</p>
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
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {licenses.map((lic) => {
            const isSelected = lic.id === (activeLicense?.id || licenses[0]?.id);

            return (
              <div
                key={lic.id}
                onClick={() => setSelectedLicenseId(lic.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-electric-blue/10 border-electric-blue shadow-glow-blue/20'
                    : 'bg-surface-light/40 border-surface-border hover:border-surface-border/80 hover:bg-surface-light'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-electric-blue bg-electric-blue text-white'
                        : 'border-surface-border'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{lic.displayName}</h4>
                      {lic.isExclusive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-electric-violet/20 border border-electric-violet/40 text-[10px] text-electric-violet font-bold uppercase tracking-wider">
                          <Sparkles className="w-2.5 h-2.5" />
                          Exclusive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{lic.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-electric-cyan font-mono">
                      <span>Files: {lic.includedFiles.join(' + ')}</span>
                      <span>•</span>
                      <span>{lic.streamingLimit ? `${lic.streamingLimit.toLocaleString()} Streams` : 'Unlimited Streams'}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-lg font-black text-white">
                    {brandHelpers.formatCurrency(lic.price, producerBrand)}
                  </div>
                  <span className="text-[10px] text-text-subtle uppercase">Instant Delivery</span>
                </div>
              </div>
            );
          })}

          {/* Selected License Features Breakdown */}
          {activeLicense && (
            <div className="p-4 rounded-xl bg-surface-lighter/50 border border-surface-border text-xs text-text-muted mt-4">
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-electric-cyan" />
                <span>Terms Included With {activeLicense.displayName}:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-electric-cyan shrink-0" />
                  <span>{activeLicense.commercialUsage}</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-electric-cyan shrink-0" />
                  <span>Master MP3 & 24-Bit Studio WAV Files</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-electric-cyan shrink-0" />
                  <span>Official Cryptographically Signed PDF License</span>
                </li>
                <li className="flex items-center gap-1.5 text-text">
                  <Check className="w-3.5 h-3.5 text-electric-cyan shrink-0" />
                  <span>{activeLicense.isExclusive ? 'Beat permanently unlisted from store' : 'Commercial Release Clearance'}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-surface-border bg-surface-light flex items-center justify-between gap-3">
          <div className="text-xs text-text-muted">
            Total: <span className="font-bold text-white text-base">{brandHelpers.formatCurrency(activeLicense?.price || 1999, producerBrand)}</span>
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
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
