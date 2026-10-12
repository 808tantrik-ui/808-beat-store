import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import readline from 'readline';

// Initialize OAuth2 client from project environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:5173';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const TOKEN_PATH = path.resolve(process.cwd(), 'scripts/.yt_token.json');

export interface BeatVideoMetadata {
  title: string;
  bpm: number | string;
  key: string;
  style?: string;
  mood?: string;
  artistInspiration?: string;
  audioPath: string;
  imagePath: string;
  storeUrl?: string;
  privacyStatus?: 'public' | 'unlisted' | 'private';
  publishAt?: string;
  instagramUrl?: string;
  timestamps?: Array<{ time: string; label: string }>;
}

/**
 * Generates high-converting, high-ranking SEO metadata for YouTube Beat uploads
 */
export function generateBeatSEO(meta: BeatVideoMetadata) {
  const storeLink = meta.storeUrl || 'https://eight08-beat-store.onrender.com';
  const style = meta.style || 'Hip-Hop';
  const mood = meta.mood || 'Dark';
  const bpm = meta.bpm || '140';
  const key = meta.key || 'C Minor';
  const inspiration = meta.artistInspiration ? `${meta.artistInspiration} ` : '';

  // 1. Title formatting rule: Always append 'Prod by 808 Beat Store' cleanly at the very end
  const titleCore = `[FREE] "${meta.title}" | ${inspiration}${style} Type Beat (${bpm} BPM - ${key})`;
  const videoTitle = `${titleCore} | Prod by 808 Beat Store`.slice(0, 100);

  // 2. High-Retention Description Template
  const instaUrl = meta.instagramUrl !== undefined && meta.instagramUrl !== ''
    ? meta.instagramUrl
    : 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr';
  const instagramSection = `\n📸 Instagram: ${instaUrl}`;
  const timestampText = meta.timestamps && meta.timestamps.length > 0
    ? meta.timestamps.map(t => `${t.time} - ${t.label}`).join('\n')
    : `0:00 - Intro\n0:12 - Hook\n0:35 - Verse 1\n1:11 - Chorus / Hook\n1:34 - Verse 2\n2:10 - Bridge\n2:22 - Final Hook\n2:40 - Outro`;

  const videoDescription = `
💰 Purchase / Instant Untagged Download: ${storeLink}
🔥 Subscribe to @808beatstore: https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5${instagramSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎹 BEAT SPECIFICATIONS:
• Title: ${meta.title}
• BPM: ${bpm}
• Key: ${key}
• Mood: ${mood}
• Style: ${style}
• Produced by: 808 Beat Store

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 LICENSING & PRICING:
• Non-Exclusive License (WAV + MP3): High-quality commercial master files across Spotify, Apple Music & YouTube.
• Exclusive Ownership: Full master ownership transfer, uncompressed multi-track stems.
👉 Instant checkout & license clearance: ${storeLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ TIMESTAMPS:
${timestampText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ USAGE TERMS:
Free download is for NON-COMMERCIAL / AUDITION use only. 
For commercial streaming release, you must purchase a license at ${storeLink}.
Always credit in title: (Prod by 808 Beat Store).

#${style.replace(/\s+/g, '')}TypeBeat #typebeat2026 #808beatstore #buybeats #hiphopinstrumentals #freepromobeats
`.trim();

  // 3. Top High-Volume Search Tags
  const tags = [
    `${meta.title} type beat`,
    `${style.toLowerCase()} type beat`,
    `${style.toLowerCase()} type beat 2026`,
    'free type beat',
    '808 beat store',
    'type beat',
    'type beat 2026',
    'hard trap beat',
    'dark type beat',
    'buy beats online',
    'hip hop instrumental',
    'rap beat',
    'free beat download',
    'instrumental 2026',
    'studio beat',
    'producer beat store',
    `${bpm} bpm beat`,
    `${key} beat`,
  ].slice(0, 30);

  return { title: videoTitle, description: videoDescription, tags };
}

/**
 * Combines Cover Art Image + Audio File into a 1080p MP4 Video using ffmpeg-static
 */
