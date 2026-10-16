import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { producerBrand, brandHelpers } from '../packages/config/src/brand.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial marketplace catalog and licenses...');

  const nonExPrice = brandHelpers.getNonExclusivePrice(producerBrand);
  const exPrice = brandHelpers.getExclusivePrice(producerBrand);

  // 1. Clear existing seed data if any
  await prisma.download.deleteMany({});
  await prisma.licenseDocument.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.beatAsset.deleteMany({});
  await prisma.licenseFeature.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.beat.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@beatstore.local',
      name: 'Executive Producer',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      adminProfile: {
        create: {
          permissions: 'ALL',
        },
      },
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // 3. Seed Exactly 2 Licenses: Non-Exclusive & Exclusive
  const nonExclusiveLicense = await prisma.license.create({
    data: {
      name: 'NON_EXCLUSIVE',
      displayName: 'Non-Exclusive License',
      description: 'High-quality commercial master files (MP3 + 24-Bit WAV) for streaming, singles, and music videos.',
      price: nonExPrice,
      defaultPrice: nonExPrice,
      isExclusive: false,
      includedFiles: JSON.stringify(['MP3', 'WAV', 'LICENSE_PDF']),
      commercialUsage: 'Commercial audio release across Spotify, Apple Music & YouTube.',
      streamingLimit: 500000,
      distributionLimit: 10000,
      musicVideoLimit: 2,
      radioBroadcasting: true,
      forProfitPerformances: true,
      creditRequirement: 'Must credit in title/description: (Prod by 808 Beat Store)',
      active: true,
      features: {
        create: [
          { featureText: '24-Bit Studio Master WAV + 320kbps MP3', isHighlight: true },
          { featureText: 'Commercial Streaming & Distribution Rights', isHighlight: true },
          { featureText: 'Music Video & Live Performance Rights', isHighlight: false },
          { featureText: 'Instant Automated Download Delivery', isHighlight: true },
        ],
      },
    },
  });

  const exclusiveLicense = await prisma.license.create({
    data: {
      name: 'EXCLUSIVE',
      displayName: 'Exclusive License',
      description: 'Sole ownership transfer. The beat is automatically permanently archived from the store and cannot be bought again.',
      price: exPrice,
      defaultPrice: exPrice,
      isExclusive: true,
      includedFiles: JSON.stringify(['MP3', 'WAV', 'LICENSE_PDF', 'LEGAL_CONTRACT']),
      commercialUsage: 'Unlimited commercial streams, global synchronization, radio, cinema, and physical distribution.',
      streamingLimit: null,
      distributionLimit: null,
      musicVideoLimit: null,
      radioBroadcasting: true,
      forProfitPerformances: true,
      creditRequirement: 'Prod by 808 Beat Store',
      active: true,
      features: {
        create: [
          { featureText: '100% Sole Ownership Rights Transfer', isHighlight: true },
          { featureText: 'Beat Automatically Archived From Store Upon Purchase', isHighlight: true },
          { featureText: 'Unlimited Commercial Audio & Video Streams', isHighlight: true },
          { featureText: 'Master WAV & 320kbps MP3 Delivery', isHighlight: false },
          { featureText: 'Signed Exclusive Contract & Sync Clearance', isHighlight: true },
        ],
      },
    },
  });

  console.log('Created 2 license tiers: Non-Exclusive and Exclusive.');

  // 4. Seed 6 Strictly Hip-Hop Beats with rich authentic metadata
  const beatsData = [
    {
      title: 'Midnight Resonance',
      slug: 'midnight-resonance',
      bpm: 88,
      key: 'C Minor',
      duration: 194, // 3:14
      mood: 'Cinematic',
      style: 'Cinematic Hip-Hop',
      description: 'Orchestral strings layered over punchy boom-bap drums, heavy 808 sub frequencies, and nostalgic vinyl warmth.',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/612/612611_5674468-lq.mp3',
      featured: true,
      playsCount: 1420,
      salesCount: 8,
    },
    {
      title: 'Crown & Dynasty',
      slug: 'crown-and-dynasty',
      bpm: 92,
      key: 'D Minor',
      duration: 182, // 3:02
      mood: 'Motivational',
      style: 'Boom Bap',
      description: 'Triumphant brass stabs, hard-hitting kick-snare pocket, and deep upright bass built for storytelling lyricism.',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      featured: true,
      playsCount: 2310,
      salesCount: 14,
    },
    {
      title: 'Rain On Concrete',
      slug: 'rain-on-concrete',
      bpm: 78,
      key: 'G Minor',
      duration: 168, // 2:48
      mood: 'Melodic',
      style: 'Lo-Fi Hip-Hop',
      description: 'Mellow electric Rhodes piano chords, gentle vinyl crackle, melodic acoustic guitar riffs, and soulful head-nodding drums.',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
      featured: true,
      playsCount: 3840,
      salesCount: 22,
    },
    {
      title: 'Shadow Symphony',
      slug: 'shadow-symphony',
      bpm: 84,
      key: 'F Minor',
      duration: 210, // 3:30
      mood: 'Dark',
      style: 'East Coast Hip-Hop',
      description: 'Eerie gothic cello progression, gritty SP-1200 chopped samples, crisp rimshots, and rolling sub bass.',
      artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/387/387402_7255533-lq.mp3',
      featured: false,
      playsCount: 980,
      salesCount: 5,
    },
    {
      title: 'Soul Redemption',
      slug: 'soul-redemption',
      bpm: 86,
      key: 'E-Flat Major',
      duration: 176, // 2:56
      mood: 'Emotional',
      style: 'Soul Hip-Hop',
      description: 'Vintage 70s pitched vocal chop, warm Moog bassline, melodic grand piano, and authentic swing percussion.',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/612/612611_5674468-lq.mp3',
      featured: true,
      playsCount: 1890,
      salesCount: 11,
    },
    {
      title: 'Metropolitan Horizon',
      slug: 'metropolitan-horizon',
      bpm: 94,
      key: 'A Minor',
      duration: 198, // 3:18
      mood: 'Energetic',
      style: 'West Coast Hip-Hop',
      description: 'Lush analog synthesizer leads, groovy bassline, tight snare chops, and melodic guitar chords crafted for driving rhythms.',
      artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      previewAudio: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
      featured: false,
      playsCount: 1120,
      salesCount: 7,
    },
  ];

  for (const beatData of beatsData) {
    const beat = await prisma.beat.create({
      data: {
        ...beatData,
        genre: 'Hip-Hop',
        privateMp3: `vault/beats/${beatData.slug}/master.mp3`,
        privateWav: `vault/beats/${beatData.slug}/master.wav`,
        privateStems: `vault/beats/${beatData.slug}/stems.zip`,
        assets: {
          create: [
            { assetType: 'PREVIEW', storageKey: `public/previews/${beatData.slug}.mp3` },
            { assetType: 'MP3', storageKey: `vault/beats/${beatData.slug}/master.mp3`, fileSize: 9450000, mimeType: 'audio/mpeg' },
            { assetType: 'WAV', storageKey: `vault/beats/${beatData.slug}/master.wav`, fileSize: 48500000, mimeType: 'audio/wav' },
            { assetType: 'STEMS', storageKey: `vault/beats/${beatData.slug}/stems.zip`, fileSize: 210000000, mimeType: 'application/zip' },
          ],
        },
      },
    });
    console.log(`Created beat: ${beat.title} (${beat.bpm} BPM, ${beat.key})`);
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
