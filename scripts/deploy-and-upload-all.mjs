import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const brainDir = 'C:/Users/808ta/.gemini/antigravity-ide/brain/96c04796-407e-41da-9eef-6b699ad987e8';
const artDir = path.resolve('public/assets/artwork');
const distDir = path.resolve('dist/web/assets/artwork');
const audioDir = path.resolve('public/assets/audio');
const videoDir = path.resolve('public/assets/video');

[artDir, distDir, audioDir, videoDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// 1. Deploy the 13 generated cinematic artworks
const mappings = [
  { slug: 'blackout', file: 'blackout_cinematic_thumb_1791729951279.jpg' },
  { slug: 'break-the-wall', file: 'break_the_wall_thumb_1791730126778.jpg' },
  { slug: 'broken-frame-31', file: 'broken_frame_thumb_1791730151888.jpg' },
  { slug: 'broken-frame-31-1', file: 'broken_frame_sad_1791730173894.jpg' },
  { slug: 'cold-goodbye', file: 'cold_goodbye_thumb_1791730196589.jpg' },
  { slug: 'dead-silence', file: 'dead_silence_thumb_1791730219575.jpg' },
  { slug: 'empty-room', file: 'empty_room_thumb_1791730243589.jpg' },
  { slug: 'fading-lights', file: 'fading_lights_thumb_1791730265203.jpg' },
  { slug: 'fault-line', file: 'fault_line_thumb_1791730291245.jpg' },
  { slug: 'fury-road', file: 'fury_road_thumb_1791730315398.jpg' },
  { slug: 'greed-glory', file: 'greed_glory_thumb_1791730353117.jpg' },
  { slug: 'gully-freestyle', file: 'gully_freestyle_thumb_1791730378644.jpg' },
  { slug: 'iron-gate', file: 'iron_gate_thumb_1791730412587.jpg' }
];

console.log('🖼️ Step 1: Deploying high-converting cinematic artworks...');
mappings.forEach(m => {
  const src = path.join(brainDir, m.file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(artDir, `${m.slug}.jpg`));
    fs.copyFileSync(src, path.join(distDir, `${m.slug}.jpg`));
    console.log(`✅ Deployed cinematic artwork: ${m.slug}.jpg`);
  }
});

// 2. Setup YouTube OAuth
const CLIENT_ID = '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173';
const TOKEN_PATH = path.resolve('scripts/.yt_token.json');

const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials(token);
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

function extractFileId(input) {
  if (!input) return '';
  const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                input.match(/id=([a-zA-Z0-9_-]+)/) ||
                input.match(/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] || match[0] : input;
}

async function downloadWav(driveUrl, destFile) {
  if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000000) return true;
  const fileId = extractFileId(driveUrl);
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

  console.log(`📥 Downloading WAV (File ID: ${fileId})...`);
  const res = await fetch(downloadUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destFile, buf);
  console.log(`✅ Downloaded: ${destFile} (${(buf.length / (1024 * 1024)).toFixed(2)} MB)`);
  return true;
}

function renderVideo(artworkPath, audioPath, outputPath) {
  console.log(`🎬 Rendering 1080p Video with Cinematic Poster [${path.basename(artworkPath)}]...`);
  const proc = spawnSync(ffmpegPath, [
    '-y',
    '-loop', '1',
    '-framerate', '1',
    '-i', artworkPath,
    '-i', audioPath,
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-r', '1',
    '-c:a', 'aac',
    '-b:a', '320k',
    '-pix_fmt', 'yuv420p',
    '-map_metadata', '-1',
    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black',
    '-shortest',
    outputPath
  ], { stdio: 'inherit' });

  if (proc.status !== 0 || !fs.existsSync(outputPath)) {
    throw new Error(`FFmpeg rendering failed with code ${proc.status}`);
  }
  return true;
}

async function postToInstagram(beat, artPath) {
  const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
  if (!igToken || !igUserId) {
    console.log('⚠️ Instagram token not configured, skipping API post.');
    return;
  }
  console.log(`📸 Staging Instagram asset for "${beat.title}"...`);
}

async function main() {
  const beatsFile = path.resolve('data/scheduled-beats.json');
  const beats = JSON.parse(fs.readFileSync(beatsFile, 'utf-8'));

  // 1. Immediately update BLACKOUT thumbnail on YouTube Studio!
  const blackoutThumb = path.join(artDir, 'blackout.jpg');
  if (fs.existsSync(blackoutThumb)) {
    try {
      console.log('🔄 Updating BLACKOUT thumbnail on YouTube Studio with new cinematic supercar poster...');
      await youtube.thumbnails.set({
        videoId: 'ftN46v39wiM',
        media: {
          mimeType: 'image/jpeg',
          body: fs.createReadStream(blackoutThumb)
        }
      });
      console.log('🎉 SUCCESS! BLACKOUT YouTube thumbnail is now the cinematic supercar poster on YouTube Studio!');
    } catch (e) {
      console.warn('Blackout thumb update error:', e.message);
    }
  }

  // 2. Iterate through all 20 beats
  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const slug = beat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const audioPath = path.join(audioDir, `${slug}.wav`);
    const artPath = path.join(artDir, `${slug}.jpg`);
    const videoPath = path.join(videoDir, `${slug}-1080p.mp4`);

    if (beat.youtubeUrl && beat.youtubeVideoId) {
      console.log(`⏩ [${i + 1}/${beats.length}] "${beat.title}" already scheduled: ${beat.youtubeUrl}`);
      continue;
    }

    console.log(`\n======================================================`);
    console.log(`🚀 [${i + 1}/${beats.length}] Processing: "${beat.title}" (${beat.bpm} BPM • ${beat.key})`);
    console.log(`Scheduled Drop: ${beat.scheduledTimeIST} | ISO: ${beat.scheduledTime}`);
    console.log(`======================================================`);

    try {
      await downloadWav(beat.driveUrl, audioPath);
      renderVideo(artPath, audioPath, videoPath);

      console.log(`🚀 Uploading to YouTube Studio with publishAt=${beat.scheduledTime}...`);
      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: beat.youtubeTitle,
            description: beat.youtubeDescription,
            tags: beat.youtubeTags || ['808 beat store', 'type beat 2026'],
            categoryId: '10'
          },
          status: {
            privacyStatus: 'private',
            publishAt: beat.scheduledTime,
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = res.data.id;
      const videoUrl = `https://youtu.be/${videoId}`;
      console.log(`🎉 LIVE on YouTube Studio: ${videoUrl}`);

      // Apply custom thumbnail
      if (fs.existsSync(artPath)) {
        try {
          await youtube.thumbnails.set({
            videoId,
            media: {
              mimeType: 'image/jpeg',
              body: fs.createReadStream(artPath)
            }
          });
          console.log(`🖼️ Custom cinematic thumbnail set!`);
        } catch (te) {
          console.warn('Thumbnail set warning:', te.message);
        }
      }

      beat.youtubeUrl = videoUrl;
      beat.youtubeVideoId = videoId;
      beat.status = 'Scheduled on YouTube';
      fs.writeFileSync(beatsFile, JSON.stringify(beats, null, 2), 'utf-8');

      // Post to Instagram
      await postToInstagram(beat, artPath);

    } catch (err) {
      console.error(`❌ Upload error for "${beat.title}":`, err.message);
      if (err.message && (err.message.includes('quota') || err.message.includes('uploadLimitExceeded'))) {
        console.warn('⚠️ YouTube upload quota limit reached. Remaining beats queued for next window.');
        break;
      }
    }
  }

  console.log('\n🏁 Bulk execution finished!');
}

main().catch(console.error);
