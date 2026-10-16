import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:5173';

async function main() {
  console.log('🔴 Starting YouTube Beats Deletion Protocol (@808beatstore)...');
  
  const tokenPath = path.resolve('scripts/.yt_token.json');
  if (!fs.existsSync(tokenPath)) {
    console.error('❌ Error: scripts/.yt_token.json not found!');
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials(token);

  // Auto-refresh token listener
  oauth2Client.on('tokens', (newTokens) => {
    console.log('🔄 Access token refreshed.');
    const updated = { ...token, ...newTokens };
    fs.writeFileSync(tokenPath, JSON.stringify(updated, null, 2));
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // 1. Get Channel Uploads Playlist
  console.log('🔍 Fetching channel information...');
  const channelRes = await youtube.channels.list({
    part: ['snippet', 'contentDetails'],
    mine: true
  });

  const channel = channelRes.data.items?.[0];
  if (!channel) {
    console.error('❌ No channel found for authorized account!');
    process.exit(1);
  }

  console.log(`✅ Connected Channel: "${channel.snippet?.title}" (ID: ${channel.id})`);
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    console.error('❌ Could not find uploads playlist ID!');
    process.exit(1);
  }

  console.log(`📋 Uploads Playlist ID: ${uploadsPlaylistId}`);

  // 2. Fetch all videos in Uploads playlist
  let allVideos = [];
  let nextPageToken = undefined;

  console.log('🔍 Listing all videos from YouTube uploads playlist...');
  do {
    const playlistRes = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: nextPageToken
    });

    const items = playlistRes.data.items || [];
    for (const item of items) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title;
      const publishedAt = item.snippet?.publishedAt;
      if (videoId) {
        allVideos.push({ videoId, title, publishedAt });
      }
    }

    nextPageToken = playlistRes.data.nextPageToken;
  } while (nextPageToken);

  console.log(`\n📊 Total videos found on YouTube channel: ${allVideos.length}`);

  if (allVideos.length === 0) {
    console.log('✨ No videos found on channel. Already clean!');
    return;
  }

  console.log('\n🗑️ Beginning deletion of videos ONLY from YouTube...\n');

  let deletedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < allVideos.length; i++) {
    const video = allVideos[i];
    console.log(`[${i + 1}/${allVideos.length}] Deleting YouTube video: "${video.title}" (ID: ${video.videoId})...`);
    try {
      await youtube.videos.delete({
        id: video.videoId
      });
      console.log(`   ✅ Successfully deleted from YouTube: "${video.title}" (${video.videoId})`);
      deletedCount++;
    } catch (err) {
      console.error(`   ❌ Failed to delete video ${video.videoId}:`, err.message);
      failedCount++;
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 COMPLETED: Successfully deleted ${deletedCount} beat video(s) from YouTube channel.`);
  if (failedCount > 0) {
    console.log(`⚠️ ${failedCount} video(s) encountered an error during deletion.`);
  }
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error during deletion:', err);
  process.exit(1);
});
