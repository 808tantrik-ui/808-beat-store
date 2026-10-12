import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173';
const TOKEN_PATH = path.resolve('scripts/.yt_token.json');

const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials(token);
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
const artDir = path.resolve('public/assets/artwork');

async function updateThumbnails() {
  console.log('\n🎨 Updating YouTube Studio custom thumbnails with new producer-level cinematic posters...\n');

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    if (!b.youtubeVideoId) continue;

    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const artPath = path.join(artDir, `${slug}.jpg`);

    if (!fs.existsSync(artPath)) {
      console.log(`⏩ [${i + 1}] Artwork not found for: ${slug}.jpg`);
      continue;
    }

    try {
      console.log(`🖼️ [${i + 1}/${beats.length}] Setting cinematic thumbnail for "${b.title}" (ID: ${b.youtubeVideoId})...`);
      await youtube.thumbnails.set({
        videoId: b.youtubeVideoId,
        media: {
          mimeType: 'image/jpeg',
          body: fs.createReadStream(artPath)
        }
      });
      console.log(`✅ Thumbnail updated on YouTube Studio for: "${b.title}"!`);
    } catch (err) {
      console.warn(`⚠️ Thumbnail update error for "${b.title}":`, err.message);
    }
  }
}

async function testInstagram() {
  console.log('\n📸 Checking Instagram Meta Graph API Connection...');
  const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!igToken || !igUserId) {
    console.log('⚠️ Instagram token missing in .env');
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${igUserId}?fields=id,name,username&access_token=${igToken}`);
    const data = await res.json();
    console.log('Instagram Account Info:', data);

    // If valid, test posting carousel / photo
    if (data.id) {
      console.log('✅ Instagram account verified! Preparing today\'s drop post for @808_beatstore...');
    }
  } catch (err) {
    console.warn('Instagram API check warning:', err.message);
  }
}

async function main() {
  await updateThumbnails();
  await testInstagram();
  console.log('\n🏁 Finished updating YouTube Studio thumbnails & Instagram check!');
}

main().catch(console.error);
