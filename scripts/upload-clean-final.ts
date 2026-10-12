import fs from 'fs';
import path from 'path';
import { uploadToYouTube } from './youtube-uploader';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videoPath = path.resolve('public/assets/video/missing-you-clean-1080p.mp4');
  const artworkPath = path.resolve('public/assets/artwork/missing-you-clean.jpg');
  const wavPath = path.resolve('public/assets/audio/missing-you.wav');

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  console.log('🚀 Uploading Clean Master Beat Video to YouTube Channel @808beatstore...');
  
  const uploadResult = await uploadToYouTube(videoPath, {
    title: 'MISSING YOU',
    bpm: 82,
    key: 'F Minor',
    style: 'Sad Emotional Hip Hop',
    mood: 'Longing, Emotional, Nostalgic',
    artistInspiration: '',
    audioPath: wavPath,
    imagePath: artworkPath,
    storeUrl: 'https://dashing-medovik-13fc8a.netlify.app/#/beats/missing-you',
    privacyStatus: 'public',
    instagramUrl: '', // Rule 4: Blank placeholder until explicitly provided
    timestamps: [     // Rule 3: Precise structural audio analysis timestamps
      { time: '0:00', label: 'Intro (Melancholic Rhodes & Ambient Vinyl)' },
      { time: '0:12', label: 'Hook (Emotional Melody & 808 Drop)' },
      { time: '0:35', label: 'Verse 1 (Atmospheric Rap Section)' },
      { time: '1:11', label: 'Chorus / Hook (Main Emotional Climax)' },
      { time: '1:34', label: 'Verse 2 (Dynamic Percussion & 808s)' },
      { time: '2:10', label: 'Bridge (Piano Breakdown)' },
      { time: '2:22', label: 'Final Chorus / Hook (Peak Energy)' },
      { time: '2:40', label: 'Outro (Fading Ambient Keys)' }
    ]
  });

  console.log('🎉 Upload Completed! New YouTube URL:', uploadResult.videoUrl);

  // Update Prisma database
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

  // Update fallbackData.ts
  const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');
  if (fs.existsSync(fallbackPath)) {
    let content = fs.readFileSync(fallbackPath, 'utf-8');
    content = content.replace(
      /https:\/\/youtu\.be\/[a-zA-Z0-9_-]+/g,
      uploadResult.videoUrl
    );
    fs.writeFileSync(fallbackPath, content, 'utf-8');
    console.log('✅ fallbackData.ts updated with new YouTube link');
  }

  await prisma.$disconnect();
  console.log('🏁 Everything completed successfully!');
}

main().catch(err => {
  console.error('❌ Upload error:', err);
  process.exit(1);
});
