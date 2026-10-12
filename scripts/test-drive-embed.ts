import fs from 'fs';

async function test() {
  const folderId = '1KO0VYYFJLHE_eM0UGbOAtUtSLFAbP3XF';
  const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
  console.log('Fetching', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  const text = await res.text();
  fs.writeFileSync('scripts/embed_view.html', text, 'utf-8');
  console.log('Saved embed_view.html, size:', text.length);

  // Look for file entries
  const fileMatches = [...text.matchAll(/data-id="([a-zA-Z0-9_-]{25,})"/g)].map(m => m[1]);
  console.log('File data-ids:', fileMatches);

  const titleMatches = [...text.matchAll(/class="[^"]*name[^"]*"[^>]*>([^<]+)</gi)].map(m => m[1]);
  console.log('File names:', titleMatches);
}

test().catch(console.error);
