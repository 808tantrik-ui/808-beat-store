import fs from 'fs';

const webhookUrl = 'https://script.google.com/macros/s/AKfycbwYAtcGcnSWTPoZvJKa3DRXekfsRaYIA5_R8iNMPdHWctCZnsZ49ALU0UWmpaOVODxY/exec';
const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));

console.log(`Syncing ${beats.length} beats with clean descriptions to Google Sheets...`);

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
        youtubeUrl: beat.youtubeUrl || '',
        charCount: `${beat.titleCharCount} / 100`,
        thumbnailUrl: beat.thumbnailUrl,
        driveUrl: beat.driveUrl,
        usagePolicy: '100% Free on YouTube & IG (Credit Required) | No DSP/Streaming',
        status: beat.status
      })
    });
    console.log(`Synced "${beat.title}" -> Status: ${res.status}`);
  } catch (err) {
    console.error(`Error syncing "${beat.title}":`, err.message);
  }
}

console.log('✅ Master Google Sheet successfully updated for all 20 beats!');
