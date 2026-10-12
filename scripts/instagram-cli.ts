import path from 'path';
import fs from 'fs';
import { generateInstagramMedia } from './instagram-media-generator';
import { publishToInstagram } from './instagram-publisher';

function getArg(flag: string, fallback: string = ''): string {
  const idx = process.argv.indexOf(flag);
  return (idx !== -1 && process.argv[idx + 1]) ? process.argv[idx + 1] : fallback;
}

async function main() {
  const command = process.argv[2] || 'status';
  const title = getArg('--title', 'SAMPLE BEAT').toUpperCase();
  const bpm = parseInt(getArg('--bpm', '130'), 10) || 130;
  const key = getArg('--key', 'C Minor');
  const genre = getArg('--genre', 'Hip-Hop');
  const mood = getArg('--mood', 'Energetic');

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  console.log(`\n======================================================`);
  console.log(`📸 808 BEAT STORE - INSTAGRAM AUTOMATION SUITE`);
  console.log(`======================================================\n`);

  if (command === 'status') {
    const hasToken = !!(process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN);
    const hasAccount = !!(process.env.INSTAGRAM_ACCOUNT_ID || process.env.IG_USER_ID);
    console.log(`Status Check:`);
    console.log(`• Official Handle: @808_beatstore`);
    console.log(`• Official URL: https://www.instagram.com/808_beatstore`);
    console.log(`• Meta Graph API Token: ${hasToken ? '✅ Configured' : '⚙️ Local/Staging Mode (Set INSTAGRAM_ACCESS_TOKEN)'}`);
    console.log(`• Instagram Account ID: ${hasAccount ? '✅ Configured' : '⚙️ Local/Staging Mode (Set INSTAGRAM_ACCOUNT_ID)'}`);
    console.log(`• Reel Engine: 9:16 Vertical HD (1080x1920) H.264/AAC`);
    console.log(`• Story Engine: 9:16 Vertical Teaser (15s) H.264/AAC`);
    console.log(`• WhatsApp Bot Dispatch: Active`);
    process.exit(0);
  }

  // Find audio file
  const audioDir = path.resolve('public/assets/audio');
  const artworkDir = path.resolve('public/assets/artwork');

  let wavPath = path.join(audioDir, `${slug}.wav`);
  if (!fs.existsSync(wavPath)) {
    const wavFiles = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).filter(f => f.endsWith('.wav')) : [];
    if (wavFiles.length > 0) {
      wavPath = path.join(audioDir, wavFiles[0]);
    }
  }

  let artworkPath = path.join(artworkDir, `${slug}.jpg`);
  if (!fs.existsSync(artworkPath)) {
    artworkPath = path.resolve('public/assets/artwork/missing-you.jpg');
    if (!fs.existsSync(artworkPath)) {
      artworkPath = path.resolve('Studio front 360.jpg');
    }
  }

  if (!fs.existsSync(wavPath)) {
    console.error(`❌ No audio WAV file found in ${audioDir} to generate Instagram media.`);
    process.exit(1);
  }

  console.log(`🎵 Track: "${title}" (${bpm} BPM - ${key})`);
  console.log(`📁 Audio: ${wavPath}`);
  console.log(`🎨 Artwork: ${artworkPath}`);

  const mediaResult = await generateInstagramMedia({
    title,
    bpm,
    key,
    genre,
    mood,
    wavPath,
    artworkPath
  });

  const publishResult = await publishToInstagram({
    reelVideoPath: mediaResult.reelVideoPath,
    storyVideoPath: mediaResult.storyVideoPath,
    caption: mediaResult.caption,
    hashtags: mediaResult.hashtags,
    fullPostText: mediaResult.fullPostText,
    title
  });

  console.log(`\n🎉 INSTAGRAM AUTOMATION COMPLETE:`);
  console.log(`• Reel File: ${mediaResult.reelVideoPath}`);
  console.log(`• Story File: ${mediaResult.storyVideoPath}`);
  console.log(`• Status: ${publishResult.statusMessage}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
