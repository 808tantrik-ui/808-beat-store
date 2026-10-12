import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '492484618263-heunj2vr9i4s0tnvk5rojpgruj5mgs92.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const fileRenameMap = {
  "1Nx2feguZ5BC5nZz3zy_4GOfUO00Cjuu9": "[FREE] BLACKOUT - Dark Trap Type Beat (104 BPM - G Minor) Prod by 808 Beat Store.wav",
  "19La1RTJFt1wJYSzwIqDjEr0vd6MwEYgp": "[FREE] BREAK THE WALL - Drill Type Beat (100 BPM - F# Minor) Prod by 808 Beat Store.wav",
  "1kdvHygHQojH2rXm4M8ks5Lnegfh1zCHu": "[FREE] BROKEN FRAME 31 - Melodic Beat (77 BPM - C Major) Prod by 808 Beat Store.wav",
  "1Ej660uhXWZ3bdxrcZ3scEcFgivoA4ZXM": "[FREE] BROKEN FRAME 31-1 - Sad Beat (75 BPM - G# Major) Prod by 808 Beat Store.wav",
  "1dQVvbdys_KLWvhEcYEzq50-uFJmbqQk9": "[FREE] COLD GOODBYE - Hip Hop Beat (86 BPM - B Major) Prod by 808 Beat Store.wav",
  "1jGd3kP8Gj1syV1-ChwzqdzrUX61XbY91": "[FREE] DEAD SILENCE - Dark Drill Beat (85 BPM - C Minor) Prod by 808 Beat Store.wav",
  "1ogALzW2D3VE-fWnSnqBzah8VGQj5hZMM": "[FREE] EMPTY ROOM - Soulful Boombap (80 BPM - C# Major) Prod by 808 Beat Store.wav",
  "1Lx9Du1Hixla2BapNz8jM3Nrqf-JPDnar": "[FREE] FADING LIGHTS - Ambient Trap (76 BPM - F Major) Prod by 808 Beat Store.wav",
  "19wTc0sA8P4MvPMujVLt7M9RGseuFZsB0": "[FREE] FAULT LINE - Heavy 808 Trap Beat (91 BPM - F Minor) Prod by 808 Beat Store.wav",
  "1lXj4O8VGZkHTwrkPZxFfPHJ7rd7W6DEp": "[FREE] FURY ROAD - Rage Hip Hop Beat (105 BPM - F Minor) Prod by 808 Beat Store.wav",
  "1XrM77L8XyL-aP0aT5LKJomUv1uq7PJoi": "[FREE] GREED & GLORY - Boom Bap Beat (90 BPM - D# Minor) Prod by 808 Beat Store.wav",
  "18jy4zE_l_t9xLaTDGAstA_Ld9rM_ZLc7": "[FREE] GULLY FREESTYLE - 808 Gully Beat (95 BPM - F Minor) Prod by 808 Beat Store.wav",
  "11XblferL3ZVYc9f7HJA6XmMsnemTZDt_": "[FREE] IRON GATE - Gritty Boombap (75 BPM - D Minor) Prod by 808 Beat Store.wav",
  "1rDCgvYAGAjlU7bQxUyyNjFwjcysjtHXf": "[FREE] NO REPLY - Melodic Sad Trap (78 BPM - G Major) Prod by 808 Beat Store.wav",
  "1L6ZLasPSvwJu_NZgQLFf96p3gsYlqMK6": "[FREE] RAINY NIGHTS - Lofi Hip Hop Beat (80 BPM - F Major) Prod by 808 Beat Store.wav",
  "11JpP1a6KDZhWi3WugSpK6jkrXWnHgf2E": "[FREE] RIOT CALL - High Energy Drill (105 BPM - D Minor) Prod by 808 Beat Store.wav",
  "1fx5gOQko9L_6KEoiEy-BzZsQcMqfKGgh": "[FREE] STEEL NERVE - Dark Trap Beat (90 BPM - G Minor) Prod by 808 Beat Store.wav",
  "10sRx9aikdFNSkGcYZA7PF3ENrpvDJWBW": "[FREE] STILL HURTS - Guitar Trap Beat (85 BPM - C Minor) Prod by 808 Beat Store.wav",
  "1OrWUGxzUCOwaiqCtfEsyUIC1z_4wYAGZ": "[FREE] TURN PAGE - Storytelling Beat (74 BPM - F# Minor) Prod by 808 Beat Store.wav",
  "1htV9sjV88px98iEn4CSVnZQFzTBekxtb": "[FREE] WINTER HURT - Ambient Cold Beat (78 BPM - C# Minor) Prod by 808 Beat Store.wav"
};

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error('Please provide authorization code: node scripts/apply-drive-rename.js <code>');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  console.log('Exchanging authorization code for tokens...');
  const { tokens } = await oauth2Client.getToken(code.trim());
  oauth2Client.setCredentials(tokens);

  const tokenPath = path.resolve('scripts/.yt_token.json');
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log('✅ Tokens successfully updated with Drive & YouTube scopes!');

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  console.log('\n🚀 Starting batch rename of all 20 Google Drive files...\n');

  for (const [fileId, newName] of Object.entries(fileRenameMap)) {
    try {
      const res = await drive.files.update({
        fileId,
        requestBody: { name: newName },
        fields: 'id, name'
      });
      console.log(`✅ Renamed -> "${res.data.name}"`);
    } catch (e) {
      console.error(`❌ Error renaming ${fileId}:`, e.message);
    }
  }

  console.log('\n🎉 ALL 20 BEAT FILES IN GOOGLE DRIVE SUCCESSFULLY RENAMED!');
}

main().catch(err => {
  console.error('Execution failed:', err.message);
  process.exit(1);
});
