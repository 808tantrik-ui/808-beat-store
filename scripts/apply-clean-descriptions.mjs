import fs from 'fs';
import path from 'path';

const INSTAGRAM_URL = 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr';
const STORE_BASE_URL = 'https://dashing-medovik-13fc8a.netlify.app';

function generateCleanDescription(b, slug) {
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
• Production: 808 Beat Store

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

#${genreTag}TypeBeat #typebeat2026 #808beatstore #freetypebeat #hiphopinstrumentals #freeforcreators
`.trim();
}

const filePath = path.resolve('data/scheduled-beats.json');
const raw = fs.readFileSync(filePath, 'utf-8');
const beats = JSON.parse(raw);

const updatedBeats = beats.map((b) => {
  const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const thumbnailUrl = `${STORE_BASE_URL}/assets/artwork/${slug}.jpg`;
  const storeUrl = `${STORE_BASE_URL}/#/beats/${slug}`;

  return {
    ...b,
    thumbnailUrl,
    storeUrl,
    youtubeDescription: generateCleanDescription(b, slug)
  };
});

fs.writeFileSync(filePath, JSON.stringify(updatedBeats, null, 2), 'utf-8');
console.log(`✅ All ${updatedBeats.length} beats in data/scheduled-beats.json updated with clean descriptions!`);
