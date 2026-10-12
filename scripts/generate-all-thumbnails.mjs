import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
const artDir = path.resolve('public/assets/artwork');
if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });

// Visual theme configurations based on Genre & Mood
const themeStyles = {
  'Dark Trap': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 70%, #000 100%)',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    genreBadge: 'DARK TRAP INSTRUMENTAL',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeBorder: '#ef4444'
  },
  'Drill x Trap': {
    bgGrad: 'radial-gradient(circle at 60% 40%, #2e1065 0%, #0f172a 60%, #020617 100%)',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    genreBadge: 'UK / NY DRILL TYPE BEAT',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeBorder: '#f59e0b'
  },
  'Melodic Trap': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #312e81 0%, #1e1b4b 50%, #050510 100%)',
    accentColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.45)',
    genreBadge: 'MELODIC EMOTIONAL TRAP',
    badgeBg: 'rgba(129, 140, 248, 0.2)',
    badgeBorder: '#818cf8'
  },
  'Sad Hip-Hop': {
    bgGrad: 'radial-gradient(circle at 40% 30%, #172554 0%, #0b0f19 60%, #02040a 100%)',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    genreBadge: 'SAD GUITAR / PIANO BEAT',
    badgeBg: 'rgba(56, 189, 248, 0.2)',
    badgeBorder: '#38bdf8'
  },
  'Emotional Hip-Hop': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #4a044e 0%, #1e1028 60%, #07030a 100%)',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    genreBadge: 'DEEP EMOTIONAL INSTRUMENTAL',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    badgeBorder: '#f43f5e'
  },
  'Dark Drill': {
    bgGrad: 'radial-gradient(circle at 50% 40%, #450a0a 0%, #180505 60%, #000 100%)',
    accentColor: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.5)',
    genreBadge: 'HEAVY BASS DRILL BEAT',
    badgeBg: 'rgba(220, 38, 38, 0.25)',
    badgeBorder: '#dc2626'
  },
  'Soulful Boom Bap': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #713f12 0%, #291804 60%, #0a0501 100%)',
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    genreBadge: 'SOULFUL 90s BOOM BAP',
    badgeBg: 'rgba(251, 191, 36, 0.2)',
    badgeBorder: '#fbbf24'
  },
  'Ambient Trap': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #042f2e 0%, #061c1b 60%, #010808 100%)',
    accentColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    genreBadge: 'SPATIAL AMBIENT TRAP',
    badgeBg: 'rgba(45, 212, 191, 0.2)',
    badgeBorder: '#2dd4bf'
  },
  'Heavy 808 Trap': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #581c87 0%, #1a052e 60%, #030008 100%)',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    genreBadge: 'HARD 808 DISTORTION TRAP',
    badgeBg: 'rgba(192, 132, 252, 0.2)',
    badgeBorder: '#c084fc'
  },
  'Rage Hip-Hop': {
    bgGrad: 'radial-gradient(circle at 50% 40%, #701a75 0%, #2a082c 60%, #050005 100%)',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    genreBadge: 'SYNTH RAGE HARD BEAT',
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    badgeBorder: '#ec4899'
  },
  'Boom Bap': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #78350f 0%, #2d1305 60%, #080301 100%)',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    genreBadge: 'RAW UNDERGROUND BOOM BAP',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    badgeBorder: '#f59e0b'
  },
  'Desi Hip-Hop': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #831843 0%, #2a0515 60%, #050002 100%)',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    genreBadge: 'DESI GULLY 808 FREESTYLE',
    badgeBg: 'rgba(244, 63, 94, 0.25)',
    badgeBorder: '#f43f5e'
  },
  'Underground Boom Bap': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #3f3f46 0%, #18181b 60%, #050505 100%)',
    accentColor: '#e4e4e7',
    glowColor: 'rgba(228, 228, 231, 0.35)',
    genreBadge: 'GRITTY VINYL BOOM BAP',
    badgeBg: 'rgba(228, 228, 231, 0.2)',
    badgeBorder: '#e4e4e7'
  },
  'Melodic Sad Trap': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.45)',
    genreBadge: 'SAD MELODIC GUITAR BEAT',
    badgeBg: 'rgba(96, 165, 250, 0.2)',
    badgeBorder: '#60a5fa'
  },
  'Lofi Hip-Hop': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #4c1d95 0%, #1f0d3d 60%, #06020c 100%)',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    genreBadge: 'CHILL RAINY LOFI BEAT',
    badgeBg: 'rgba(167, 139, 250, 0.2)',
    badgeBorder: '#a78bfa'
  },
  'High Energy Drill': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #991b1b 0%, #360707 60%, #080000 100%)',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.55)',
    genreBadge: 'HIGH ENERGY AGGRESSIVE DRILL',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    badgeBorder: '#ef4444'
  },
  'Guitar Trap': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #064e3b 0%, #022018 60%, #000806 100%)',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    genreBadge: 'ACOUSTIC GUITAR TRAP',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeBorder: '#10b981'
  },
  'Storytelling Boombap': {
    bgGrad: 'radial-gradient(circle at 50% 35%, #57534e 0%, #1c1917 60%, #050505 100%)',
    accentColor: '#d6d3d1',
    glowColor: 'rgba(214, 211, 209, 0.35)',
    genreBadge: 'STORYTELLING LYRICAL BEAT',
    badgeBg: 'rgba(214, 211, 209, 0.2)',
    badgeBorder: '#d6d3d1'
  },
  'Ambient Cold Beat': {
    bgGrad: 'radial-gradient(circle at 50% 30%, #0c4a6e 0%, #041f30 60%, #00080d 100%)',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    genreBadge: 'COLD WINTER AMBIENT BEAT',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    badgeBorder: '#38bdf8'
  }
};

