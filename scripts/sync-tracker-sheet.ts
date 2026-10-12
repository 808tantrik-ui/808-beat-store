import dotenv from 'dotenv';
dotenv.config();

const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwYAtcGcnSWTPoZvJKa3DRXekfsRaYIA5_R8iNMPdHWctCZnsZ49ALU0UWmpaOVODxY/exec';

async function testSync() {
  console.log('Testing sync to Google Sheets Webhook:', webhookUrl);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetType: 'BEATS_TRACKER',
        title: '[808 Beat Store] Beats Upload Tracker 2026',
        dateIST: '2026-10-11 19:30 IST',
        platform: 'YouTube / Instagram / Website',
        rawFilename: 'Blackout 3.wav',
        verifiedBpmKey: '140 BPM • D# Minor',
        energyLevel: 'High (Dark & Aggressive)',
        optimizedTitle: '[FREE] "BLACKOUT" | Dark Trap Type Beat (140 BPM - D# Minor) | Prod by 808 Beat Store',
        charCount: '82 / 100',
        status: 'PENDING'
      })
    });
    console.log('Webhook Response Status:', res.status);
    console.log('Webhook Response Text:', await res.text());
  } catch (e: any) {
    console.error('Webhook Error:', e.message);
  }
}

testSync();
