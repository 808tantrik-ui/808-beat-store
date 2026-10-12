import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testOAuthDriveRename() {
  const tokenData = JSON.parse(fs.readFileSync('scripts/.yt_token.json', 'utf-8'));
  const accessToken = tokenData.access_token;
  const testFileId = '1Nx2feguZ5BC5nZz3zy_4GOfUO00Cjuu9'; // Blackout 3.wav
  const newName = '[FREE] "BLACKOUT" | Dark Trap Type Beat (104 BPM - G Minor) | Prod by 808 Beat Store.wav';

  console.log('Testing Google Drive API rename via OAuth token...');
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${testFileId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName })
  });

  console.log('Google Drive API Status:', res.status);
  const text = await res.text();
  console.log('Google Drive API Response:', text);
}

async function testWebhookDriveRename() {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  console.log('\nTesting Webhook rename...');
  const res = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'RENAME_FILE',
      fileId: '1Nx2feguZ5BC5nZz3zy_4GOfUO00Cjuu9',
      newName: '[FREE] "BLACKOUT" | Dark Trap Type Beat (104 BPM - G Minor) | Prod by 808 Beat Store.wav'
    })
  });
  console.log('Webhook Status:', res.status);
  console.log('Webhook Response:', await res.text());
}

async function main() {
  await testOAuthDriveRename();
  await testWebhookDriveRename();
}

main().catch(console.error);
