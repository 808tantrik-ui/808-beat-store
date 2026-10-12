import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';

const CLIENT_ID = '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const TOKEN_PATH = path.resolve('scripts/.yt_token.json');

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.query && parsed.query.code) {
    const code = parsed.query.code;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html>
      <body style="font-family: system-ui, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 500px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-size: 54px; margin-bottom: 16px;">🎉</div>
          <h1 style="color: #4ade80; margin: 0 0 12px 0; font-size: 24px;">YouTube Channel Connected!</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Authorization received. Exchanging tokens and uploading <b>BLACKOUT</b> directly into YouTube Studio Scheduled queue now...
          </p>
          <div style="color: #38bdf8; font-size: 14px; background: #0f172a; padding: 12px; border-radius: 8px;">
            Check your IDE / terminal window for live upload progress!
          </div>
        </div>
      </body>
      </html>
    `);

    try {
      console.log('🔄 Received authorization code! Exchanging for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
      console.log('✅ Fresh YouTube OAuth tokens saved to scripts/.yt_token.json!');

      oauth2Client.setCredentials(tokens);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const videoPath = path.resolve('public/assets/video/blackout-1080p.mp4');
      if (!fs.existsSync(videoPath)) {
        console.error('Video file not found:', videoPath);
        return;
      }

      console.log('🚀 Uploading & Scheduling BLACKOUT to YouTube Studio...');

      const uploadRes = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: '[FREE] "BLACKOUT" | Dark Trap Type Beat (104 BPM - G Minor) | Prod by 808 Beat Store',
            description: `💰 Purchase Untagged Master & Instant License: https://dashing-medovik-13fc8a.netlify.app/#/beats/blackout\n🔥 Subscribe to @808beatstore: https://youtube.com/@808beatstore?si=Gm2bZSIbAbnFDHN5\n📸 Instagram: https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎹 BEAT SPECIFICATIONS:\n• Title: BLACKOUT\n• BPM: 104\n• Key: G Minor\n• Mood: Dark, Aggressive\n• Genre / Style: Dark Trap\n• Production: 808 Beat Store\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💳 LICENSING OPTIONS & PRICING:\n• MP3 / WAV Commercial License: High-definition 24-bit audio for streaming.\n• Exclusive Ownership Transfer: Sole copyright transfer with multi-track stems.\n👉 Instant Checkout: https://dashing-medovik-13fc8a.netlify.app/#/beats/blackout\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏱️ TRACK TIMESTAMPS:\n0:00 - Intro (Atmospheric Melody & Build)\n0:15 - Hook / Main 808 Drop\n0:38 - Verse 1 (Dynamic Rhythm)\n1:15 - Chorus / High Energy Climax\n1:38 - Verse 2 (Melodic Progression)\n2:15 - Bridge / Percussion Breakdown\n2:38 - Final Hook (Peak Energy)\n3:00 - Outro (Smooth Fade)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ USAGE TERMS:\nFree download is strictly for non-commercial audition / listening use.\nAlways credit in title: (Prod by 808 Beat Store).\n\n#DarkTrapTypeBeat #typebeat2026 #808beatstore #buybeats #hiphopinstrumentals`,
            tags: ['blackout type beat', 'dark trap type beat', 'dark trap type beat 2026', 'free type beat', '808 beat store', 'type beat', '104 bpm beat', 'g minor beat', 'trap beat 2026'],
            categoryId: '10'
          },
          status: {
            privacyStatus: 'private',
            publishAt: '2026-10-11T14:00:00.000Z', // 7:30 PM IST Scheduled
            selfDeclaredMadeForKids: false
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      console.log('\n======================================================');
      console.log('🎉 SUCCESS! BLACKOUT IS NOW OFFICIALLY SCHEDULED ON YOUTUBE STUDIO!');
      console.log('Video ID:', uploadRes.data.id);
      console.log('YouTube Link: https://youtu.be/' + uploadRes.data.id);
      console.log('Scheduled Publish Time (IST): Tonight 2026-10-11 at 19:30 IST');
      console.log('======================================================\n');
    } catch (e) {
      console.error('❌ Error during token exchange or upload:', e.message);
    } finally {
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 3000);
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('808 Beat Store YouTube OAuth Server Ready');
  }
});

server.listen(5173, () => {
  console.log('🚀 OAuth Receiver listening on http://localhost:5173');
});
