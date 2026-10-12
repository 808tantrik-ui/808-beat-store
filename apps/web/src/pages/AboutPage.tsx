import React from 'react';
import { Link } from 'react-router-dom';
import { Disc, Mic2, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { Studio360Viewer } from '../components/ui/Studio360Viewer';

interface AboutPageProps {
  onNavigate?: (route: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const producerName = brandHelpers.getProducerName(producerBrand);
  const tagline = brandHelpers.getTagline(producerBrand);
  const location = brandHelpers.getLocation(producerBrand);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-lighter border border-surface-border text-electric-cyan text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production Philosophy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About {producerName}
        </h1>

        {tagline && (
          <p className="text-base sm:text-lg text-text-muted font-normal max-w-xl mx-auto">
            {tagline}
          </p>
        )}
      </div>

      {/* Interactive 360 Studio Tour */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Virtual Studio Tour
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Experience the acoustics, hardware rack, and production room in 360°
            </p>
          </div>
        </div>
        <Studio360Viewer imageSrc="/studio-front-360.jpg" autoRotate={true} />
      </section>

      {/* Production Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface/70 border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-electric-blue/10 border border-electric-blue/30 text-electric-blue flex items-center justify-center">
            <Mic2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Pure Hip-Hop Discipline</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Our catalog is strictly dedicated to authentic hip-hop production: boom-bap, lo-fi, melodic, soulful, and cinematic compositions designed to elevate vocal artists.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface/70 border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-electric-violet/10 border border-electric-violet/30 text-electric-violet flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Studio Master Audio</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every beat is engineered with full dynamic headroom and delivered in uncompressed 24-bit WAV & 320kbps MP3 formats for pristine vocal blending.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface/70 border border-surface-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Commercial Clearance</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every transaction is accompanied by an authentic cryptographically signed legal certificate granting commercial streaming, synchronisation, and broadcast rights.
          </p>
        </div>
      </div>

      {/* Studio Location & Contact Teaser */}
      <div className="p-8 rounded-2xl bg-surface border border-surface-border text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Custom Production Inquiries</h3>
        <p className="text-xs text-text-muted max-w-lg mx-auto">
          Need custom exclusive production, film synchronization scores, or tailored vocal mixing? Get in touch with our studio team.
        </p>
        {location && (
          <div className="text-xs text-text-subtle font-mono">
            Operating from: {location}
          </div>
        )}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="inline-block px-6 py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white font-bold text-xs uppercase tracking-wider shadow-glow-blue transition-all"
          >
            Contact Studio
          </Link>
          <a
            href="https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pink-600/15 hover:bg-pink-600/25 border border-pink-500/30 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-105"
          >
            <svg className="w-3.5 h-3.5 fill-pink-500" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
