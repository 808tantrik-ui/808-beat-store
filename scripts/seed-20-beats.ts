import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function seed20Beats() {
  const raw = fs.readFileSync('data/scheduled-beats.json', 'utf-8');
  const scheduledBeats = JSON.parse(raw);

  console.log(`Found ${scheduledBeats.length} beats to sync with SQLite...`);

  // Get licenses
  const licenses = await prisma.license.findMany();
  const nonEx = licenses.find(l => l.name === 'NON_EXCLUSIVE');
  const ex = licenses.find(l => l.name === 'EXCLUSIVE');

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
      bpm: b.bpm,
      key: b.key,
      duration: 165,
      mood: b.mood,
      style: b.style || b.genre,
      genre: b.genre,
      producerName: '808 Tantrik',
      producerDisplayName: '808 Beat Store',
      copyrightOwner: 'MANOJ KUMAR KAITHAL',
      publisher: '808 Beat Store',
      status: 'PUBLISHED',
      featured: i < 6,
      playsCount: 200 + i * 35,
      salesCount: 0,
    };

    const beat = await prisma.beat.upsert({
      where: { slug: slug },
      update: beatData,
      create: beatData,
    });

    console.log(`Synced beat ${i + 1}/${scheduledBeats.length}: ${beat.title} (${slug})`);
  }

  console.log('✅ All 20 beats successfully synced with local database!');
  await prisma.$disconnect();
}

seed20Beats().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
