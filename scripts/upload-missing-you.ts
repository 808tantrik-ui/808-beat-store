import path from 'path';
import fs from 'fs';
import { uploadToYouTube } from './youtube-uploader';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const videoPath = path.resolve('public/assets/video/missing-you-1080p.mp4');
  
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at: ${videoPath}. Please ensure video rendering is complete.`);
  }

  console.log('🚀 Initiating YouTube Upload with Viral SEO Package...');
  
  const uploadResult = await uploadToYouTube(videoPath, {
    title: 'MISSING YOU',
    bpm: 82,
    key: 'F Minor',
    mood: 'Longing, Emotional, Nostalgic',
    style: 'Sad Emotional Hip Hop',
    artistInspiration: 'Juice WRLD x XXXTentacion',
    audioPath: path.resolve('public/assets/audio/missing-you.wav'),
    imagePath: path.resolve('public/assets/artwork/missing-you.jpg'),
    storeUrl: 'https://eight08-beat-store.onrender.com/#/beats/missing-you',
    privacyStatus: 'public'
  });

  console.log('🎉 YouTube Upload Completed:', uploadResult);

  // Update beat in database with YouTube URL and video ID
  const updatedBeat = await prisma.beat.updateMany({
    where: { slug: 'missing-you' },
    data: {
      youtubeUrl: uploadResult.videoUrl,
      youtubeId: uploadResult.videoId,
    }
  });

  console.log('✅ Database updated with YouTube URL:', uploadResult.videoUrl);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Upload failed:', err);
  process.exit(1);
});
