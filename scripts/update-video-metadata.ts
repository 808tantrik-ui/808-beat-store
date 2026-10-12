import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { generateBeatSEO } from './youtube-uploader';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:5173';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const TOKEN_PATH = path.resolve(process.cwd(), 'scripts/.yt_token.json');

async function main() {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2Client.setCredentials(token);
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const videoId = 'zA4guofR34w';

  const seo = generateBeatSEO({
    title: 'MISSING YOU',
    bpm: 82,
    key: 'F Minor',
    style: 'Sad Emotional Hip Hop',
    mood: 'Longing, Emotional, Nostalgic',
    artistInspiration: '',
    audioPath: path.resolve('public/assets/audio/missing-you.wav'),
    imagePath: path.resolve('public/assets/artwork/missing-you.jpg'),
    storeUrl: 'https://dashing-medovik-13fc8a.netlify.app/#/beats/missing-you',
    timestamps: [
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

  console.log('📝 Updating YouTube video metadata for videoId:', videoId);
  console.log('📌 Title:', seo.title);

  const res = await youtube.videos.update({
    part: ['snippet'],
    requestBody: {
      id: videoId,
      snippet: {
        title: seo.title,
        description: seo.description,
        tags: seo.tags,
        categoryId: '10',
      }
    }
  });

  console.log('✅ Video metadata updated successfully! Live Title:', res.data.snippet?.title);
}

main().catch(err => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
