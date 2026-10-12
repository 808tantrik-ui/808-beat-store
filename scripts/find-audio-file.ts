import fs from 'fs';

const html = fs.readFileSync('scripts/drive_page.html', 'utf-8');

// Look for patterns like ["title", "mimeType", ...] or file IDs
// In Google Drive folder responses, files are usually structured like:
// [["<fileId>","<fileName>",...]]
const reg = /"([a-zA-Z0-9_-]{28,40})",\["([^"]+\.(?:mp3|wav|m4a|zip))"/gi;
let m;
let found = 0;
while ((m = reg.exec(html)) !== null) {
  console.log(`FOUND FILE: ID=${m[1]}, Name=${m[2]}`);
  found++;
}

if (!found) {
  // Broader search for mp3 or wav
  const regex2 = /"([^"]+\.(?:mp3|wav|m4a|aac))"/gi;
  let m2;
  while ((m2 = regex2.exec(html)) !== null) {
    console.log('Audio filename found:', m2[1]);
  }

  // Look for any string with 1sI8... or similar
  const regex3 = /\["([a-zA-Z0-9_-]{28,40})","([^"]+)"/g;
  let m3;
  while ((m3 = regex3.exec(html)) !== null) {
    if (m3[2].length < 100 && !m3[2].includes('http') && !m3[2].includes('{')) {
      console.log(`Generic candidate: ID=${m3[1]}, Name=${m3[2]}`);
    }
  }
}
