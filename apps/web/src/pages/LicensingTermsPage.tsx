import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import {
  StudioMicSilhouette,
  StudioSpeakerSilhouette,
} from '../components/common/StudioCornerArt';

interface LicensingTermsPageProps {
  onNavigate?: (route: string) => void;
}

export function LicensingTermsPage({ onNavigate }: LicensingTermsPageProps) {
  const producerName = brandHelpers.getProducerName(producerBrand);
  const copyrightOwner = brandHelpers.getCopyrightOwner(producerBrand);

  return (
    <div className="relative pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto overflow-hidden">
      {/* Soft Radial Electric-Blue Glow behind Header */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#0066FF] opacity-[0.07] blur-[140px] pointer-events-none -z-10" />

      {/* Hip-Hop Studio Corner Silhouettes (Desktop Only) */}
      <StudioMicSilhouette className="top-12 right-4 w-32 h-44" />
      <StudioSpeakerSilhouette className="bottom-12 left-4 w-32 h-44" />

      <Link
        to="/licensing"
        className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-white transition-colors mb-6 relative z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Licensing Overview</span>
      </Link>

      <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-2 relative z-10">
        <Shield className="w-4 h-4" />
        <span>Legal Documentation & Contracts</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 relative z-10">
        Master Music Licensing Terms
      </h1>
      <p className="text-xs sm:text-sm text-text-muted mb-8 leading-relaxed relative z-10">
        Full legal agreements governing commercial usage, digital streaming rights, and exclusive master transfers administered by {producerName} ({copyrightOwner}).
      </p>

      <div className="space-y-10 relative z-10">
        {/* ========================================================================= */}
        {/* SECTION B: NON-EXCLUSIVE MASTER LICENSING AGREEMENT */}
        {/* ========================================================================= */}
        <section className="bg-surface/60 p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/15 border border-electric-blue/30 text-blue-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                  SECTION B
                </span>
                <h2 className="text-xl font-bold text-white">
                  Non-Exclusive Commercial Master License Agreement
                </h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-electric-blue/20 text-blue-300 text-xs font-mono font-bold">
              Standard License (₹500)
            </span>
          </div>

          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <div>
              <h3 className="text-white font-bold text-sm mb-1">1. Parties & Grant of Authority</h3>
              <p>
                This agreement is entered into between the purchasing artist/entity (&ldquo;Licensee&rdquo;) and <strong>{producerName}</strong> (&ldquo;Licensor&rdquo; / &ldquo;Producer&rdquo;), copyright administrator for <strong>{copyrightOwner}</strong>. Licensor grants Licensee a non-exclusive, non-transferable commercial right to record new vocal performances over the master instrumental (&ldquo;Beat&rdquo;) and distribute one (1) derivative musical song across commercial digital platforms.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">2. Permitted Commercial Usage & Streaming Thresholds</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-300">
                <li><strong>Digital Audio Streams:</strong> Up to 500,000 commercial streams across DSPs (Spotify, Apple Music, YouTube Music, Tidal, Amazon Music).</li>
                <li><strong>Physical Copies:</strong> Up to 10,000 units (CD, Vinyl, cassette tapes).</li>
                <li><strong>Music Videos:</strong> Up to 2 commercial monetized videos (YouTube, Vevo).</li>
                <li><strong>Radio & Performance:</strong> Non-commercial and college radio broadcasting, non-profit live performances.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">3. Mandatory Production Credit</h3>
              <p>
                Licensee must prominently display official production credit in all DSP song metadata, title tags, video descriptions, and liner notes formatted exactly as:
              </p>
              <div className="p-3 my-2 rounded-xl bg-surface-light border border-surface-border font-mono text-blue-400 font-bold text-xs inline-block">
                (Prod. by 808 Tantrik)
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">4. Underlying Master Copyright Retention</h3>
              <p>
                The Licensor retains 100% of underlying musical master copyright, publishing share, and composer rights. Licensee owns 100% of their added original lyrics and vocal recording tracks.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION C: EXCLUSIVE MASTER RIGHTS TRANSFER AGREEMENT */}
        {/* ========================================================================= */}
        <section className="bg-surface/60 p-6 sm:p-8 rounded-3xl border border-electric-blue/40 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/15 border border-electric-blue/30 text-electric-blue flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                  SECTION C
                </span>
                <h2 className="text-xl font-bold text-white">
                  Exclusive Master Rights Transfer & Assignment Agreement
                </h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-electric-blue/20 text-electric-blue text-xs font-mono font-bold">
              Exclusive License (₹5,000)
            </span>
          </div>

          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <div>
              <h3 className="text-white font-bold text-sm mb-1">1. Irrevocable Assignment of Sole Master Rights</h3>
              <p>
                Upon verified settlement of the purchase fee, Licensor (<strong>{producerName}</strong> / <strong>{copyrightOwner}</strong>) irrevocably conveys, assigns, and transfers to Licensee sole and exclusive commercial recording, publishing, sync, and global distribution rights in the purchased master instrumental.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">2. Permanent Market Archival & Non-Resale Guarantee</h3>
              <p>
                Licensor guarantees that upon completion of the transaction, the beat is automatically and permanently archived, unlisted, and removed from sale on the Beat Store. Licensor covenants that no further licenses (exclusive or non-exclusive) shall ever be granted to any third party.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">3. Unlimited Commercial Distribution Allowance</h3>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-300">
                <li><strong>Digital Audio Streams:</strong> UNLIMITED commercial streams worldwide across all digital streaming platforms.</li>
                <li><strong>Physical Copies:</strong> UNLIMITED physical duplication (CD, Vinyl, Cassettes).</li>
                <li><strong>Music Videos & Sync:</strong> UNLIMITED commercial monetization and video synchronization.</li>
                <li><strong>Radio & Film/TV:</strong> UNLIMITED terrestrial/satellite radio broadcasting and sync placement clearance.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">4. Credit & Publishing Administration</h3>
              <p>
                Licensee agrees to provide standard production credit formatted as: <code>(Prod. by 808 Tantrik)</code> in commercial metadata. Mechanical, performance, and writer splits are executed pursuant to standard industry master rights transfers.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1">5. Cryptographic SHA-256 Authenticity & Ledger Verification</h3>
              <p>
                Each Exclusive transaction generates a legally binding, signed PDF certificate with a cryptographic SHA-256 signature hash verifiable 24/7 at <code>/verify-license/:licenseId</code>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
