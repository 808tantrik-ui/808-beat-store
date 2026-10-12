import { google } from 'googleapis';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testRefresh() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);

  const tokens = JSON.parse(fs.readFileSync('scripts/.yt_token.json', 'utf-8'));
  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token
  });

  try {
    const refreshed = await oauth2Client.refreshAccessToken();
    console.log('Successfully refreshed access token!');
    console.log('Scopes granted on this refresh token:', refreshed.credentials.scope);
    
    // Now test calling drive with refreshed token
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.files.get({
      fileId: '1Nx2feguZ5BC5nZz3zy_4GOfUO00Cjuu9',
      fields: 'id, name'
    });
    console.log('Drive file info:', res.data);
  } catch (e: any) {
    console.error('Refresh or drive error:', e.message);
    if (e.response && e.response.data) {
      console.error('Details:', JSON.stringify(e.response.data));
    }
  }
}

testRefresh();
