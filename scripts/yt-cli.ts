import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import readline from 'readline';
import { createBeatVideo, uploadToYouTube, generateBeatSEO, BeatVideoMetadata } from './youtube-uploader.js';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:5173';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const TOKEN_PATH = path.resolve(process.cwd(), 'scripts/.yt_token.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

async function main() {
  const command = process.argv[2];

  if (command === 'auth') {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });

    console.log('\n======================================================');
    console.log('🔴 YOUTUBE CHANNEL AUTHORIZATION (@808beatstore)');
    console.log('======================================================\n');
    console.log('1. Apne browser me ye URL open karein:');
    console.log(`\n👉 ${authUrl}\n`);
    console.log('2. Apne YouTube channel (@808beatstore) wali Google account se Allow karein.');
    console.log('3. Redirect hone ke baad jo URL me "code=" parameter aayega, wo code yahan paste karein:');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('\nEnter code here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log('\n✅ Mubarak ho! YouTube channel successfully authorized & saved!');
      } catch (err: any) {
        console.error('❌ Authorization failed:', err.message);
      }
    });
    return;
  }

  if (command === 'test-seo') {
    const sampleMeta: BeatVideoMetadata = {
      title: 'Dark Horizon',
      bpm: 140,
      key: 'C Minor',
      style: 'Dark Trap',
      mood: 'Aggressive',
      artistInspiration: 'Drake x Travis Scott',
      audioPath: '',
      imagePath: '',
    };
    const seo = generateBeatSEO(sampleMeta);
    console.log('\n🔥 GENERATED YOUTUBE SEO METADATA:');
    console.log('--------------------------------------------------');
    console.log('TITLE:\n', seo.title);
    console.log('\nDESCRIPTION PREVIEW:\n', seo.description.slice(0, 300) + '...');
    console.log('\nTAGS:\n', seo.tags.join(', '));
    return;
  }

  console.log('Usage:');
  console.log('  npx tsx scripts/yt-cli.ts auth       - Authenticate YouTube channel');
  console.log('  npx tsx scripts/yt-cli.ts test-seo   - Preview SEO generation');
}

main().catch(console.error);
