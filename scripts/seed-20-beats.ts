import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function seed20Beats() {
  console.log('Ensuring licenses and 20 beats are seeded in SQLite database...');

  // 1. Ensure Standard Licenses exist
  await prisma.license.upsert({
    where: { name: 'NON_EXCLUSIVE' },
    update: {
      active: true,
      price: 49,
      defaultPrice: 499,
    },
    create: {
      name: 'NON_EXCLUSIVE',
      displayName: 'Non-Exclusive License',
      description: 'High-quality commercial master files (MP3 + 24-Bit WAV) for streaming, singles, and music videos.',
      price: 49,
      defaultPrice: 499,
      isExclusive: false,
      includedFiles: JSON.stringify(['MP3', 'WAV', 'LICENSE_PDF']),
      commercialUsage: 'Commercial audio release across Spotify, Apple Music & YouTube.',
      streamingLimit: 500000,
      distributionLimit: 10000,
      active: true,
    },
  });

  await prisma.license.upsert({
    where: { name: 'EXCLUSIVE' },
    update: {
      active: true,
      price: 499,
      defaultPrice: 5999,
    },
    create: {
      name: 'EXCLUSIVE',
      displayName: 'Exclusive License',
      description: 'Sole ownership transfer. The beat is automatically permanently archived from the store and cannot be bought again.',
      price: 499,
      defaultPrice: 5999,
      isExclusive: true,
      includedFiles: JSON.stringify(['MP3', 'WAV', 'LICENSE_PDF', 'LEGAL_CONTRACT']),
      commercialUsage: 'Unlimited commercial streams, global synchronization, radio, cinema, and physical distribution.',
      streamingLimit: null,
      distributionLimit: null,
      active: true,
    },
  });

  // 2. Load and seed 20 beats
  const catalogPath = path.resolve(process.cwd(), 'data/scheduled-beats.json');
  if (!fs.existsSync(catalogPath)) {
    console.warn('scheduled-beats.json not found at', catalogPath);
    return;
  }

  const raw = fs.readFileSync(catalogPath, 'utf-8');
  const scheduledBeats = JSON.parse(raw);

  for (let i = 0; i < scheduledBeats.length; i++) {
    const b = scheduledBeats[i];
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const beatData = {
      title: b.title,
      slug: slug,
      description: b.youtubeDescription || `Studio master ${b.genre} beat produced by 808 Beat Store.`,
      artwork: `/assets/artwork/${slug}.jpg`,
      previewAudio: `/assets/audio/${slug}.wav`,
      privateMp3: `/assets/audio/${slug}.mp3`,
      privateWav: `/assets/audio/${slug}.wav`,
      bpm: b.bpm || 100,
      key: b.key || 'C Minor',
      duration: 165,
      mood: b.mood || 'High Energy',
      style: b.style || b.genre || 'Hip-Hop',
      genre: b.genre || 'Hip-Hop',
      producerName: '808 Tantrik',
      producerDisplayName: '808 Beat Store',
      copyrightOwner: 'MANOJ KUMAR KAITHAL',
      publisher: '808 Beat Store',
      status: 'PUBLISHED',
      featured: i < 6,
      playsCount: 200 + i * 35,
      salesCount: 0,
    };

    await prisma.beat.upsert({
      where: { slug: slug },
      update: beatData,
      create: {
        id: `beat-808-sched-${i + 1}-${slug}`,
        ...beatData,
      },
    });
  }

  console.log(`✅ Successfully synced all ${scheduledBeats.length} beats & licenses to database!`);
}

// Run standalone if executed directly
if (process.argv[1]?.includes('seed-20-beats')) {
  seed20Beats()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
