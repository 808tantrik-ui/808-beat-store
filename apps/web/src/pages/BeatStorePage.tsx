import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Play,
  Pause,
  ShoppingCart,
  Layers,
  ChevronDown,
  X,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { BeatDTO } from '@shared/types';
import {
  INDUSTRY_GENRES,
  INDUSTRY_MOODS,
  INDUSTRY_BPM_OPTIONS,
  MINOR_KEYS,
  MAJOR_KEYS,
} from '../data/beatTaxonomy';
import { useAudioStore } from '../store/useAudioStore';
import { useCartStore } from '../store/useCartStore';
import { useModalStore } from '../store/useModalStore';
import { CompactCatalog } from '../components/catalog/CompactCatalog';

interface BeatStorePageProps {
  beats: BeatDTO[];
  onNavigate?: (route: string) => void;
  onOpenLicenseModal?: (beat: BeatDTO) => void;
}

export function BeatStorePage({ beats, onNavigate, onOpenLicenseModal }: BeatStorePageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openLicenseModal } = useModalStore();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const pauseTrack = useAudioStore((s) => s.pauseTrack);
  const { addItem } = useCartStore();

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigate(route);
    }
  };

  const handleOpenLicenseModal = (beat: BeatDTO) => {
    if (onOpenLicenseModal) {
      onOpenLicenseModal(beat);
    } else {
      openLicenseModal(beat);
    }
  };

  const initialSearch = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }

    const shouldFocus = searchParams.get('focus') === 'true' || searchParams.has('q');
    if (shouldFocus) {
      const el = document.getElementById('beat-search-input');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      }
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select?.();
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedKey, setSelectedKey] = useState('All');
  const [selectedBpmRange, setSelectedBpmRange] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Filter & Search Logic
  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      // 1. Text Search across title, genre, mood, style, key, description, bpm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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

      // 2. Genre Filter
      if (selectedGenre !== 'All') {
        const tg = selectedGenre.toLowerCase();
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

      // 3. Mood Filter
      if (selectedMood !== 'All') {
        const tm = selectedMood.toLowerCase();
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

      // 4. Key Filter
      if (selectedKey !== 'All') {
        const cleanFilterKey = selectedKey.toLowerCase().replace(/[- ]/g, '');
        const cleanBeatKey = (beat.key || '').toLowerCase().replace(/[- ]/g, '');
        if (cleanFilterKey !== cleanBeatKey && !cleanBeatKey.includes(cleanFilterKey)) {
          return false;
        }
      }

      // 5. BPM Range
      if (selectedBpmRange !== 'All') {
        const found = INDUSTRY_BPM_OPTIONS.find((r) => r.value === selectedBpmRange);
        if (found && found.min !== undefined && found.max !== undefined) {
          if (beat.bpm < found.min || beat.bpm > found.max) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'bpm_asc') return a.bpm - b.bpm;
      if (sortBy === 'bpm_desc') return b.bpm - a.bpm;
      if (sortBy === 'popular') return b.playsCount - a.playsCount;
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });
  }, [beats, searchQuery, selectedGenre, selectedMood, selectedKey, selectedBpmRange, sortBy]);

  const handlePlayToggle = (beat: BeatDTO) => {
    if (currentTrack?.id === beat.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(beat);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedMood('All');
    setSelectedBpmRange('All');
    setSelectedKey('All');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedGenre !== 'All' ||
    selectedMood !== 'All' ||
    selectedBpmRange !== 'All' ||
    selectedKey !== 'All';

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pt-24 sm:pt-28 pb-36 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Beat Store
        </h1>
        <p className="text-text-muted text-xs sm:text-sm md:text-base mt-1.5 sm:mt-2 max-w-2xl">
          Discover uncompressed studio instrumentals crafted exclusively for hip-hop lyricists and visual producers.
        </p>
      </div>

      {/* Global Search Bar */}
      <div className="relative mb-4 sm:mb-6 z-10">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3.5 sm:left-4 w-4 h-4 sm:w-5 sm:h-5 text-text-subtle pointer-events-none shrink-0" />
          <input
            ref={searchInputRef}
            id="beat-search-input"
            type="search"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search beats by title, tag, genre (Trap, Drill, Afrobeat)..."
            className="w-full bg-surface-light border border-surface-border rounded-xl sm:rounded-2xl py-3 sm:py-3.5 pl-10 sm:pl-12 pr-10 text-white placeholder-text-subtle text-xs sm:text-sm focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/40 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 sm:right-4 p-1 text-text-subtle hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Bar: 4 Master Selectors + Sort + View Mode */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface/80 border border-surface-border backdrop-blur-md mb-6 sm:mb-8 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {/* 1. Genre Selector */}
          <div className="relative">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Genre
            </label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                aria-label="Filter by Genre"
                className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                  selectedGenre !== 'All'
                    ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/50 font-bold'
                    : 'bg-surface-light text-white border-surface-border'
                }`}
              >
                {INDUSTRY_GENRES.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#0b0c16] text-white">
                    {g.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
            </div>
          </div>

          {/* 2. Mood Selector */}
          <div className="relative">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Mood
            </label>
            <div className="relative">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                aria-label="Filter by Mood"
                className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                  selectedMood !== 'All'
                    ? 'bg-purple-950/40 text-purple-200 border-purple-500/50 font-bold'
                    : 'bg-surface-light text-white border-surface-border'
                }`}
              >
                {INDUSTRY_MOODS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0b0c16] text-white">
                    {m.id === 'All' ? 'All Moods' : m.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
            </div>
          </div>

          {/* 3. BPM Tempo Selector */}
          <div className="relative">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              BPM Tempo
            </label>
            <div className="relative">
              <select
                value={selectedBpmRange}
                onChange={(e) => setSelectedBpmRange(e.target.value)}
                aria-label="Filter by BPM"
                className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                  selectedBpmRange !== 'All'
                    ? 'bg-blue-950/40 text-blue-200 border-blue-500/50 font-bold'
                    : 'bg-surface-light text-white border-surface-border'
                }`}
              >
                {INDUSTRY_BPM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0b0c16] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
            </div>
          </div>

          {/* 4. Musical Key Selector (Categorized for producers: Minor & Major) */}
          <div className="relative">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Key
            </label>
            <div className="relative">
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                aria-label="Filter by Musical Key"
                className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                  selectedKey !== 'All'
                    ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/50 font-bold'
                    : 'bg-surface-light text-white border-surface-border'
                }`}
              >
                <option value="All" className="bg-[#0b0c16] text-white">All Keys</option>
                <optgroup label="Minor Keys" className="bg-[#0b0c16] text-cyan-400 font-bold">
                  {MINOR_KEYS.map((k) => (
                    <option key={k} value={k} className="bg-[#0b0c16] text-white">
                      {k}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Major Keys" className="bg-[#0b0c16] text-blue-400 font-bold">
                  {MAJOR_KEYS.map((k) => (
                    <option key={k} value={k} className="bg-[#0b0c16] text-white">
                      {k}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
            </div>
          </div>

          {/* 5. Sort Selector */}
          <div className="relative col-span-2 sm:col-span-4 md:col-span-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Sort
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Beats"
                className="w-full appearance-none bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-blue cursor-pointer pr-7"
              >
                <option value="newest" className="bg-[#0b0c16] text-white">Newest First</option>
                <option value="popular" className="bg-[#0b0c16] text-white">Most Popular</option>
                <option value="bpm_asc" className="bg-[#0b0c16] text-white">BPM (Low to High)</option>
                <option value="bpm_desc" className="bg-[#0b0c16] text-white">BPM (High to Low)</option>
                <option value="duration" className="bg-[#0b0c16] text-white">Longest Duration</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub-bar: Active Filter summary, Clear All & View Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">
              Showing <strong className="text-white">{filteredBeats.length}</strong> of {beats.length} beats
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-light rounded-xl border border-surface-border p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-electric-blue text-white' : 'text-text-muted hover:text-white'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-electric-blue text-white' : 'text-text-muted hover:text-white'
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Results Summary */}
      <div className="flex items-center justify-between text-xs text-text-subtle mb-4 px-1">
        <span>Showing {filteredBeats.length} Hip-Hop Instrumentals</span>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-electric-cyan hover:underline font-medium cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredBeats.length === 0 && (
        <div className="py-16 sm:py-20 text-center glass-panel rounded-2xl p-6 sm:p-8">
          <Search className="w-8 h-8 sm:w-10 sm:h-10 text-text-subtle mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-white">No beats match your criteria</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Try adjusting your search query, mood, or BPM tempo range to discover available tracks.
          </p>
        </div>
      )}

      {/* TABLE / LIST VIEW (Requirement 19) */}
      {viewMode === 'table' && filteredBeats.length > 0 && (
        <div>
          {/* Mobile Optimized Compact List View (< sm screens: 3 to 4 beats visible) */}
          <div className="sm:hidden">
            <CompactCatalog
              beats={filteredBeats}
              onOpenLicenseModal={handleOpenLicenseModal}
              onNavigateDetail={(slug) => handleNavigate(`/beats/${slug}`)}
            />
          </div>

          {/* Desktop Table View (>= sm screens, exact original layout) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-surface-border bg-surface/50 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border text-[11px] font-mono uppercase tracking-wider text-text-subtle bg-surface-light/40">
                  <th className="py-3.5 pl-4 pr-2 w-12 text-center">Play</th>
                  <th className="py-3.5 px-3 w-16">Cover</th>
                  <th className="py-3.5 px-4">Beat Title</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">BPM</th>
                  <th className="py-3.5 px-4">Key</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Mood</th>
                  <th className="py-3.5 px-4">Starting Price</th>
                  <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-sm">
                {filteredBeats.map((beat) => {
                  const isThisPlaying = currentTrack?.id === beat.id && isPlaying;
                  const startingPrice = beat.availableLicenses?.[0]?.price || 49;
                  const cutPrice = beat.availableLicenses?.[0]?.defaultPrice || 499;

                  return (
                    <tr
                      key={beat.id}
                      className="hover:bg-surface-light/50 transition-colors group cursor-pointer"
                      onClick={() => handlePlayToggle(beat)}
                    >
                      {/* Play Button */}
                      <td className="py-3 pl-4 pr-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handlePlayToggle(beat)}
                          className="w-9 h-9 rounded-full bg-surface-lighter hover:bg-electric-blue text-white flex items-center justify-center transition-all shadow-sm"
                          aria-label={isThisPlaying ? 'Pause' : 'Play'}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-current text-electric-cyan" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>
                      </td>

                      {/* Cover Artwork */}
                      <td className="py-3 px-3">
                        <img
                          src={beat.artwork}
                          alt={beat.title}
                          width={48}
                          height={48}
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-12 rounded-lg object-cover border border-surface-border shrink-0"
                        />
                      </td>

                      {/* Beat Name & Style */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/beats/${beat.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-white hover:text-electric-cyan transition-colors block"
                        >
                          {beat.title}
                        </Link>
                        <div className="text-xs text-text-subtle mt-0.5">{beat.style}</div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-xs text-text-muted">
                        {formatSeconds(beat.duration)}
                      </td>

                      {/* BPM */}
                      <td className="py-3 px-4 font-mono text-xs text-electric-cyan">
                        {beat.bpm}
                      </td>

                      {/* Key */}
                      <td className="py-3 px-4 text-xs text-text-muted whitespace-nowrap font-medium">
                        {beat.key}
                      </td>

                      {/* Mood */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <span className="px-2 py-0.5 rounded-full bg-surface-lighter text-[11px] text-text-muted">
                          {beat.mood}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] line-through text-slate-400 font-mono">₹{cutPrice}</span>
                          <span className="text-[9px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/30 px-1 py-0.2 rounded-full">🔥 Promo</span>
                        </div>
                        <div className="font-black text-white text-base">
                          ₹{startingPrice.toLocaleString()}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 pr-4 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenLicenseModal(beat)}
                            className="px-3 py-1.5 rounded-lg bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold border border-surface-border flex items-center gap-1 transition-all"
                          >
                            <Layers className="w-3.5 h-3.5 text-electric-cyan" />
                            <span>License</span>
                          </button>

                          <button
                            onClick={() => {
                              if (beat.availableLicenses?.[0]) {
                                addItem(beat, beat.availableLicenses[0]);
                              } else {
                                handleOpenLicenseModal(beat);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold shadow-glow-blue flex items-center gap-1 transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Buy</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW (Requirement 18) */}
      {viewMode === 'grid' && filteredBeats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBeats.map((beat) => {
            const isThisPlaying = currentTrack?.id === beat.id && isPlaying;
            const startingPrice = beat.availableLicenses?.[0]?.price || 49;
            const cutPrice = beat.availableLicenses?.[0]?.defaultPrice || 499;

            return (
              <div
                key={beat.id}
                className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5 sm:mb-4 bg-surface-border">
                  <img
                    src={beat.artwork}
                    alt={beat.title}
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <button
                    type="button"
                    onClick={() => handlePlayToggle(beat)}
                    aria-label={isThisPlaying ? `Pause ${beat.title}` : `Play ${beat.title}`}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-0 w-full"
                  >
                    <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-glow-blue transform hover:scale-110 active:scale-95 transition-all">
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                      )}
                    </span>
                  </button>

                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white">
                    {beat.bpm} BPM
                  </div>

                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-electric-cyan whitespace-nowrap">
                    {beat.key}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-text-subtle mb-1 font-mono">
                    <span>{beat.style}</span>
                    <span>{beat.mood}</span>
                  </div>

                  <Link
                    to={`/beats/${beat.slug}`}
                    className="font-bold text-white text-base sm:text-lg hover:text-electric-cyan transition-colors truncate block"
                  >
                    {beat.title}
                  </Link>

                  <p className="text-xs text-slate-200 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {beat.description || 'Master hip-hop instrumental with crisp drums and layered harmonies.'}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-surface-border/70 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] line-through text-slate-400 font-mono">₹{cutPrice}</span>
                      <span className="text-[9px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/30 px-1 py-0.2 rounded-full">🔥 Promo</span>
                    </div>
                    <div className="text-base font-black text-white flex items-baseline gap-1 mt-0.5">
                      <span className="text-electric-blue">₹{startingPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-text-subtle font-sans font-normal">/ lease</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenLicenseModal(beat)}
                      className="px-3.5 py-2 rounded-xl bg-surface-lighter hover:bg-surface-border text-white text-xs font-semibold border border-surface-border/80 shadow-sm active:scale-95 transition-all"
                    >
                      Licenses
                    </button>

                    <button
                      onClick={() => {
                        if (beat.availableLicenses?.[0]) {
                          addItem(beat, beat.availableLicenses[0]);
                        } else {
                          handleOpenLicenseModal(beat);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-electric-blue hover:bg-electric-blue/90 text-white text-xs font-bold shadow-glow-blue active:scale-95 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
