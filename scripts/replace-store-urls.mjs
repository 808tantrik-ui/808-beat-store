import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const OLD_URL = 'https://eight08-beat-store.onrender.com';
const NEW_URL = 'https://eight08-beat-store.onrender.com';

console.log(`🔄 Replacing old store URL: ${OLD_URL}`);
console.log(`➡️ With new store URL: ${NEW_URL}\n`);

// 1. Files to update directly
const targetFiles = [
  'data/scheduled-beats.json',
  'apps/web/src/data/fallbackData.ts',
  'scripts/apply-clean-descriptions.mjs',
  'scripts/auto-yt-auth-and-upload.mjs',
  'scripts/prepare-bulk-schedule.ts',
  'scripts/prepare-clean-beat.ts',
  'scripts/update-video-metadata.ts',
  'scripts/youtube-uploader.ts',
  'scripts/upload-clean-final.ts',
  'scripts/upload-missing-you.ts',
  'scripts/whatsapp-bot.ts',
  'scripts/whatsapp-pipeline.ts',
  'scripts/instagram-media-generator.ts',
  'scripts/instagram-publisher.ts',
  'scripts/schedule-manager.ts',
];

for (const relPath of targetFiles) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    if (raw.includes(OLD_URL)) {
      const updated = raw.replaceAll(OLD_URL, NEW_URL);
      fs.writeFileSync(fullPath, updated, 'utf-8');
      console.log(`✅ Updated: ${relPath}`);
    } else {
      console.log(`ℹ️ Already clean: ${relPath}`);
    }
  }
}

// 2. Also check all files in scripts/ for any other occurrences
const scriptsDir = path.resolve('scripts');
const scriptFiles = fs.readdirSync(scriptsDir);
for (const file of scriptFiles) {
  const p = path.join(scriptsDir, file);
  if (fs.statSync(p).isFile() && (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.mjs'))) {
    const raw = fs.readFileSync(p, 'utf-8');
    if (raw.includes(OLD_URL)) {
      const updated = raw.replaceAll(OLD_URL, NEW_URL);
      fs.writeFileSync(p, updated, 'utf-8');
      console.log(`✅ Updated script: scripts/${file}`);
    }
  }
}

// 3. Update YouTube video descriptions via YouTube API
async function updateYouTubeChannelVideos() {
  console.log('\n📺 Checking YouTube Channel videos to update descriptions...');

  const tokenPath = path.resolve('scripts/.yt_token.json');
  if (!fs.existsSync(tokenPath)) {
    console.warn('⚠️ scripts/.yt_token.json not found, skipping live YouTube API update.');
    return;
  }

  try {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
    const oauth2Client = new google.auth.OAuth2(
      '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com',
      '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',
      'http://localhost:5173'
    );
    oauth2Client.setCredentials(token);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch user's uploaded videos
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true,
    });

    const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      console.log('No uploads playlist found for authenticated channel.');
      return;
    }

    console.log(`Found Uploads Playlist ID: ${uploadsPlaylistId}`);
    const playlistItems = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    const items = playlistItems.data.items || [];
    console.log(`Found ${items.length} videos on YouTube channel.`);

    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      const title = item.snippet?.title;
      const currentDesc = item.snippet?.description || '';

      if (currentDesc.includes(OLD_URL) || currentDesc.includes('netlify.app')) {
        console.log(`🔄 Updating YouTube video: "${title}" (${videoId})...`);
        const newDesc = currentDesc
          .replaceAll(OLD_URL, NEW_URL)
          .replaceAll(/https:\/\/[a-zA-Z0-9_-]+\.netlify\.app/g, NEW_URL);

        // Fetch full video snippet first to preserve tags, categoryId, etc.
        const videoRes = await youtube.videos.list({
          part: ['snippet'],
          id: [videoId],
        });

        const videoSnippet = videoRes.data.items?.[0]?.snippet;
        if (videoSnippet) {
          videoSnippet.description = newDesc;
          await youtube.videos.update({
            part: ['snippet'],
            requestBody: {
              id: videoId,
              snippet: videoSnippet,
            },
          });
          console.log(`✅ Successfully updated YouTube video description for: "${title}"!`);
        }
      } else {
        console.log(`ℹ️ Video already up to date: "${title}" (${videoId})`);
      }
    }
  } catch (err) {
    console.warn('⚠️ YouTube update error:', err.message);
  }
}

await updateYouTubeChannelVideos();

console.log('\n🎉 Finished updating website link across descriptions, catalogs, and scripts!');
