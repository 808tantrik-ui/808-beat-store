export interface GenreOption {
  id: string;
  name: string;
  popular?: boolean;
}

export interface MoodOption {
  id: string;
  name: string;
  emoji: string;
  label: string;
  popular?: boolean;
}

export interface BpmOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

// =========================================================================
// 1. GENRE DROPDOWN OPTIONS (Exact specifications)
// =========================================================================
export const INDUSTRY_GENRES: GenreOption[] = [
  { id: 'All', name: 'All Genres' },
  { id: 'Hip-Hop', name: 'Hip-Hop', popular: true },
  { id: 'Trap', name: 'Trap', popular: true },
  { id: 'Drill', name: 'Drill', popular: true },
  { id: 'Afrobeat', name: 'Afrobeat', popular: true },
  { id: 'Lo-Fi / Chill', name: 'Lo-Fi / Chill', popular: true },
];

// =========================================================================
// 2. MOOD DROPDOWN OPTIONS (Exact specifications)
// =========================================================================
export const INDUSTRY_MOODS: MoodOption[] = [
  { id: 'All', name: 'All Moods', emoji: '✨', label: 'All Moods' },
  { id: 'Aggressive / Hard', name: 'Aggressive / Hard', emoji: '🔥', label: 'Aggressive / Hard', popular: true },
  { id: 'Dark / Melodic', name: 'Dark / Melodic', emoji: '🌙', label: 'Dark / Melodic', popular: true },
  { id: 'Chill / Atmospheric', name: 'Chill / Atmospheric', emoji: '🌴', label: 'Chill / Atmospheric', popular: true },
  { id: 'Energetic / Hype', name: 'Energetic / Hype', emoji: '⚡', label: 'Energetic / Hype', popular: true },
];

// =========================================================================
// 3. BPM TEMPO DROPDOWN OPTIONS (Precise ranges)
// =========================================================================
export const INDUSTRY_BPM_OPTIONS: BpmOption[] = [
  { value: 'All', label: 'All BPM' },
  { value: '60-89', label: '60 - 89 BPM (Slow / Chill)', min: 60, max: 89 },
  { value: '90-109', label: '90 - 109 BPM (Standard Hip-Hop)', min: 90, max: 109 },
  { value: '110-139', label: '110 - 139 BPM (Upbeat / Trap)', min: 110, max: 139 },
  { value: '140-180+', label: '140 - 180+ BPM (Fast / Drill)', min: 140, max: 999 },
];

// =========================================================================
// 4. KEY DROPDOWN OPTIONS (Categorized for producers: Minor & Major)
// =========================================================================
export const MINOR_KEYS = [
  'C Minor',
  'C# Minor',
  'D Minor',
  'D# Minor',
  'E Minor',
  'F Minor',
  'F# Minor',
  'G Minor',
  'G# Minor',
  'A Minor',
  'A# Minor',
  'B Minor',
];

export const MAJOR_KEYS = [
  'C Major',
  'D Major',
  'E Major',
  'F Major',
  'G Major',
  'A Major',
  'B Major',
];

export const INDUSTRY_KEYS = [
  'All',
  ...MINOR_KEYS,
  ...MAJOR_KEYS,
];

// =========================================================================
// 5. QUICK 1-CLICK PILLS FOR INSTANT STORE FILTERING
// =========================================================================
export const QUICK_FILTER_PILLS = [
  { label: 'All Beats', type: 'reset', value: '' },
  { label: '🔥 Hip-Hop', type: 'genre', value: 'Hip-Hop' },
  { label: '⚡ Trap', type: 'genre', value: 'Trap' },
  { label: '💥 Drill', type: 'genre', value: 'Drill' },
  { label: '🌴 Afrobeat', type: 'genre', value: 'Afrobeat' },
  { label: '☕ Lo-Fi / Chill', type: 'genre', value: 'Lo-Fi / Chill' },
  { label: '🌙 Dark / Melodic', type: 'mood', value: 'Dark / Melodic' },
  { label: '🔥 Aggressive / Hard', type: 'mood', value: 'Aggressive / Hard' },
];
