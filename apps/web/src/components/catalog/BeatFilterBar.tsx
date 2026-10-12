import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, ChevronDown, Sparkles, X } from 'lucide-react';
import {
  INDUSTRY_GENRES,
  INDUSTRY_MOODS,
  INDUSTRY_BPM_OPTIONS,
  MINOR_KEYS,
  MAJOR_KEYS,
  QUICK_FILTER_PILLS,
} from '../../data/beatTaxonomy';

export interface BeatFilterState {
  searchQuery: string;
  genre: string;
  mood: string;
  bpmRange: string;
  key: string;
}

interface BeatFilterBarProps {
  filters: BeatFilterState;
  onChange: (filters: BeatFilterState) => void;
  availableGenres?: string[];
  availableMoods?: string[];
  availableKeys?: string[];
  totalResults?: number;
}

export function BeatFilterBar({
  filters,
  onChange,
  totalResults,
}: BeatFilterBarProps) {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/beats?focus=true');
  };

  const handleReset = () => {
    onChange({
      searchQuery: '',
      genre: 'All',
      mood: 'All',
      bpmRange: 'All',
      key: 'All',
    });
  };

  const handleQuickPillClick = (type: string, value: string) => {
    if (type === 'reset') {
      handleReset();
    } else if (type === 'genre') {
      onChange({
        ...filters,
        genre: filters.genre === value ? 'All' : value,
      });
    } else if (type === 'mood') {
      onChange({
        ...filters,
        mood: filters.mood === value ? 'All' : value,
      });
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.genre !== 'All' ||
    filters.mood !== 'All' ||
    filters.bpmRange !== 'All' ||
    filters.key !== 'All';

  // Find active BPM label for display
  const activeBpmOption = INDUSTRY_BPM_OPTIONS.find((b) => b.value === filters.bpmRange);

  return (
    <div className="w-full bg-[#0c0d17]/90 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-4 mb-8">
      {/* 1. TOP ROW: SEARCH BAR & RESULTS SUMMARY */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div
          onClick={handleSearchClick}
          className="relative w-full sm:max-w-md cursor-pointer group"
          title="Click to search all beats in Beat Store"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform pointer-events-none" />
          <input
            type="text"
            readOnly
            onClick={handleSearchClick}
            onFocus={handleSearchClick}
            value={filters.searchQuery}
            placeholder="Search beats by title, genre, mood in Beat Store..."
            className="w-full bg-[#070712] border border-white/10 group-hover:border-cyan-400/60 rounded-xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner cursor-pointer select-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-cyan-400/90 uppercase tracking-wider bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded pointer-events-none">
            <span>Search</span>
            <span>↵</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {totalResults !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                <strong className="text-cyan-400 font-bold">{totalResults}</strong> Beats Matched
              </span>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[11px] font-semibold text-red-300 hover:text-white transition-all border border-red-500/20 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. QUICK 1-CLICK PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick:</span>
        </span>
        {QUICK_FILTER_PILLS.map((pill) => {
          const isActive =
            (pill.type === 'reset' && !hasActiveFilters) ||
            (pill.type === 'genre' && filters.genre === pill.value) ||
            (pill.type === 'mood' && filters.mood === pill.value);

          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => handleQuickPillClick(pill.type, pill.value)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)] scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 3. FOUR MASTER SELECTORS: GENRE • MOOD • BPM • KEY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10">
        {/* Genre Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Genre</span>
            {filters.genre !== 'All' && (
              <span className="text-cyan-400 text-[9px] font-bold">ACTIVE</span>
            )}
          </label>
          <div className="relative">
            <select
              value={filters.genre}
              onChange={(e) => onChange({ ...filters, genre: e.target.value })}
              className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                filters.genre !== 'All'
                  ? 'bg-cyan-950/40 text-cyan-200 border-cyan-500/50 font-bold'
                  : 'bg-[#080815] text-white border-white/10 hover:border-white/20'
              }`}
            >
              {INDUSTRY_GENRES.map((g) => (
                <option key={g.id} value={g.id} className="bg-[#0b0c16] text-white">
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Mood Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Mood</span>
            {filters.mood !== 'All' && (
              <span className="text-purple-400 text-[9px] font-bold">ACTIVE</span>
            )}
          </label>
          <div className="relative">
            <select
              value={filters.mood}
              onChange={(e) => onChange({ ...filters, mood: e.target.value })}
              className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                filters.mood !== 'All'
                  ? 'bg-purple-950/40 text-purple-200 border-purple-500/50 font-bold'
                  : 'bg-[#080815] text-white border-white/10 hover:border-white/20'
              }`}
            >
              {INDUSTRY_MOODS.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0b0c16] text-white">
                  {m.id === 'All' ? 'All Moods' : m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* BPM Range Selector */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>BPM Tempo</span>
            {filters.bpmRange !== 'All' && (
              <span className="text-blue-400 text-[9px] font-bold">ACTIVE</span>
            )}
          </label>
          <div className="relative">
            <select
              value={filters.bpmRange}
              onChange={(e) => onChange({ ...filters, bpmRange: e.target.value })}
              className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                filters.bpmRange !== 'All'
                  ? 'bg-blue-950/40 text-blue-200 border-blue-500/50 font-bold'
                  : 'bg-[#080815] text-white border-white/10 hover:border-white/20'
              }`}
            >
              {INDUSTRY_BPM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0b0c16] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Musical Key Selector (Categorized for producers: Minor & Major) */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Key</span>
            {filters.key !== 'All' && (
              <span className="text-emerald-400 text-[9px] font-bold">ACTIVE</span>
            )}
          </label>
          <div className="relative">
            <select
              value={filters.key}
              onChange={(e) => onChange({ ...filters, key: e.target.value })}
              className={`w-full appearance-none rounded-xl px-3 py-2 text-xs focus:outline-none transition-all cursor-pointer pr-7 border ${
                filters.key !== 'All'
                  ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/50 font-bold'
                  : 'bg-[#080815] text-white border-white/10 hover:border-white/20'
              }`}
            >
              <option value="All" className="bg-[#0b0c16] text-white">
                All Keys
              </option>
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
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. ACTIVE FILTER BADGES ROW */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5 text-[11px]">
          <span className="text-slate-400 font-mono text-[10px] uppercase">Active:</span>
          {filters.genre !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
              Genre: {filters.genre}
              <button
                type="button"
                onClick={() => onChange({ ...filters, genre: 'All' })}
                className="hover:text-white ml-0.5 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {filters.mood !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
              Mood: {filters.mood}
              <button
                type="button"
                onClick={() => onChange({ ...filters, mood: 'All' })}
                className="hover:text-white ml-0.5 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {filters.bpmRange !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-semibold">
              BPM: {activeBpmOption?.label || filters.bpmRange}
              <button
                type="button"
                onClick={() => onChange({ ...filters, bpmRange: 'All' })}
                className="hover:text-white ml-0.5 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
          {filters.key !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
              Key: {filters.key}
              <button
                type="button"
                onClick={() => onChange({ ...filters, key: 'All' })}
                className="hover:text-white ml-0.5 cursor-pointer"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
