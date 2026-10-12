import fs from 'fs';
import path from 'path';

interface BeatEntry {
  id: string;
  title: string;
  rawFilename: string;
  driveFileId: string;
  driveUrl: string;
  optimizedDriveName: string;
  bpm: number;
  doubleBpm?: number;
  key: string;
  genre: string;
  mood: string;
  style: string;
  scheduledTime: string;
  scheduledTimeIST: string;
  status: string;
  platforms: string[];
  youtubeTitle: string;
  titleCharCount: number;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  youtubeDescription?: string;
  youtubeTags?: string[];
  thumbnailUrl?: string;
  thumbnailConcept: string;
  instagramCaption: string;
  instagramHashtags?: string;
  websiteTitle: string;
  storeUrl?: string;
  duplicateNote: string;
  offlineProtection?: {
    enabled: boolean;
    failSafeMechanism: string;
    preRendered: boolean;
  };
}

const INSTAGRAM_URL = 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr';
const STORE_BASE_URL = 'https://eight08-beat-store.onrender.com';

function generateCleanDescription(b: BeatEntry, slug: string) {
  const storeLink = `${STORE_BASE_URL}/#/beats/${slug}`;
  const genreTag = b.genre.replace(/[^a-zA-Z0-9]/g, '');

  return `
🔥 Subscribe to @808beatstore: https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5
📸 Instagram: ${INSTAGRAM_URL}
🌐 Official Beat Store: ${storeLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎹 BEAT SPECIFICATIONS:
• Title: ${b.title}
• BPM: ${b.bpm}${b.doubleBpm ? ` (Double-time: ${b.doubleBpm} BPM)` : ''}
• Key: ${b.key}
• Mood: ${b.mood}
• Genre / Style: ${b.genre}
• Produced by: 808 Beat Store

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 FREE USAGE POLICY (MUST READ):
✅ [FREE] FOR YOUTUBE & INSTAGRAM CONTENT:
Aap is beat ko YouTube videos, Shorts aur Instagram Reels/Posts mein 100% FREE use kar sakte hain!
⚠️ Condition: Apne video title ya description mein credit dena mandatory hai: (Prod by 808 Beat Store).

❌ STRICT RESTRICTIONS:
• Commercial streaming platforms (Spotify, Apple Music, Wynk, JioSaavn, Amazon Music, etc.) par upload karna STRICTLY PROHIBITED hai.
• Is instrumental par YouTube Content ID ya copyright strike / claim register nahi kar sakte.
• Commercial distribution, streaming releases, ya exclusive ownership rights ke liye hamari official website visit karein: ${storeLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📩 Business & Inquiries:
• Instagram DM: @808_beatstore
• Official Store: ${STORE_BASE_URL}

#${genreTag}TypeBeat #typebeat2026 #808beatstore #freetypebeat #hiphopinstrumentals #freeforcontentcreators
`.trim();
}

function generateViralTags(b: BeatEntry) {
  const cleanGenre = b.genre.toLowerCase();
  return [
    `${b.title.toLowerCase()} type beat`,
    `${cleanGenre} type beat`,
    `${cleanGenre} type beat 2026`,
    'free type beat',
    '808 beat store',
    'type beat',
    'type beat 2026',
    'hard trap beat',
    'dark type beat',
    'free beats for content creators',
    'hip hop instrumental',
    'rap beat',
    'free beat download',
    'instrumental 2026',
    'studio beat',
    'producer beat store',
    `${b.bpm} bpm beat`,
    `${b.key} beat`,
    'free trap beat',
    'drill type beat'
  ];
}

function generateInstaHashtags(b: BeatEntry) {
  const genreTag = b.genre.replace(/[^a-zA-Z0-9]/g, '');
  return `#808BeatStore #${genreTag}TypeBeat #TypeBeat2026 #FreeTypeBeat #HipHopProducer #MusicProducer #BeatsForCreators #RapInstrumentals #IndianHipHop #ProducerLife`;
}

function run() {
  const filePath = path.resolve('data/scheduled-beats.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const beats: BeatEntry[] = JSON.parse(raw);

  console.log(`Updating all ${beats.length} beats with new clean descriptions...`);

  const updatedBeats = beats.map((b) => {
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const thumbnailUrl = `${STORE_BASE_URL}/assets/artwork/${slug}.jpg`;
    const storeUrl = `${STORE_BASE_URL}/#/beats/${slug}`;

    return {
      ...b,
      thumbnailUrl,
      storeUrl,
      youtubeDescription: generateCleanDescription(b, slug),
      youtubeTags: generateViralTags(b),
      instagramHashtags: generateInstaHashtags(b),
      offlineProtection: {
        enabled: true,
        failSafeMechanism: 'Pre-queued with automated YouTube cloud timer & local background fallback',
        preRendered: true
      }
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updatedBeats, null, 2), 'utf-8');
  console.log(`✅ data/scheduled-beats.json updated with clean descriptions (no timestamps, no untagged wording, clear YT/IG free usage)!`);
}

run();
