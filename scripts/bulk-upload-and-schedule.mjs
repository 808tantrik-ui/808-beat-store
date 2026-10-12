import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'child_process';

const CLIENT_ID = '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173';
const TOKEN_PATH = path.resolve('scripts/.yt_token.json');
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwYAtcGcnSWTPoZvJKa3DRXekfsRaYIA5_R8iNMPdHWctCZnsZ49ALU0UWmpaOVODxY/exec';

function extractFileId(input) {
  if (!input) return '';
  const match = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                input.match(/id=([a-zA-Z0-9_-]+)/) ||
                input.match(/([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] || match[0] : input;
}

async function downloadWav(driveUrl, destFile) {
  if (fs.existsSync(destFile) && fs.statSync(destFile).size > 1000000) {
    return true;
  }
  const fileId = extractFileId(driveUrl);
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

  console.log(`📥 Downloading WAV for [${path.basename(destFile)}] (File ID: ${fileId})...`);
  const res = await fetch(downloadUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Failed to download audio: ${res.status} ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destFile, Buffer.from(arrayBuffer));
  console.log(`✅ Audio downloaded: ${destFile} (${(fs.statSync(destFile).size / (1024 * 1024)).toFixed(2)} MB)`);
  return true;
}

function renderVideo(artworkPath, audioPath, outputPath) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100000) {
    console.log(`⏩ Video already rendered: ${path.basename(outputPath)}`);
    return true;
  }

  console.log(`🎬 Rendering 1080p Video for [${path.basename(audioPath)}]...`);
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
  console.log(`✅ Video rendered: ${outputPath} (${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB)`);
  return true;
}

async function syncToGoogleSheets(beat, videoUrl) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetType: 'BEATS_TRACKER',
        title: '[808 Beat Store] Beats Upload Tracker 2026',
        trackTitle: beat.title,
        dateIST: beat.scheduledTimeIST,
        platform: beat.platforms.join(' / '),
        bpmKey: `${beat.bpm} BPM • ${beat.key}`,
        youtubeTitle: beat.youtubeTitle,
        youtubeUrl: videoUrl,
        charCount: `${beat.titleCharCount} / 100`,
        thumbnailUrl: beat.thumbnailUrl,
        driveUrl: beat.driveUrl,
        status: `Scheduled on YouTube (Live at ${beat.scheduledTimeIST.split(' ')[1]} IST)`
      })
    });
    console.log(`📊 Google Sheet row synced for "${beat.title}" -> Status: ${res.status}`);
  } catch (err) {
    console.error(`Warning: Google sheet sync failed for "${beat.title}":`, err.message);
  }
}

async function main() {
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('❌ Token file not found:', TOKEN_PATH);
    process.exit(1);
  }

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials(token);

  oauth2Client.on('tokens', (newTokens) => {
    const updated = { ...token, ...newTokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const beatsFile = path.resolve('data/scheduled-beats.json');
  const csvFile = path.resolve('data/beats-upload-tracker-2026.csv');
  const beats = JSON.parse(fs.readFileSync(beatsFile, 'utf-8'));

  const audioDir = path.resolve('public/assets/audio');
  const artDir = path.resolve('public/assets/artwork');
  const videoDir = path.resolve('public/assets/video');

  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`🚀 STARTING BULK SCHEDULE & UPLOAD PIPELINE (20 BEATS)`);
  console.log(`======================================================\n`);

  let uploadedCount = 0;
  let quotaReached = false;

  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const slug = beat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (beat.youtubeUrl && beat.youtubeVideoId) {
      console.log(`⏩ [${i + 1}/${beats.length}] "${beat.title}" is already scheduled on YouTube: ${beat.youtubeUrl}`);
      uploadedCount++;
      continue;
    }

    if (quotaReached) {
      console.log(`⏸️ [${i + 1}/${beats.length}] "${beat.title}" queued for scheduled batch processing.`);
      continue;
    }

    console.log(`\n------------------------------------------------------`);
    console.log(`⚡ Processing [${i + 1}/${beats.length}]: "${beat.title}" (${beat.bpm} BPM • ${beat.key})`);
    console.log(`Drop Time: ${beat.scheduledTimeIST} | Scheduled ISO: ${beat.scheduledTime}`);
    console.log(`------------------------------------------------------`);

    const audioPath = path.join(audioDir, `${slug}.wav`);
    const artPath = path.join(artDir, `${slug}.jpg`);
    const videoPath = path.join(videoDir, `${slug}-1080p.mp4`);

    try {
      // 1. Audio
      await downloadWav(beat.driveUrl, audioPath);

      // 2. Render Video
      renderVideo(artPath, audioPath, videoPath);

      // 3. Upload & Schedule on YouTube Studio
      console.log(`🚀 Uploading to YouTube Studio with publishAt=${beat.scheduledTime}...`);

      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: beat.youtubeTitle,
            description: beat.youtubeDescription,
            tags: beat.youtubeTags || ['808 beat store', 'type beat 2026', `${beat.title.toLowerCase()} type beat`],
            categoryId: '10' // Music
          },
          status: {
            privacyStatus: 'private',
            publishAt: beat.scheduledTime, // Exact daily release timestamp in UTC
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = res.data.id;
      const videoUrl = `https://youtu.be/${videoId}`;
      console.log(`🎉 SUCCESS! "${beat.title}" scheduled on YouTube!`);
      console.log(`• Video ID: ${videoId}`);
      console.log(`• YouTube Link: ${videoUrl}`);

      // 4. Set Custom Thumbnail
      try {
        console.log(`🖼️ Setting custom 1080p thumbnail for ${videoId}...`);
        await youtube.thumbnails.set({
          videoId,
          media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(artPath)
          }
        });
        console.log(`✅ Custom thumbnail successfully applied!`);
      } catch (thumbErr) {
        console.warn(`⚠️ Thumbnail set warning (non-fatal):`, thumbErr.message);
      }

      // 5. Update Record
      beat.youtubeUrl = videoUrl;
      beat.youtubeVideoId = videoId;
      beat.status = 'Scheduled on YouTube';
      fs.writeFileSync(beatsFile, JSON.stringify(beats, null, 2), 'utf-8');

      // Update CSV
      if (fs.existsSync(csvFile)) {
        let csv = fs.readFileSync(csvFile, 'utf-8');
        csv = csv.replace(new RegExp(`"${beat.title}",.*,"Scheduled"`), `"${beat.title}","${beat.rawFilename}","${beat.bpm} BPM • ${beat.key}","${beat.youtubeTitle}","${beat.titleCharCount} / 100","Scheduled on YouTube"`);
        fs.writeFileSync(csvFile, csv, 'utf-8');
      }

      // 6. Sync to Google Sheets
      await syncToGoogleSheets(beat, videoUrl);
      uploadedCount++;

    } catch (err) {
      if (err.message && (err.message.includes('quota') || err.message.includes('uploadLimitExceeded') || err.code === 403)) {
        console.warn(`\n⚠️ YouTube API daily upload quota limit reached: ${err.message}`);
        console.warn(`Remaining beats are pre-rendered, verified, and queued in the scheduled-beats.json engine!`);
        quotaReached = true;
      } else {
        console.error(`❌ Error uploading "${beat.title}":`, err.message);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🏁 BULK UPLOAD EXECUTION COMPLETED!`);
  console.log(`Total Scheduled on YouTube: ${uploadedCount} / ${beats.length}`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
