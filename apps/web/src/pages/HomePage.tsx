import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Disc3,
  Sparkles,
} from 'lucide-react';
import { producerBrand, brandHelpers } from '@config/brand';
import { BeatDTO, LicenseDTO } from '@shared/types';
import { HeroReelsRow } from '../components/catalog/HeroReelsRow';
import { CoverFlow3D } from '../components/canvas/CoverFlow3D';
import { useModalStore } from '../store/useModalStore';
import { BeatFilterBar, BeatFilterState } from '../components/catalog/BeatFilterBar';
import { INDUSTRY_BPM_OPTIONS } from '../data/beatTaxonomy';
import { CompactCatalog } from '../components/catalog/CompactCatalog';
import { BeatCard } from '../components/catalog/BeatCard';
import { PricingCards } from '../components/pricing/PricingCards';
import {
  StudioMicSilhouette,
  StudioSpeakerSilhouette,
  StudioGuitarSilhouette,
} from '../components/common/StudioCornerArt';

interface HomePageProps {
  beats: BeatDTO[];
  licenses: LicenseDTO[];
  onNavigate?: (route: string) => void;
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function HomePage({
  beats = [],
  licenses = [],
  onNavigate,
  onOpenLicenseModal,
}: HomePageProps) {
  const navigate = useNavigate();
  const { openLicenseModal } = useModalStore();
  const producerName = brandHelpers.getProducerName(producerBrand);

  const safeBeats = Array.isArray(beats) ? beats : [];
  const safeLicenses = Array.isArray(licenses) ? licenses : [];

  const handleOpenLicenseModal = (beat: BeatDTO) => {
    if (onOpenLicenseModal) {
      onOpenLicenseModal(beat);
    } else {
      openLicenseModal(beat);
    }
  };

  const handleNavigateDetail = (slug: string) => {
    if (onNavigate) {
      onNavigate(`/beats/${slug}`);
    } else {
      navigate(`/beats/${slug}`);
    }
  };

  // Smooth-scroll navigation handlers
  const handleExploreBeats = () => {
    const el = document.getElementById('beat-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onNavigate) {
      onNavigate('/beats');
    } else {
      navigate('/beats');
    }
  };

  const handleViewLicenses = () => {
    const el = document.getElementById('licensing-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onNavigate) {
      onNavigate('/licensing');
    } else {
      navigate('/licensing');
    }
  };

  // Automatically scroll to hash section if present in URL
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, []);

  const [filters, setFilters] = useState<BeatFilterState>({
    searchQuery: '',
    genre: 'All',
    mood: 'All',
    bpmRange: 'All',
    key: 'All',
  });

