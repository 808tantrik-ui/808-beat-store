import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { generateInstagramBundle } from './youtube-uploader';

export interface InstagramMediaOptions {
  title: string;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  wavPath: string;
  artworkPath: string;
  storeUrl?: string;
  reelDurationSeconds?: number;
  storyDurationSeconds?: number;
  hookStartSeconds?: number;
}

export interface InstagramMediaResult {
  reelVideoPath: string;
  storyVideoPath: string;
  caption: string;
  hashtags: string;
  fullPostText: string;
  slug: string;
}

/**
 * Renders high-retention 9:16 vertical videos for Instagram Reels and Stories
 * Dimensions: 1080x1920 (Standard vertical format)
 * Visuals: Ambient blurred moving background + Sharp centered cover art
 */
export async function generateInstagramMedia(options: InstagramMediaOptions): Promise<InstagramMediaResult> {
  const {
    title,
    bpm,
    key,
    genre,
    mood,
    wavPath,
    artworkPath,
    storeUrl = 'https://eight08-beat-store.onrender.com',
    reelDurationSeconds = 45, // High engagement reel duration
    storyDurationSeconds = 15 // Standard Instagram Story duration
  } = options;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const igOutputDir = path.resolve('public/assets/instagram');

  if (!fs.existsSync(igOutputDir)) {
    fs.mkdirSync(igOutputDir, { recursive: true });
  }

  const reelVideoPath = path.join(igOutputDir, `${slug}-reel-9x16.mp4`);
  const storyVideoPath = path.join(igOutputDir, `${slug}-story-9x16.mp4`);

  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not available for video rendering');
  }

  console.log(`\n======================================================`);
  console.log(`📸 GENERATING INSTAGRAM 9:16 VERTICAL ASSETS: "${title}"`);
  console.log(`======================================================`);

  // Aesthetic Vertical Filter: Blurred 1080x1920 ambient background + Centered sharp 920x920 artwork
  const filterComplex = '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:20[bg];' +
    '[0:v]scale=920:920:force_original_aspect_ratio=decrease[fg];' +
    '[bg][fg]overlay=(W-w)/2:(H-h)/2[v]';

  // Smart Hook & Drop Offset: Skip initial quiet intro to start directly on the viral 808 drop/hook!
  const hookStartSeconds = options.hookStartSeconds !== undefined ? options.hookStartSeconds : 15;

  // 1. Render Instagram Reel (9:16 Vertical, cut directly from viral drop/hook)
  if (!fs.existsSync(reelVideoPath)) {
    console.log(`⏳ Rendering Instagram Reel (1080x1920 - Drop Hook @ ${hookStartSeconds}s, Duration: ${reelDurationSeconds}s)...`);
    const reelArgs = [
      '-y',
      '-loop', '1',
      '-framerate', '24',
      '-i', artworkPath,
      '-ss', String(hookStartSeconds),
      '-i', wavPath,
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-map', '1:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-pix_fmt', 'yuv420p',
      '-t', String(reelDurationSeconds),
      '-movflags', '+faststart',
      reelVideoPath
    ];

    const reelProc = spawnSync(ffmpegPath, reelArgs, { stdio: 'inherit' });
    if (reelProc.status !== 0) {
      console.error('❌ Failed to render Instagram Reel video');
    } else {
      console.log(`✅ Instagram Reel ready: ${reelVideoPath}`);
    }
  } else {
    console.log(`ℹ️ Instagram Reel video already exists: ${reelVideoPath}`);
  }

  // 2. Render Instagram Story (9:16 Vertical, 15s High-Energy Hook Teaser)
  if (!fs.existsSync(storyVideoPath)) {
    console.log(`⏳ Rendering Instagram Story (1080x1920 - Hook @ ${hookStartSeconds}s, ${storyDurationSeconds}s Teaser)...`);
    const storyArgs = [
      '-y',
      '-loop', '1',
      '-framerate', '24',
      '-i', artworkPath,
      '-ss', String(hookStartSeconds),
      '-i', wavPath,
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-map', '1:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-pix_fmt', 'yuv420p',
      '-t', String(storyDurationSeconds),
      '-movflags', '+faststart',
    ];

    const storyProc = spawnSync(ffmpegPath, storyArgs, { stdio: 'inherit' });
    if (storyProc.status !== 0) {
      console.error('❌ Failed to render Instagram Story video');
    } else {
      console.log(`✅ Instagram Story ready: ${storyVideoPath}`);
    }
  } else {
    console.log(`ℹ️ Instagram Story video already exists: ${storyVideoPath}`);
  }

  // 3. Generate Viral Caption & 3-Tier Hashtags
  const igBundle = generateInstagramBundle({
    title,
    bpm,
    key,
    style: genre,
    mood,
    audioPath: wavPath,
    imagePath: artworkPath,
    storeUrl: `${storeUrl}/#/beats/${slug}`
  });

  return {
    reelVideoPath,
    storyVideoPath,
    caption: igBundle.caption,
    hashtags: igBundle.hashtags,
    fullPostText: igBundle.fullPostText,
    slug
  };
}
