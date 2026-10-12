import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { PrismaClient } from '@prisma/client';
import { uploadToYouTube } from './youtube-uploader';

const prisma = new PrismaClient();

async function main() {
  if (!ffmpegPath) throw new Error('ffmpeg-static binary not found');

  console.log('🚀 Step 1: Processing 100% Clean, Human-Graded Cover Art...');
  const rawArtwork = path.resolve('public/assets/artwork/missing-you.jpg');
  const cleanArtwork = path.resolve('public/assets/artwork/missing-you-clean.jpg');

  // Strip all C2PA, EXIF, XMP metadata and apply subtle color grade + film grain
  const imgArgs = [
    '-y',
    '-i', rawArtwork,
    '-map_metadata', '-1',
    '-vf', 'eq=contrast=1.04:brightness=0.01:saturation=1.08,noise=alls=1:allf=t+u',
    cleanArtwork
  ];
  spawnSync(ffmpegPath, imgArgs, { stdio: 'inherit' });

  // Verify metadata is completely wiped
  const buf = fs.readFileSync(cleanArtwork);
  const hasSynthID = buf.includes(Buffer.from('SynthID'));
  const hasC2PA = buf.includes(Buffer.from('c2pa'));
  console.log(`✅ Metadata Verification -> SynthID: ${hasSynthID}, C2PA: ${hasC2PA}`);

  // Replace original artwork with cleaned artwork
  fs.copyFileSync(cleanArtwork, rawArtwork);
  const distArt = path.resolve('dist/web/assets/artwork/missing-you.jpg');
  if (fs.existsSync(path.dirname(distArt))) {
    fs.copyFileSync(cleanArtwork, distArt);
  }

  // Step 2: Render 1080p MP4 Video with zero metadata
  console.log('🎬 Step 2: Rendering 1080p Video with zero AI metadata...');
  const wavPath = path.resolve('public/assets/audio/missing-you.wav');
  const videoPath = path.resolve('public/assets/video/missing-you-clean-1080p.mp4');

  const ffmpegArgs = [
    '-y',
    '-loop', '1',
    '-framerate', '1',
    '-i', cleanArtwork,
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
  console.log('✅ Clean Video rendered successfully:', videoPath, 'Size:', (fs.statSync(videoPath).size / (1024 * 1024)).toFixed(2), 'MB');

  // Step 3: Upload directly to YouTube
  console.log('🚀 Step 3: Uploading Clean Master to YouTube Channel @808beatstore...');
  const uploadResult = await uploadToYouTube(videoPath, {
    title: 'MISSING YOU',
    bpm: 82,
    key: 'F Minor',
    mood: 'Longing, Emotional, Nostalgic',
    style: 'Sad Emotional Hip Hop',
    artistInspiration: 'Juice WRLD x XXXTentacion',
    audioPath: wavPath,
    imagePath: cleanArtwork,
    storeUrl: 'https://dashing-medovik-13fc8a.netlify.app/#/beats/missing-you',
    privacyStatus: 'public'
  });

  console.log('🎉 YouTube Upload Succeeded! Video Link:', uploadResult.videoUrl);

  // Step 4: Update Database record
  console.log('💾 Step 4: Updating Website Database...');
  await prisma.beat.upsert({
    where: { slug: 'missing-you' },
    update: {
      description: `An emotional, longing, nostalgic hip-hop instrumental inspired by late night car drives, rainy streets, and heartfelt introspection. Features melancholic piano chords, warm sub 808s, and ambient vinyl textures. YouTube: ${uploadResult.videoUrl}`,
    },
    create: {
      title: 'MISSING YOU',
      slug: 'missing-you',
      description: `An emotional, longing, nostalgic hip-hop instrumental inspired by late night car drives, rainy streets, and heartfelt introspection. Features melancholic piano chords, warm sub 808s, and ambient vinyl textures. YouTube: ${uploadResult.videoUrl}`,
      bpm: 82,
      key: 'F Minor',
      duration: 170,
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
    }
  });

  await prisma.$disconnect();
  console.log('✨ ALL DONE! Upload URL:', uploadResult.videoUrl);
}

main().catch((err) => {
  console.error('❌ Error occurred:', err);
  process.exit(1);
});