export async function createBeatVideo(audioPath: string, imagePath: string, outputPath: string): Promise<string> {
  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found');
  if (!fs.existsSync(audioPath)) throw new Error(`Audio file not found: ${audioPath}`);
  if (!fs.existsSync(imagePath)) throw new Error(`Image file not found: ${imagePath}`);

  console.log(`🎬 Rendering 1080p Video from [${path.basename(audioPath)}] + [${path.basename(imagePath)}]...`);

  return new Promise((resolve, reject) => {
    // FFmpeg command to loop 1 static image over full duration of audio with high bitrate
    const args = [
      '-y',
      '-loop', '1',
      '-i', imagePath,
      '-i', audioPath,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '320k',
      '-pix_fmt', 'yuv420p',
      '-map_metadata', '-1',
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black',
      '-shortest',
      outputPath,
    ];

    const proc = spawn(ffmpegPath, args);

    proc.stderr.on('data', () => {
      // Progress pulse
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Video rendered successfully: ${outputPath}`);
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Uploads an MP4 Video to YouTube with complete SEO metadata
 */
export async function uploadToYouTube(videoPath: string, meta: BeatVideoMetadata) {
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('YouTube OAuth token not found. Please run authentication first.');
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2Client.setCredentials(token);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const seo = generateBeatSEO(meta);

  console.log(`🚀 Uploading to YouTube channel @808beatstore...`);
  console.log(`📝 Title: ${seo.title}`);

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: seo.title,
        description: seo.description,
        tags: seo.tags,
        categoryId: '10', // 10 = Music Category
      },
      status: {
        privacyStatus: meta.publishAt ? 'private' : (meta.privacyStatus || 'public'),
        ...(meta.publishAt ? { publishAt: meta.publishAt } : {}),
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const videoUrl = `https://youtu.be/${videoId}`;
  console.log(`🎉 SUCCESS! Beat uploaded to YouTube: ${videoUrl}`);
  return { videoId, videoUrl, title: seo.title };
}

/**
 * Generates viral hook-driven captions and 3-tier hashtag bundles for Instagram Reels & Posts
 */
export function generateInstagramBundle(meta: BeatVideoMetadata) {
  const storeLink = meta.storeUrl || 'https://eight08-beat-store.onrender.com';
  const cleanStyle = (meta.style || 'HipHop').replace(/[^a-zA-Z0-9]/g, '');
  const cleanMood = (meta.mood || 'Vibes').replace(/[^a-zA-Z0-9]/g, '');

  const reelCaption = `
💔 "${meta.title}" (${meta.bpm} BPM • ${meta.key})
Who sounds best on this instrumental? Drop their @ in the comments 👇

🎹 Produced by @808beatstore
💎 Instant untagged WAV + Stems available now
🔗 Direct licensing link in bio: ${storeLink}

Save & share this reel if you're making music this week 🔥
`.trim();

  // Curated 3-Tier Instagram Hashtag Strategy (Broad, Niche, Community)
  const hashtags = [
    // Tier 1: Broad Music & Beats (High Volume Reach)
    '#TypeBeat', '#MusicProducer', '#BeatsForSale', '#HipHopProducer', '#Beatmaker',
    '#RapInstrumentals', '#ProducerLife', '#NewMusicAlert', '#FlStudio', '#StudioVibes',
    // Tier 2: Niche Genre & Mood (Algorithm Push)
    `#${cleanStyle}TypeBeat`, `#${cleanMood}Beats`, `#SadRapBeat`, `#EmotionalTypeBeat`,
    `#MelodicRapBeat`, `#JuiceWRLDTypeBeat`, `#XXXTentacionTypeBeat`, `#LateNightVibes`,
    `#GuitarBeats`, `#PianoTypeBeat`,
    // Tier 3: Store & Producer Community (Targeted Buyer Audience)
    '#808BeatStore', '#BuyBeatsOnline', '#NeedBeats', '#FreeBeats', '#RappersLookingForBeats',
    '#SongwriterCommunity', '#IndieArtist', '#UndergroundRapper', '#MusicCreation', '#BeatStars'
  ];

  return {
    caption: reelCaption,
    hashtags: hashtags.join(' '),
    fullPostText: `${reelCaption}\n\n.\n.\n.\n${hashtags.join(' ')}`
  };
}

