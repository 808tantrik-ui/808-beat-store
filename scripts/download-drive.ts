import fs from 'fs';
import path from 'path';

async function main() {
  const folderId = '1KO0VYYFJLHE_eM0UGbOAtUtSLFAbP3XF';
  const url = `https://drive.google.com/drive/folders/${folderId}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  const html = await res.text();
  fs.writeFileSync('scripts/drive_page.html', html, 'utf-8');
  console.log('Saved drive_page.html, length:', html.length);

  // Search for file items in the HTML
  // Google Drive embeds initial data in _DRIVE_ivd or window['_initData']
  const fileIdMatches = [...html.matchAll(/"([a-zA-Z0-9_-]{25,35})"/g)].map(m => m[1]);
  const uniqueIds = Array.from(new Set(fileIdMatches)).filter(id => id !== folderId);
  console.log('Candidate File IDs found:', uniqueIds.slice(0, 15));
}

main().catch(console.error);