function getHtmlForBeat(beat) {
  const theme = themeStyles[beat.genre] || {
    bgGrad: 'radial-gradient(circle at 50% 35%, #1e1b4b 0%, #09090b 70%, #000 100%)',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    genreBadge: `${beat.genre.toUpperCase()} TYPE BEAT`,
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeBorder: '#ef4444'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;0,900;1,900&family=Space+Grotesk:wght@600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1920px;
      height: 1080px;
      background: ${theme.bgGrad};
      font-family: 'Montserrat', sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 90px 110px;
    }

    /* Ambient Glow Overlay */
    .glow-orb {
      position: absolute;
      width: 900px;
      height: 900px;
      border-radius: 50%;
      background: ${theme.glowColor};
      filter: blur(140px);
      top: -200px;
      right: -150px;
      pointer-events: none;
      z-index: 1;
    }
    .glow-orb-2 {
      position: absolute;
      width: 650px;
      height: 650px;
      border-radius: 50%;
      background: ${theme.glowColor};
      filter: blur(160px);
      bottom: -150px;
      left: -100px;
      pointer-events: none;
      z-index: 1;
    }

    /* Grid Texture */
    .grid-lines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: 80px 80px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      z-index: 2;
    }

    /* Header */
    .header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .logo-badge {
      background: #fff;
      color: #000;
      font-weight: 900;
      font-size: 30px;
      padding: 8px 18px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
    .store-name {
      color: #fff;
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .free-pill {
      background: ${theme.accentColor};
      color: #fff;
      font-weight: 900;
      font-size: 24px;
      padding: 10px 28px;
      border-radius: 50px;
      letter-spacing: 3px;
      box-shadow: 0 0 35px ${theme.glowColor};
      text-transform: uppercase;
    }

    /* Main Content */
    .center-content {
      position: relative;
      z-index: 10;
      margin: auto 0;
    }
    .genre-tag {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: ${theme.badgeBg};
      border: 2px solid ${theme.badgeBorder};
      color: ${theme.accentColor};
      padding: 12px 28px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 30px;
      box-shadow: 0 0 25px ${theme.glowColor};
    }
    .genre-tag::before {
      content: '';
      width: 14px;
      height: 14px;
      background: ${theme.accentColor};
      border-radius: 50%;
    }
    .track-title {
      font-size: 118px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.0;
      text-transform: uppercase;
      letter-spacing: -2px;
      text-shadow: 0 15px 40px rgba(0,0,0,0.85);
      margin-bottom: 25px;
    }
    .concept-subtitle {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 32px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 1px;
      max-width: 1200px;
    }

    /* Footer Specs */
    .footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .specs-group {
      display: flex;
      gap: 40px;
    }
    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .spec-label {
      font-size: 16px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .spec-val {
      font-size: 36px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1px;
    }
    .spec-val-accent {
      color: ${theme.accentColor};
    }
    .cta-box {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #cbd5e1;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    .cta-box span {
      color: ${theme.accentColor};
    }
  </style>
</head>
<body>
  <div class="grid-lines"></div>
  <div class="glow-orb"></div>
  <div class="glow-orb-2"></div>

  <div class="header">
    <div class="logo-container">
      <div class="logo-badge">808</div>
      <div class="store-name">Beat Store</div>
    </div>
    <div class="free-pill">Free Download</div>
  </div>

  <div class="center-content">
    <div class="genre-tag">${theme.genreBadge}</div>
    <div class="track-title">${beat.title}</div>
    <div class="concept-subtitle">${beat.thumbnailConcept}</div>
  </div>

  <div class="footer">
    <div class="specs-group">
      <div class="spec-item">
        <div class="spec-label">Tempo</div>
        <div class="spec-val">${beat.bpm} <span class="spec-val-accent">BPM</span></div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Musical Key</div>
        <div class="spec-val">${beat.key}</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Style / Mood</div>
        <div class="spec-val">${beat.mood}</div>
      </div>
    </div>
    <div class="cta-box">
      <span>OFFICIAL STORE:</span> 808beatstore.com
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function main() {
  console.log(`🎨 Generating 20 bespoke 1080p thumbnails using Puppeteer...`);
  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : undefined;

  const browser = await puppeteer.launch({
    headless: 'new',
    ...(chromePath ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const outImg = path.join(artDir, `${slug}.jpg`);

    const html = getHtmlForBeat(b);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: outImg, type: 'jpeg', quality: 95 });

    // Also mirror to dist
    const distImg = path.resolve(`dist/web/assets/artwork/${slug}.jpg`);
    if (fs.existsSync(path.dirname(distImg))) {
      fs.copyFileSync(outImg, distImg);
    }

    console.log(`[${i + 1}/${beats.length}] Generated 1080p Thumbnail: ${slug}.jpg (${b.title})`);
  }

  await browser.close();
  console.log(`✅ All 20 stunning thumbnails generated successfully in public/assets/artwork/!`);
}

main().catch(console.error);
