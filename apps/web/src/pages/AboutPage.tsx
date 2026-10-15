import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic2,
  ShieldCheck,
  Sparkles,
  Sliders,
  Compass,
  Award,
  Music2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Studio360Viewer } from '../components/ui/Studio360Viewer';
import { openInstagram, openYouTube, OFFICIAL_SOCIALS } from '../utils/deepLinks';

interface AboutPageProps {
  onNavigate?: (route: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const producerName = "808 Tantrik";

  return (
    <div className="pt-24 sm:pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Official Producer Profile</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          ABOUT <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">808 TANTRIK</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
          Architect of modern low-end frequencies, cinematic atmospheres, and industry-grade hip-hop instrumentals engineered for world-class vocalists.
        </p>

        {/* Verified Producer Credential Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master Producer & Audio Engineer</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Commercial Clearance</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-purple-300">
            <Music2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Mumbai, India • Global Catalog</span>
          </span>
        </div>
      </div>

      {/* Narrative & Sonic Philosophy */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0c0d1a]/80 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
          <Flame className="w-4 h-4 fill-cyan-400" />
          <span>The Sonic Mission</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Engineering Beats That Command the Room
        </h2>

        <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          <p>
            Operating under the moniker <strong className="text-white">808 Tantrik</strong>, the philosophy behind the 808 Beat Store is rooted in surgical precision and raw hip-hop discipline. In an era saturated with generic loops and muddy mixes, 808 Tantrik crafts original, evocative soundscapes that provide artists with an undeniable canvas.
          </p>
          <p>
            Every production is constructed with intentional dynamics: earth-shattering 808 subs tuned down to fundamental Hz, punchy transient-shaped kicks, haunting melodies, and meticulously carved pocket space designed specifically for vocal delivery. Whether you are cutting melodic drill, soulful boom-bap, atmospheric trap, or aggressive DHH records, each instrumental offers radio-ready dynamic headroom (-6dB true peak) for seamless vocal tracking and commercial mastering.
          </p>
          <p>
            With instant automated delivery, cryptographically signed licensing agreements, and multi-track WAV stems, 808 Tantrik bridges the gap between independent recording artists and world-class commercial music production.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block text-xl sm:text-2xl font-black text-cyan-400 font-mono">24-Bit</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Studio WAV Quality</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Royalty-Free Keeps</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block text-xl sm:text-2xl font-black text-purple-400 font-mono">Multi-Stem</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Trackouts Included</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="block text-xl sm:text-2xl font-black text-amber-400 font-mono">Instant</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Digital Vault Access</span>
          </div>
        </div>
      </div>

      {/* Interactive 360 Studio Tour */}
      <section id="virtual-tour" className="space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Acoustic Control Room</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Virtual 360° Studio Tour
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Explore the acoustics, hardware rack, and production room where 808 Tantrik crafts every beat in full 360°.
            </p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
          <Studio360Viewer imageSrc="/studio-front-360.jpg" autoRotate={true} />
        </div>
      </section>

      {/* Production Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#0c0d1a]/80 border border-white/10 space-y-3 hover:border-cyan-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Mic2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Pure Hip-Hop Discipline</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            From gritty underground boom-bap to aggressive drill and melodic anthems, our instrumentals prioritize lyrical expression, verse flow, and unforgettable hook foundations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0d1a]/80 border border-white/10 space-y-3 hover:border-purple-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Vocal-First Mastering</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every beat is delivered with generous dynamic headroom (-6dB true peak), preventing distortion when you record vocals, and delivered in uncompressed 24-bit WAV & 320kbps MP3 formats.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0d1a]/80 border border-white/10 space-y-3 hover:border-emerald-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Legally Binding Protection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every purchase grants an official cryptographically signed PDF license contract for monetization across Spotify, Apple Music, YouTube, TV synchronization, and radio broadcast.
          </p>
        </div>
      </div>

      {/* Studio Location & Social Media Deep Links */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0d1a] border border-white/10 text-center space-y-5 shadow-2xl">
        <h3 className="text-2xl font-black text-white">Connect with 808 Tantrik</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Follow our official channels for new beat drops, studio reels, behind-the-scenes production breakdowns, and exclusive custom production inquiries.
        </p>

        <div className="text-xs text-slate-400 font-mono">
          Headquarters: Mumbai, Maharashtra, India • Serving Artists Worldwide
        </div>

        {/* Action Buttons with Mobile Native App Deep Linking */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/beats"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white font-bold text-xs uppercase tracking-wider shadow-glow-blue transition-all"
          >
            <span>Explore Beat Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Native Instagram App Deep Link */}
          <a
            href={OFFICIAL_SOCIALS.instagram.webUrl}
            onClick={openInstagram}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/30 hover:to-purple-600/30 border border-pink-500/40 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
            title="Open Instagram App"
          >
            <svg className="w-4 h-4 fill-pink-400" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram App</span>
          </a>

          {/* Native YouTube App Deep Link */}
          <a
            href={OFFICIAL_SOCIALS.youtube.webUrl}
            onClick={openYouTube}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/40 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
            title="Open YouTube App"
          >
            <svg className="w-4 h-4 fill-red-500" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>YouTube App</span>
          </a>
        </div>
      </div>
    </div>
  );
}
