import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Automated Processing for "MISSING YOU"...');

  // 1. Copy Cover Art
  const srcImg = 'C:\\Users\\808ta\\.gemini\\antigravity-ide\\brain\\c88b4109-a59a-4972-949a-8232c48c63a8\\missing_you_cover_1791229530112.jpg';
  const artworkDir = path.resolve('public/assets/artwork');
  if (!fs.existsSync(artworkDir)) fs.mkdirSync(artworkDir, { recursive: true });
  const destArtwork = path.join(artworkDir, 'missing-you.jpg');
  fs.copyFileSync(srcImg, destArtwork);
  console.log('✅ Cover Art saved to:', destArtwork);

  // Also copy to dist if dist exists
  const distArtworkDir = path.resolve('dist/web/assets/artwork');
  if (fs.existsSync('dist/web')) {
    if (!fs.existsSync(distArtworkDir)) fs.mkdirSync(distArtworkDir, { recursive: true });
    fs.copyFileSync(srcImg, path.join(distArtworkDir, 'missing-you.jpg'));
  }

  // 2. Convert WAV to 320k MP3 Preview
  const wavPath = path.resolve('public/assets/audio/missing-you.wav');
  const mp3Path = path.resolve('public/assets/audio/missing-you.mp3');

  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found');

  console.log('⏳ Encoding 320kbps MP3 preview with FFmpeg...');
  spawnSync(ffmpegPath, ['-y', '-i', wavPath, '-b:a', '320k', mp3Path], { stdio: 'inherit' });
  console.log('✅ MP3 Preview created:', mp3Path, 'Size:', (fs.statSync(mp3Path).size / (1024 * 1024)).toFixed(2), 'MB');

  // 3. Render 1080p YouTube Video (MP4)
  const videoDir = path.resolve('public/assets/video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  const videoPath = path.join(videoDir, 'missing-you-1080p.mp4');

  console.log('⏳ Rendering 1080p YouTube Video (Cover Art + Audio)...');
  // Combine 1080x1080 square cover on blurred/dark aesthetic background or scaled to 1920x1080
  const ffmpegArgs = [
    '-y',
    '-loop', '1',
    '-framerate', '1',
    '-i', destArtwork,
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
  ];
  spawnSync(ffmpegPath, ffmpegArgs, { stdio: 'inherit' });
  console.log('✅ 1080p YouTube Video created at:', videoPath, 'Size:', (fs.statSync(videoPath).size / (1024 * 1024)).toFixed(2), 'MB');

  // 4. Publish Beat into Database
  console.log('⏳ Adding "MISSING YOU" into Website Catalog & Database...');
  
  // Check if beat already exists
  const existing = await prisma.beat.findFirst({ where: { title: 'MISSING YOU' } });
  if (existing) {
    await prisma.beat.delete({ where: { id: existing.id } });
  }

  const beat = await prisma.beat.create({
    data: {
      title: 'MISSING YOU',
      slug: 'missing-you',
      description: 'An emotional, longing, nostalgic hip-hop instrumental inspired by late night car drives, rainy streets, and heartfelt introspection. Features melancholic piano chords, warm sub 808s, and ambient vinyl textures.',
      bpm: 82,
      key: 'F Minor',
      duration: 185,
      mood: 'Emotional',
      style: 'Sad / Emotional Hip-Hop',
      genre: 'Hip-Hop',
      producerName: '808 Tantrik',
      producerDisplayName: '808 Tantrik',
      copyrightOwner: 'MANOJ KUMAR KAITHAL',
      publisher: '808 Beat Store',
      artwork: '/assets/artwork/missing-you.jpg',
      previewAudio: '/assets/audio/missing-you.mp3',
      featured: true,
      status: 'PUBLISHED',
    },
  });

  console.log('🎉 Beat published to website database successfully!');
  console.log('Beat ID:', beat.id);
  console.log('Slug:', beat.slug);
  console.log('Artwork:', beat.artwork);
  console.log('Preview:', beat.previewAudio);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Error in prepare-beat:', err);
  process.exit(1);
});