  const availableKeys = useMemo(() => {
    const set = new Set<string>();
    safeBeats.forEach((b) => {
      if (b && b.key) set.add(b.key);
    });
    return ['All', ...Array.from(set)];
  }, [safeBeats]);

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    safeBeats.forEach((b) => {
      if (b && b.genre) set.add(b.genre);
    });
    return ['All', ...Array.from(set)];
  }, [safeBeats]);

  const availableMoods = useMemo(() => {
    const set = new Set<string>();
    safeBeats.forEach((b) => {
      if (b && b.mood) set.add(b.mood);
    });
    return ['All', ...Array.from(set)];
  }, [safeBeats]);

  const filteredBeats = useMemo(() => {
    return safeBeats.filter((beat) => {
      if (!beat) return false;

      // 1. Text Search matching title, style, genre, mood, key, description, or exact BPM
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesTitle = beat.title?.toLowerCase().includes(q);
        const matchesMood = beat.mood?.toLowerCase().includes(q);
        const matchesGenre = beat.genre?.toLowerCase().includes(q);
        const matchesStyle = beat.style?.toLowerCase().includes(q);
        const matchesKey = beat.key?.toLowerCase().includes(q);
        const matchesDesc = beat.description?.toLowerCase().includes(q);
        const matchesBpm = String(beat.bpm).includes(q);

        if (
          !matchesTitle &&
          !matchesMood &&
          !matchesGenre &&
          !matchesStyle &&
          !matchesKey &&
          !matchesDesc &&
          !matchesBpm
        ) {
          return false;
        }
      }

      // 2. Genre Filter (supports exact and categorized matching)
      if (filters.genre !== 'All') {
        const tg = filters.genre.toLowerCase();
        const bg = (beat.genre || '').toLowerCase();
        const bs = (beat.style || '').toLowerCase();
        const bt = (beat.title || '').toLowerCase();

        if (tg === 'hip-hop') {
          const isHipHop =
            bg.includes('hip') ||
            bs.includes('hip') ||
            bg.includes('boom') ||
            bs.includes('boom') ||
            bg.includes('dhh') ||
            bs.includes('dhh') ||
            bt.includes('hip-hop');
          if (!isHipHop) return false;
        } else if (tg === 'lo-fi / chill') {
          const isLofi =
            bg.includes('lo-fi') ||
            bg.includes('lofi') ||
            bs.includes('lo-fi') ||
            bs.includes('lofi') ||
            bg.includes('chill') ||
            bs.includes('chill') ||
            (beat.mood || '').toLowerCase().includes('chill');
          if (!isLofi) return false;
        } else if (tg === 'afrobeat') {
          const isAfro =
            bg.includes('afro') ||
            bs.includes('afro') ||
            bg.includes('amapiano') ||
            bs.includes('amapiano');
          if (!isAfro) return false;
        } else {
          const matches =
            bg.includes(tg) ||
            tg.includes(bg) ||
            bs.includes(tg) ||
            bt.includes(tg);
          if (!matches) return false;
        }
      }

      // 3. Mood Filter (supports exact and grouped matching)
      if (filters.mood !== 'All') {
        const tm = filters.mood.toLowerCase();
        const bm = (beat.mood || '').toLowerCase();
        const bs = (beat.style || '').toLowerCase();

        if (tm.includes('aggressive') || tm.includes('hard')) {
          const isHard =
            bm.includes('hard') ||
            bm.includes('aggressive') ||
            bm.includes('rage') ||
            bs.includes('hard') ||
            bs.includes('aggressive');
          if (!isHard) return false;
        } else if (tm.includes('dark') || tm.includes('melodic')) {
          const isDarkMelodic =
            bm.includes('dark') ||
            bm.includes('melodic') ||
            bm.includes('sad') ||
            bm.includes('emotional') ||
            bs.includes('dark') ||
            bs.includes('melodic');
          if (!isDarkMelodic) return false;
        } else if (tm.includes('chill') || tm.includes('atmospheric')) {
          const isChillAtmospheric =
            bm.includes('chill') ||
            bm.includes('atmospheric') ||
            bm.includes('ambient') ||
            bm.includes('relaxed') ||
            bs.includes('chill');
          if (!isChillAtmospheric) return false;
        } else if (tm.includes('energetic') || tm.includes('hype')) {
          const isHype =
            bm.includes('energetic') ||
            bm.includes('hype') ||
            bm.includes('bouncy') ||
            bm.includes('motivational') ||
            bs.includes('hype');
          if (!isHype) return false;
        } else {
          if (!bm.includes(tm) && !tm.includes(bm)) return false;
        }
      }

      // 4. Musical Key Filter
      if (filters.key !== 'All') {
        const cleanFilterKey = filters.key.toLowerCase().replace(/[- ]/g, '');
        const cleanBeatKey = (beat.key || '').toLowerCase().replace(/[- ]/g, '');
        if (cleanFilterKey !== cleanBeatKey && !cleanBeatKey.includes(cleanFilterKey)) {
          return false;
        }
      }

      // 5. BPM Tempo Range Filter
      if (filters.bpmRange !== 'All') {
        const option = INDUSTRY_BPM_OPTIONS.find((b) => b.value === filters.bpmRange);
        if (option && option.min !== undefined && option.max !== undefined) {
          if (beat.bpm < option.min || beat.bpm > option.max) return false;
        }
      }

      return true;
    });
  }, [safeBeats, filters]);

  const featuredBeats = safeBeats.filter((b) => b && b.featured);

  return (
    <div className="relative w-full overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & FEATURED AUDIO PLAYER CARD */}
      {/* ========================================================================= */}
      <section className="relative pt-24 sm:pt-28 pb-6 sm:pb-10 px-4 sm:px-6">
        {/* Soft Radial Electric-Blue Glow behind Hero */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] rounded-full bg-[#0066FF] opacity-[0.09] blur-[150px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto w-full text-center space-y-5 sm:space-y-6 z-10">
          {/* Supporting Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-lighter/60 border border-surface-border text-electric-blue text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-glow-blue/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prod. by {producerName}</span>
          </div>

          {/* Dynamic Hero Title with Brand Styling (Sharp & Mobile-Optimized) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] sm:leading-[1.08] text-center">
            INDUSTRY GRADE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-blue-400 to-[#00F0FF]">
              HIP-HOP BEATS
            </span>
          </h1>

          {/* Configurable Hero Subtitle (Sharp & Mobile-Optimized) */}
          <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed text-center px-2">
            Elevate your sound with studio-ready instrumentals and instant licensing.
          </p>

          {/* CTAs with Direct Smooth-Scroll Navigation Flows */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={handleExploreBeats}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-glow-blue transition-all active:scale-95 group cursor-pointer border-0"
            >
              <span>EXPLORE BEATS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleViewLicenses}
              className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl bg-surface-light hover:bg-surface-lighter text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-surface-border transition-all hover:border-surface-border/80 flex items-center justify-center cursor-pointer"
            >
              VIEW LICENSES
            </button>
          </div>
        </div>

        {/* 6 Looping Video Reels (3x2 mobile, 1x6 desktop) */}
        <HeroReelsRow />
      </section>

      {/* ========================================================================= */}
      {/* 2. NEW RELEASES 3D COVERFLOW SHOWCASE */}
      {/* ========================================================================= */}
      <section className="py-4 sm:py-8 border-y border-surface-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <CoverFlow3D
            beats={featuredBeats.length > 0 ? featuredBeats : safeBeats}
            onOpenLicenseModal={handleOpenLicenseModal}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRENDING HIP-HOP INSTRUMENTALS CATALOG & SEARCH */}
      {/* ========================================================================= */}
      <section
        id="beat-catalog"
        className="relative py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden content-auto scroll-mt-20"
      >
        {/* Soft Radial Electric-Blue Glow behind Catalog Header */}
        <div className="absolute top-8 left-1/4 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-[#0066FF] opacity-[0.06] blur-[140px] pointer-events-none -z-10" />
        
        {/* Studio Guitar Line-Art Silhouette (Desktop only) */}
        <StudioGuitarSilhouette className="top-6 right-4 w-36 h-56" />

        {/* Catalog Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-electric-blue text-xs font-mono uppercase tracking-widest mb-1.5">
              <Disc3 className="w-4 h-4 animate-spin-slow" />
              <span>Studio Fresh Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Beats
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Top requested instrumentals engineered for lyricists and streaming artists.
            </p>
          </div>

          <Link
            to="/beats"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-electric-blue hover:text-white transition-colors"
          >
            <span>View All Tracks ({safeBeats.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Bar: BPM, Mood, Genre, Key */}
        <BeatFilterBar
          filters={filters}
          onChange={setFilters}
          availableKeys={availableKeys}
          availableGenres={availableGenres}
          availableMoods={availableMoods}
          totalResults={filteredBeats.length}
        />

        {/* Mobile Compact List View (3 to 4 beats visible simultaneously without heavy scrolling) */}
        <div className="block sm:hidden">
          <CompactCatalog
            beats={filteredBeats}
            onOpenLicenseModal={handleOpenLicenseModal}
            onNavigateDetail={handleNavigateDetail}
            limit={8}
          />
        </div>

        {/* Desktop Beats Grid (>= sm screens) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeats.slice(0, 6).map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              onOpenLicenseModal={handleOpenLicenseModal}
              onNavigateDetail={handleNavigateDetail}
            />
          ))}
        </div>

        {filteredBeats.length === 0 && (
          <div className="py-16 text-center rounded-2xl bg-surface/50 border border-white/10 p-8">
            <p className="text-slate-300 text-sm font-semibold">No beats match the selected filters.</p>
            <button
              onClick={() =>
                setFilters({ searchQuery: '', genre: 'All', mood: 'All', bpmRange: 'All', key: 'All' })
              }
              className="mt-3 px-4 py-2 rounded-xl bg-electric-blue text-white text-xs font-bold shadow-glow-blue cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. LICENSE COMPARISON TEASER (TRANSPARENT RIGHTS & COMMERCIAL LICENSES) */}
      {/* ========================================================================= */}
      <section
        id="licensing-section"
        className="relative py-16 sm:py-20 px-4 sm:px-6 bg-surface-light/40 border-t border-surface-border overflow-hidden content-auto scroll-mt-20"
      >
        {/* Soft Radial Electric-Blue Glow behind Section Header */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#0066FF] opacity-[0.07] blur-[150px] pointer-events-none -z-10" />

        {/* Hip-Hop Studio Corner Silhouettes (Desktop only) */}
        <StudioSpeakerSilhouette className="top-6 left-6 w-36 h-48" />
        <StudioMicSilhouette className="bottom-8 right-6 w-36 h-48" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-lighter border border-surface-border text-electric-blue text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent Rights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Standard Commercial Licenses
            </h2>
            <p className="text-text-muted text-sm mt-2">
              Simple, transparent legal agreements. Retain 100% of your performance royalties while releasing across all major DSPs.
            </p>
          </div>

          {/* Modular Pricing Cards with Clean Transparent Pricing (₹499 & ₹4,999) */}
          <PricingCards
            licenses={safeLicenses}
            onChooseLicense={() => {
              const el = document.getElementById('beat-catalog');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                navigate('/beats');
              }
            }}
          />
        </div>
      </section>
    </div>
  );
}
