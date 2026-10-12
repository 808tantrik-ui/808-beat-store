import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwYAtcGcnSWTPoZvJKa3DRXekfsRaYIA5_R8iNMPdHWctCZnsZ49ALU0UWmpaOVODxY/exec';

async function syncAll() {
  const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
  console.log(`Syncing ${beats.length} beats to Google Sheets Webhook:`, webhookUrl);

  for (const beat of beats) {
    try {
      const res = await fetch(webhookUrl, {
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
          charCount: `${beat.titleCharCount} / 100`,
          thumbnailUrl: beat.thumbnailUrl,
          driveUrl: beat.driveUrl,
          status: 'Scheduled'
        })
      });
      console.log(`Synced "${beat.title}" -> Status: ${res.status}`);
    } catch (err: any) {
      console.error(`Error syncing "${beat.title}":`, err.message);
    }
  }
  console.log('✅ Full Batch Sync Completed!');
}

syncAll();
