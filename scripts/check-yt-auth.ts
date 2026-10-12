import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

async function check() {
  const tokenPath = path.resolve('scripts/.yt_token.json');
  if (!fs.existsSync(tokenPath)) {
    console.log('No token file found');
    return;
  }
  const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  const oauth2Client = new google.auth.OAuth2(
    '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com',
    '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',
    'http://localhost:5173'
  );
  oauth2Client.setCredentials(token);
  const yt = google.youtube({ version: 'v3', auth: oauth2Client });
  try {
    const res = await yt.channels.list({ part: ['snippet'], mine: true });
    console.log('SUCCESS! Channel Title:', res.data.items?.[0]?.snippet?.title);
    console.log('Channel ID:', res.data.items?.[0]?.id);
  } catch (err: any) {
    console.error('API Error:', err.message);
  }
}

check();
