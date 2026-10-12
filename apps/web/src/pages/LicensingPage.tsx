import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, ShieldCheck, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { LicenseDTO } from '@shared/types';
import { PricingCards } from '../components/pricing/PricingCards';
import {
  StudioMicSilhouette,
  StudioSpeakerSilhouette,
} from '../components/common/StudioCornerArt';

interface LicensingPageProps {
  licenses: LicenseDTO[];
  onNavigate?: (route: string) => void;
}

export function LicensingPage({ licenses, onNavigate }: LicensingPageProps) {
  const navigate = useNavigate();
  const producerName = brandHelpers.getProducerName(producerBrand);

  const nonExPrice = brandHelpers.getNonExclusivePrice(producerBrand);
  const exPrice = brandHelpers.getExclusivePrice(producerBrand);

  const faqs = [
    {
      q: 'What is the difference between Non-Exclusive and Exclusive licenses?',
      a: 'A Non-Exclusive license grants you commercial recording and release rights on streaming platforms (Spotify, Apple Music, YouTube) while the producer retains underlying copyright. An Exclusive license transfers sole master rights to you, and the beat is permanently archived and unlisted from the beat store so no one else can purchase it.',
    },
    {
      q: 'How does digital file delivery work after purchase?',
      a: 'Immediately upon verified Razorpay payment, you receive instant access to cryptographically secure download links for your uncompressed 24-bit master WAV and 320kbps MP3 audio files, along with your official signed PDF license agreement.',
    },
    {
      q: 'Do I have to credit the producer in my song title or description?',
      a: `Yes, for Non-Exclusive agreements you must credit in metadata or liner notes: (Prod. by ${producerName}). For Exclusive agreements, standard industry production credits apply.`,
    },
  ];

  return (
    <div className="relative pt-28 pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Soft Radial Electric-Blue Glow behind Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[350px] rounded-full bg-[#0066FF] opacity-[0.08] blur-[150px] pointer-events-none -z-10" />

      {/* Hip-Hop Studio Corner Silhouettes (Desktop Only, 5-8% opacity) */}
      <StudioMicSilhouette className="top-10 right-6 w-36 h-48" />
      <StudioSpeakerSilhouette className="bottom-12 left-6 w-36 h-48" />

      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-lighter border border-surface-border text-electric-blue text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transparent Music Business</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Commercial Music Rights
        </h1>
        <p className="text-text-muted text-sm sm:text-base mt-2">
          Transparent, artist-friendly legal licenses. Commercial streaming clearance and instant delivery.
        </p>
      </div>

      {/* Pricing Cards Grid with CHOOSE LICENSE & Styled Tiers */}
      <div className="mb-16 relative z-10">
        <PricingCards licenses={licenses} onChooseLicense={() => navigate('/beats')} />
      </div>

      {/* Feature Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-md mb-16 max-w-4xl mx-auto relative z-10 content-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-xs font-mono uppercase tracking-wider bg-surface-light/60">
              <th className="py-4 px-6 text-white font-bold">Feature & Rights</th>
              <th className="py-4 px-6 text-center text-blue-400">Non-Exclusive</th>
              <th className="py-4 px-6 text-center text-electric-blue">Exclusive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/40 text-xs">
            <tr>
              <td className="py-4 px-6 font-semibold text-white">Starting Price</td>
              <td className="py-4 px-6 text-center">
                <span className="text-xs line-through text-slate-400 block font-mono">₹499</span>
                <span className="font-black text-white text-base">₹{nonExPrice}</span>
                <span className="text-[9px] text-orange-400 font-bold block mt-0.5">Limited Time 🔥</span>
              </td>
              <td className="py-4 px-6 text-center bg-amber-500/5">
                <span className="text-xs line-through text-slate-400 block font-mono">₹5,999</span>
                <span className="font-black text-amber-400 text-lg">₹{exPrice}</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full inline-block mt-0.5 border border-amber-500/30">
                  ★ BEST VALUE 🔥
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Master Audio MP3 (320kbps)</td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">24-Bit Studio Master WAV</td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Commercial Audio Streams Allowance</td>
              <td className="py-4 px-6 text-center font-mono">Up to 500,000</td>
              <td className="py-4 px-6 text-center font-mono font-bold text-electric-violet">UNLIMITED</td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Physical Manufacturing Distribution</td>
              <td className="py-4 px-6 text-center font-mono">Up to 10,000 Copies</td>
              <td className="py-4 px-6 text-center font-mono font-bold text-electric-violet">UNLIMITED</td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Music Videos Monetization</td>
              <td className="py-4 px-6 text-center">2 Commercial Videos</td>
              <td className="py-4 px-6 text-center font-bold text-electric-violet">UNLIMITED</td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Radio Broadcasting & Sync Clearance</td>
              <td className="py-4 px-6 text-center">2 Stations</td>
              <td className="py-4 px-6 text-center font-bold text-electric-violet">UNLIMITED</td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Beat Automatically Archived from Store</td>
              <td className="py-4 px-6 text-center text-text-subtle"><X className="w-4 h-4 mx-auto" /></td>
              <td className="py-4 px-6 text-center font-bold text-electric-violet"><Check className="w-4 h-4 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-text-muted">Official Cryptographically Signed PDF</td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
              <td className="py-4 px-6 text-center text-electric-cyan"><Check className="w-4 h-4 mx-auto" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Link to Full Licensing Terms */}
      <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 mb-16">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-electric-cyan shrink-0" />
          <div>
            <h4 className="font-bold text-white text-base">Full Legal Licensing Terms</h4>
            <p className="text-xs text-text-muted">Review the complete, unedited producer rights contract clauses and legal obligations.</p>
          </div>
        </div>

        <Link
          to="/licensing-terms"
          className="px-5 py-2.5 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold flex items-center gap-2 border border-surface-border shrink-0 transition-all"
        >
          <span>Read Full Terms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto content-auto">
        <div className="flex items-center gap-2 text-white font-bold text-xl mb-6">
          <HelpCircle className="w-5 h-5 text-electric-cyan" />
          <span>Frequently Asked Questions</span>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-5 rounded-xl bg-surface/60 border border-surface-border">
              <h4 className="font-bold text-white text-sm mb-2">{f.q}</h4>
              <p className="text-xs text-text-muted leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
