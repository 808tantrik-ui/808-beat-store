import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.upload',
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('AUTH_URL_START:' + url + ':AUTH_URL_END');
