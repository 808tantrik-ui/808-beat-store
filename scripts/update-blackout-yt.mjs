import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CLIENT_ID = '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173';
const TOKEN_PATH = path.resolve('scripts/.yt_token.json');

async function main() {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials(token);

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
  const blackout = beats[0];

  const videoId = blackout.youtubeVideoId || 'ftN46v39wiM';

  console.log(`Updating YouTube Video ID: ${videoId} with clean metadata...`);

  const res = await youtube.videos.update({
    part: ['snippet'],
    requestBody: {
      id: videoId,
      snippet: {
        title: blackout.youtubeTitle,
        description: blackout.youtubeDescription,
        tags: blackout.youtubeTags || ['blackout type beat', 'dark trap type beat', '808 beat store', 'free type beat'],
        categoryId: '10'
      }
    }
  });

  console.log(`✅ YouTube snippet updated for "${blackout.title}"!`);

  // Update thumbnail
  const thumbPath = path.resolve('public/assets/artwork/blackout.jpg');
  if (fs.existsSync(thumbPath)) {
    try {
      await youtube.thumbnails.set({
        videoId,
        media: {
          mimeType: 'image/jpeg',
          body: fs.createReadStream(thumbPath)
        }
      });
      console.log(`✅ YouTube thumbnail updated on YouTube Studio for "${blackout.title}"!`);
    } catch (e) {
      console.warn('Thumbnail set warning:', e.message);
    }
  }

  console.log('🎉 Done! BLACKOUT is updated with clean description and new thumbnail on YouTube Studio!');
}

main().catch(console.error);
