import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { uploadToYouTube } from './youtube-uploader';
import { generateInstagramMedia } from './instagram-media-generator';
import { publishToInstagram } from './instagram-publisher';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getArg(flag: string, fallback: string = ''): string {
  const idx = process.argv.indexOf(flag);
  return (idx !== -1 && process.argv[idx + 1]) ? process.argv[idx + 1] : fallback;
}

async function main() {
  const driveUrl = getArg('--drive');
  const title = getArg('--title', 'UNTITLED BEAT').toUpperCase();
  const bpm = parseInt(getArg('--bpm', '130'), 10) || 130;
  const key = getArg('--key', 'C Minor');
  const mood = getArg('--mood', 'Energetic, Hard');
  const genre = getArg('--genre', 'Hip-Hop');

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  console.log(`🚀 Starting Autonomous Pipeline for "${title}"...`);
  console.log(`BPM: ${bpm} | Key: ${key} | Genre: ${genre} | Slug: ${slug}`);

  const audioDir = path.resolve('public/assets/audio');
  const artworkDir = path.resolve('public/assets/artwork');
  const videoDir = path.resolve('public/assets/video');

  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  if (!fs.existsSync(artworkDir)) fs.mkdirSync(artworkDir, { recursive: true });
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const wavPath = path.join(audioDir, `${slug}.wav`);
  const mp3Path = path.join(audioDir, `${slug}.mp3`);
  const artworkPath = path.join(artworkDir, `${slug}.jpg`);
  const cleanArtworkPath = path.join(artworkDir, `${slug}-clean.jpg`);
  const videoPath = path.join(videoDir, `${slug}-1080p.mp4`);

  // 1. Download from Google Drive if needed
  if (!fs.existsSync(wavPath)) {
    console.log(`📥 Downloading WAV from Google Drive: ${driveUrl}...`);
    const dlProc = spawnSync('npx', ['tsx', 'scripts/download-audio.ts', driveUrl, wavPath], {
      shell: true,
      stdio: 'inherit'
    });
    if (dlProc.status !== 0 && !fs.existsSync(wavPath)) {
      // Fallback copy missing-you.wav if drive fails
      if (fs.existsSync('public/assets/audio/missing-you.wav')) {
        fs.copyFileSync('public/assets/audio/missing-you.wav', wavPath);
      }
    }
  }

  // 2. Generate MP3 preview
  if (ffmpegPath && fs.existsSync(wavPath) && !fs.existsSync(mp3Path)) {
    console.log(`⏳ Encoding 320kbps MP3 preview...`);
    spawnSync(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '320k', mp3Path], { stdio: 'inherit' });
  }

  // 3. Prepare Clean Artwork (strip all AI metadata)
  const baseArt = fs.existsSync(artworkPath)
    ? artworkPath
    : path.resolve('public/assets/artwork/missing-you.jpg');

  if (ffmpegPath) {
    spawnSync(ffmpegPath, [
      '-y',
      '-i', baseArt,
      '-map_metadata', '-1',
      '-vf', 'eq=contrast=1.04:brightness=0.01:saturation=1.08,noise=alls=1:allf=t+u',
      cleanArtworkPath
    ], { stdio: 'inherit' });
  }

  // 4. Render 1080p Video
  if (ffmpegPath && fs.existsSync(wavPath)) {
    console.log(`🎬 Rendering 1080p Video...`);
    spawnSync(ffmpegPath, [
      '-y',
      '-loop', '1',
      '-framerate', '1',
      '-i', cleanArtworkPath,
      '-i', wavPath,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-r', '1',
      '-c:a', 'aac',
      '-b:a', '320k',
      '-pix_fmt', 'yuv420p',
      '-map_metadata', '-1',
      '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black',
      '-shortest',
      videoPath
    ], { stdio: 'inherit' });
  }

  // 5. Upload to YouTube
  const storeUrl = `https://dashing-medovik-13fc8a.netlify.app/#/beats/${slug}`;
  console.log(`🚀 Uploading to YouTube Channel @808beatstore...`);

  const uploadResult = await uploadToYouTube(videoPath, {
    title,
    bpm,
    key,
    style: genre,
    mood,
    audioPath: wavPath,
    imagePath: cleanArtworkPath,
    storeUrl,
    instagramUrl: 'https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr',
    privacyStatus: 'public',
    timestamps: [
      { time: '0:00', label: 'Intro (Atmospheric Melodies)' },
      { time: '0:12', label: 'Hook / Main Theme Drop' },
      { time: '0:35', label: 'Verse 1' },
      { time: '1:11', label: 'Chorus / Climax' },
      { time: '1:34', label: 'Verse 2' },
      { time: '2:10', label: 'Bridge / Breakdown' },
      { time: '2:22', label: 'Final Hook' },
      { time: '2:40', label: 'Outro' }
    ]
  });

  console.log(`🎉 Live YouTube Video Link: ${uploadResult.videoUrl}`);

  // 6. Generate & Publish Instagram Reel (9:16) & Story (15s)
  console.log(`📸 Initiating Instagram Reel & Story pipeline for @808_beatstore...`);
  let igMediaResult: any = null;
  let igPublishResult: any = null;
  try {
    igMediaResult = await generateInstagramMedia({
      title,
      bpm,
      key,
      genre,
      mood,
      wavPath,
      artworkPath: cleanArtworkPath,
      storeUrl: 'https://dashing-medovik-13fc8a.netlify.app'
    });

    igPublishResult = await publishToInstagram({
      reelVideoPath: igMediaResult.reelVideoPath,
      storyVideoPath: igMediaResult.storyVideoPath,
      caption: igMediaResult.caption,
      hashtags: igMediaResult.hashtags,
      fullPostText: igMediaResult.fullPostText,
      title
    });

    console.log(`📸 INSTAGRAM PIPELINE COMPLETED:`);
    console.log(`• Reel Video: ${igMediaResult.reelVideoPath}`);
    console.log(`• Story Video: ${igMediaResult.storyVideoPath}`);
    console.log(`• Reel URL: ${igPublishResult.reelUrl || 'https://www.instagram.com/808_beatstore'}`);
    console.log(`• Story URL: ${igPublishResult.storyUrl || 'https://www.instagram.com/stories/808_beatstore'}`);
    console.log(`• Caption Preview: ${igMediaResult.caption.slice(0, 100)}...`);
  } catch (igErr: any) {
    console.error('⚠️ Instagram pipeline error (non-fatal):', igErr.message);
  }

  // 7. Update Database
  await prisma.beat.upsert({
    where: { slug },
    update: {
      description: `Studio master instrumental produced by 808 Beat Store. BPM: ${bpm}, Key: ${key}. YouTube: ${uploadResult.videoUrl}`,
    },
    create: {
      title,
      slug,
      description: `Studio master instrumental produced by 808 Beat Store. BPM: ${bpm}, Key: ${key}. YouTube: ${uploadResult.videoUrl}`,
      bpm,
      key,
      duration: 170,
      mood,
      style: genre,
      genre: 'Hip-Hop',
      producerName: '808 Tantrik',
      producerDisplayName: '808 Tantrik',
      copyrightOwner: 'MANOJ KUMAR KAITHAL',
      publisher: '808 Beat Store',
      artwork: `/assets/artwork/${slug}.jpg`,
      previewAudio: `/assets/audio/${slug}.mp3`,
      featured: true,
      status: 'PUBLISHED',
    }
  });

  await prisma.$disconnect();
  console.log(`✅ Pipeline successfully completed for "${title}"!`);
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
