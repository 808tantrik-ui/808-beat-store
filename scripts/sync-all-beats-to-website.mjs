import fs from 'fs';
import path from 'path';

const scheduledBeats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');

const standardLicenses = [
  {
    id: "a26ecb02-0459-4f6a-8bf3-b1cbe1ece42f",
    name: "NON_EXCLUSIVE",
    displayName: "Non-Exclusive License",
    description: "High-quality commercial master files (MP3 + 24-Bit WAV) for streaming, singles, and music videos.",
    price: 1999,
    isExclusive: false,
    includedFiles: ["MP3", "WAV", "LICENSE_PDF"],
    commercialUsage: "Commercial audio release across Spotify, Apple Music & YouTube.",
    streamingLimit: 500000,
    distributionLimit: 10000
  },
  {
    id: "47559e64-ec3d-450d-9814-7349182dafd1",
    name: "EXCLUSIVE",
    displayName: "Exclusive License",
    description: "Sole ownership transfer. The beat is automatically permanently archived from the store and cannot be bought again.",
    price: 19999,
    isExclusive: true,
    includedFiles: ["MP3", "WAV", "LICENSE_PDF", "LEGAL_CONTRACT"],
    commercialUsage: "Unlimited commercial streams, global synchronization, radio, cinema, and physical distribution.",
    streamingLimit: null,
    distributionLimit: null
  }
];

const newBeats = scheduledBeats.map((b, index) => {
  const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: `beat-808-sched-${index + 1}-${slug}`,
    title: b.title,
    slug: slug,
    description: `${b.youtubeDescription || `Studio master ${b.genre} instrumental produced by 808 Beat Store.`}\nYouTube: ${b.youtubeUrl || 'https://youtube.com/@808beatstore'}`,
    artwork: `/assets/artwork/${slug}.jpg`,
    previewAudio: fs.existsSync(`public/assets/audio/${slug}.mp3`)
      ? `/assets/audio/${slug}.mp3`
      : `/assets/audio/${slug}.wav`,
    privateMp3: `/assets/audio/${slug}.mp3`,
    privateWav: `/assets/audio/${slug}.wav`,
    privateStems: null,
    bpm: b.bpm,
    key: b.key,
    duration: 165,
    mood: b.mood,
    style: b.style || b.genre,
    genre: b.genre,
    producerName: "808 Tantrik",
    producerDisplayName: "808 Beat Store",
    copyrightOwner: "MANOJ KUMAR KAITHAL",
    publisher: "808 Beat Store",
    status: "PUBLISHED",
    featured: index < 6,
    playsCount: 150 + index * 42,
    salesCount: 0,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    availableLicenses: standardLicenses
  };
});

// Read existing fallback licenses
const fallbackContent = fs.readFileSync(fallbackPath, 'utf-8');
const licensesMatch = fallbackContent.match(/export const FALLBACK_LICENSES = \[[\s\S]*\];/);
const licensesExport = licensesMatch ? licensesMatch[0] : `export const FALLBACK_LICENSES = [];`;

const updatedFileContent = `// Auto-generated 808 Beat Store catalog with 20 Scheduled Beats
export const FALLBACK_BEATS = ${JSON.stringify(newBeats, null, 2)};

${licensesExport}
`;

fs.writeFileSync(fallbackPath, updatedFileContent, 'utf-8');
console.log(`✅ apps/web/src/data/fallbackData.ts successfully updated with all ${newBeats.length} beats!`);
