import React from 'react';
import { Shield } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';

export function PrivacyPage() {
  const producerName = brandHelpers.getProducerName(producerBrand);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-electric-cyan text-xs font-mono uppercase tracking-widest mb-2">
        <Shield className="w-4 h-4" />
        <span>Privacy Policy</span>
      </div>
      <h1 className="text-3xl font-black text-white mb-6">Privacy Policy</h1>
      <div className="prose prose-invert text-xs sm:text-sm text-text-muted space-y-4 bg-surface/40 p-6 sm:p-8 rounded-2xl border border-surface-border leading-relaxed">
        <p>
          At {producerName}, we respect your personal information and privacy. This Privacy Policy details the data collected when you visit our website, preview audio instrumentals, purchase commercial licenses, and download digital assets.
        </p>
        <h2 className="text-white text-base font-bold pt-2">1. Information We Collect</h2>
        <p>
          When you place an order, we collect your artist or business name and email address to fulfill digital download delivery, issue your legal license agreement, and generate transactional receipts. We do not store sensitive payment card information on our servers; all payment transactions are handled through Razorpay.
        </p>
        <h2 className="text-white text-base font-bold pt-2">2. How Data is Used</h2>
        <p>
          Your information is solely utilized to process transactions, prevent fraud, generate tamper-proof license agreements, and provide customer support. We do not sell or share customer data with third-party advertisers.
        </p>
      </div>
    </div>
  );
}
