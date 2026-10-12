import React from 'react';
import { Shield } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';

export function TermsPage() {
  const producerName = brandHelpers.getProducerName(producerBrand);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-electric-cyan text-xs font-mono uppercase tracking-widest mb-2">
        <Shield className="w-4 h-4" />
        <span>Terms of Service</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-6">Terms & Conditions of Service</h1>
      <div className="prose prose-invert text-xs sm:text-sm text-text-muted space-y-4 bg-surface/40 p-6 sm:p-8 rounded-2xl border border-surface-border leading-relaxed">
        <p>
          Welcome to {producerName}. By accessing our beat store and previewing or licensing audio tracks, you agree to comply with and be bound by the following terms and commercial licensing conditions.
        </p>
        <h2 className="text-white text-base font-bold pt-2">1. Digital Purchases & Immediate Delivery</h2>
        <p>
          All audio products (MP3, 24-Bit WAV, and PDF License Agreements) are digital downloads delivered immediately upon verified payment. Because digital master files cannot be returned, all sales are final once download access is generated.
        </p>
        <h2 className="text-white text-base font-bold pt-2">2. Intellectual Property & Copyright</h2>
        <p>
          All instrumental compositions and audio masters remain the intellectual property of the producer until and unless an Exclusive Rights agreement is executed. Purchasing a non-exclusive license does not grant underlying master publishing ownership.
        </p>
      </div>
    </div>
  );
}
