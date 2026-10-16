import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const beats = JSON.parse(fs.readFileSync('data/scheduled-beats.json', 'utf-8'));
const artDir = path.resolve('public/assets/artwork');
if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });

// Specific Luxury Themes for each of the 20 Beats
const beatThemes = {
  'blackout': {
    primary: '#ef4444',
    secondary: '#991b1b',
    glow: 'rgba(239, 68, 68, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #200508 0%, #0d0103 55%, #000000 100%)',
    subGenre: 'DARK TRAP • 808 HEAVY',
    tagline: 'DYSTOPIAN SHADOWS & HARSH DISTORTION',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 50%, #ef4444 100%)'
  },
  'break-the-wall': {
    primary: '#f59e0b',
    secondary: '#b45309',
    glow: 'rgba(245, 158, 11, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #261603 0%, #120900 55%, #000000 100%)',
    subGenre: 'UK / NY DRILL • AGGRESSIVE',
    tagline: 'CONCRETE FRACTURE & INDUSTRIAL BASS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fde68a 50%, #f59e0b 100%)'
  },
  'broken-frame-31': {
    primary: '#818cf8',
    secondary: '#4338ca',
    glow: 'rgba(129, 140, 248, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #111438 0%, #07091f 55%, #000000 100%)',
    subGenre: 'MELODIC TRAP • EMOTIONAL',
    tagline: 'PRISMATIC GLASS & BITTERSWEET ECHOES',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)'
  },
  'broken-frame-31-1': {
    primary: '#38bdf8',
    secondary: '#0369a1',
    glow: 'rgba(56, 189, 248, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #051e36 0%, #020f1c 55%, #000000 100%)',
    subGenre: 'SAD HIP-HOP • NOCTURNAL',
    tagline: 'RAIN-SOAKED NEON & SOLITARY REFLECTIONS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 50%, #38bdf8 100%)'
  },
  'cold-goodbye': {
    primary: '#f43f5e',
    secondary: '#be123c',
    glow: 'rgba(244, 63, 94, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #290514 0%, #14020a 55%, #000000 100%)',
    subGenre: 'EMOTIONAL HIP-HOP • HEARTBREAK',
    tagline: 'MIDNIGHT HIGHWAY & FADING MEMORIES',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fecdd3 50%, #f43f5e 100%)'
  },
  'dead-silence': {
    primary: '#dc2626',
    secondary: '#7f1d1d',
    glow: 'rgba(220, 38, 38, 0.6)',
    bg: 'radial-gradient(circle at 50% 40%, #290606 0%, #140202 55%, #000000 100%)',
    subGenre: 'DARK DRILL • SINISTER BASS',
    tagline: 'MIDNIGHT GHOSTS & RELENTLESS SUB-GLIDES',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 50%, #dc2626 100%)'
  },
  'empty-room': {
    primary: '#fbbf24',
    secondary: '#b45309',
    glow: 'rgba(251, 191, 36, 0.5)',
    bg: 'radial-gradient(circle at 50% 40%, #261905 0%, #140d02 55%, #000000 100%)',
    subGenre: 'SOULFUL BOOM BAP • 90s MPC',
    tagline: 'WARM ANALOG TAPE & CHOPPED VINYL',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fbbf24 100%)'
  },
  'fading-lights': {
    primary: '#2dd4bf',
    secondary: '#0f766e',
    glow: 'rgba(45, 212, 191, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #032421 0%, #011210 55%, #000000 100%)',
    subGenre: 'AMBIENT TRAP • SPATIAL DREAM',
    tagline: 'CELESTIAL AURORA & HYPNOTIC PADS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #ccfbf1 50%, #2dd4bf 100%)'
  },
  'fault-line': {
    primary: '#c084fc',
    secondary: '#7e22ce',
    glow: 'rgba(192, 132, 252, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #24083b 0%, #12031f 55%, #000000 100%)',
    subGenre: 'HEAVY 808 TRAP • TECTONIC',
    tagline: 'EARTHQUAKE LOW END & SUB HARMONICS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 50%, #c084fc 100%)'
  },
  'fury-road': {
    primary: '#ec4899',
    secondary: '#be185d',
    glow: 'rgba(236, 72, 153, 0.6)',
    bg: 'radial-gradient(circle at 50% 40%, #2d051f 0%, #17020f 55%, #000000 100%)',
    subGenre: 'RAGE HIP-HOP • SYNTH EXPLOSION',
    tagline: 'HIGH-OCTANE SYNTH LEADS & SPEED',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fce7f3 50%, #ec4899 100%)'
  },
  'greed-glory': {
    primary: '#eab308',
    secondary: '#a16207',
    glow: 'rgba(234, 179, 8, 0.5)',
    bg: 'radial-gradient(circle at 50% 40%, #261f03 0%, #141001 55%, #000000 100%)',
    subGenre: 'GOLDEN BOOM BAP • CLASSIC',
    tagline: 'STREET AMBITION & GOLD LEAF CHORDS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fef9c3 50%, #eab308 100%)'
  },
  'gully-freestyle': {
    primary: '#ff5722',
    secondary: '#c83408',
    glow: 'rgba(255, 87, 34, 0.6)',
    bg: 'radial-gradient(circle at 50% 40%, #2d0e04 0%, #170601 55%, #000000 100%)',
    subGenre: 'DESI HIP-HOP • STREET GULLY',
    tagline: 'RAW CYLINDER 808s & INDIAN STREET HEAT',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #ffccbc 50%, #ff5722 100%)'
  },
  'iron-gate': {
    primary: '#e2e8f0',
    secondary: '#64748b',
    glow: 'rgba(226, 232, 240, 0.4)',
    bg: 'radial-gradient(circle at 50% 40%, #1a1e24 0%, #0d0f12 55%, #000000 100%)',
    subGenre: 'UNDERGROUND BOOM BAP • GRITTY',
    tagline: 'STEEL CHAINS & UNCOMPROMISING DRUMS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)'
  },
  'no-reply': {
    primary: '#60a5fa',
    secondary: '#2563eb',
    glow: 'rgba(96, 165, 250, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #081d3d 0%, #040e1f 55%, #000000 100%)',
    subGenre: 'MELODIC SAD TRAP • GUITAR',
    tagline: 'LEFT ON READ & LONELY BEDROOM CHORDS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #60a5fa 100%)'
  },
  'rainy-nights': {
    primary: '#a78bfa',
    secondary: '#6d28d9',
    glow: 'rgba(167, 139, 250, 0.5)',
    bg: 'radial-gradient(circle at 50% 40%, #1f0f3d 0%, #0f071f 55%, #000000 100%)',
    subGenre: 'LOFI HIP-HOP • COZY RAIN',
    tagline: 'ANALOG CRACKLE & NOSTALGIC PIANO',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #ede9fe 50%, #a78bfa 100%)'
  },
  'riot-call': {
    primary: '#ef4444',
    secondary: '#b91c1c',
    glow: 'rgba(239, 68, 68, 0.65)',
    bg: 'radial-gradient(circle at 50% 40%, #2e0505 0%, #170202 55%, #000000 100%)',
    subGenre: 'HIGH ENERGY DRILL • ADRENALINE',
    tagline: 'SIRENS BLAZING & AGGRESSIVE HI-HATS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #fecaca 50%, #ef4444 100%)'
  },
  'steel-nerve': {
    primary: '#10b981',
    secondary: '#047857',
    glow: 'rgba(16, 185, 129, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #032417 0%, #01120b 55%, #000000 100%)',
    subGenre: 'DARK TRAP • CYBERNETIC',
    tagline: 'TITANIUM CASING & SURGICAL PRECISION',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #d1fae5 50%, #10b981 100%)'
  },
  'still-hurts': {
    primary: '#34d399',
    secondary: '#059669',
    glow: 'rgba(52, 211, 153, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #06261b 0%, #02140e 55%, #000000 100%)',
    subGenre: 'GUITAR TRAP • BITTERSWEET',
    tagline: 'FINGERPICKED MELANCHOLY & DEEP SUBS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 50%, #34d399 100%)'
  },
  'turn-page': {
    primary: '#d6d3d1',
    secondary: '#78716c',
    glow: 'rgba(214, 211, 209, 0.4)',
    bg: 'radial-gradient(circle at 50% 40%, #1c1917 0%, #0c0a09 55%, #000000 100%)',
    subGenre: 'STORYTELLING BOOMBAP • RAW',
    tagline: 'NEW CHAPTERS & DEEP POETIC BARS',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #e7e5e4 50%, #a8a29e 100%)'
  },
  'winter-hurt': {
    primary: '#38bdf8',
    secondary: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.6)',
    bg: 'radial-gradient(circle at 50% 40%, #08243d 0%, #031221 55%, #000000 100%)',
    subGenre: 'AMBIENT COLD BEAT • FROST',
    tagline: 'ARCTIC BREEZE & SUB-ZERO HARMONIES',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #bae6fd 50%, #38bdf8 100%)'
  }
};

function getSquarePosterHtml(beat, slug) {
  const theme = beatThemes[slug] || {
    primary: '#0066ff',
    secondary: '#0044aa',
    glow: 'rgba(0, 102, 255, 0.55)',
    bg: 'radial-gradient(circle at 50% 40%, #061833 0%, #020c1a 55%, #000000 100%)',
    subGenre: `${beat.genre.toUpperCase()} INSTRUMENTAL`,
    tagline: 'OFFICIAL STUDIO MASTER RELEASE',
    accentGrad: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #3b82f6 100%)'
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,800;0,900;1,900&family=Space+Grotesk:wght@600;700&family=Cinzel:wght@700;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      width: 1200px;
      height: 1200px;
      background: #000;
      font-family: 'Montserrat', -apple-system, sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* Outer Vinyl Sleeve Border */
    .sleeve-border {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      pointer-events: none;
      z-index: 50;
    }

    /* Primary Dynamic Gradient Background */
    .bg-canvas {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: ${theme.bg};
      z-index: 1;
    }

    /* Vinyl Grooves Texture in Background */
    .vinyl-grooves {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1100px;
      height: 1100px;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 2px,
        transparent 3px,
        transparent 8px
      );
      opacity: 0.85;
      z-index: 2;
    }

    /* High-Depth Radial Glow */
    .glow-core {
      position: absolute;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      background: ${theme.glow};
      filter: blur(140px);
      top: 20%;
      left: 18%;
      opacity: 0.65;
      z-index: 3;
    }

    /* Fine Futuristic Grid Overlay */
    .cyber-grid {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-size: 60px 60px;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      z-index: 4;
    }

    /* Diagonal Vinyl Cellophane Glare */
    .vinyl-glare {
      position: absolute;
      top: -300px;
      right: -200px;
      width: 900px;
      height: 900px;
      background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 40%, transparent 70%);
      transform: rotate(-15deg);
      pointer-events: none;
      z-index: 40;
    }

    /* TOP HEADER SECTION */
    .header {
      position: relative;
      z-index: 20;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-icon-box {
      width: 48px;
      height: 48px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
    }

    .brand-icon-text {
      color: #000000;
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -1px;
    }

    .brand-text-block {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .brand-subtitle {
      color: ${theme.primary};
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .top-meta-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 8px 18px;
      border-radius: 30px;
      backdrop-filter: blur(10px);
    }

    .top-meta-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${theme.primary};
      box-shadow: 0 0 10px ${theme.primary};
    }

    .top-meta-text {
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* CENTER HERO SECTION */
    .center-section {
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin: auto 0;
      padding: 20px 0;
    }

    .genre-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.6);
      border: 1.5px solid ${theme.primary};
      padding: 10px 24px;
      border-radius: 40px;
      margin-bottom: 24px;
      box-shadow: 0 0 30px ${theme.glow};
      backdrop-filter: blur(16px);
    }

    .genre-pill-text {
      color: #ffffff;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .track-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      font-size: 88px;
      line-height: 0.95;
      letter-spacing: -2px;
      text-transform: uppercase;
      margin-bottom: 22px;
      background: ${theme.accentGrad};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.9));
      max-width: 1080px;
      word-wrap: break-word;
    }

    .tagline-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 30px;
    }

    /* Audio Waveform Graphic */
    .waveform-visualizer {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 48px;
      padding: 0 40px;
    }

    .waveform-bar {
      width: 4px;
      background: ${theme.primary};
      border-radius: 4px;
      box-shadow: 0 0 12px ${theme.glow};
      opacity: 0.85;
    }

    /* BOTTOM FOOTER SECTION */
    .footer {
      position: relative;
      z-index: 20;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Left: Iconic Parental Advisory Badge */
    .advisory-badge {
      background: #ffffff;
      color: #000000;
      border-radius: 4px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 3px solid #000000;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
      width: 170px;
    }

    .advisory-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1.5px;
      line-height: 1;
      margin-bottom: 4px;
    }

    .advisory-content {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      line-height: 1;
      margin-bottom: 4px;
      color: #262626;
    }

    .advisory-sub {
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 1.2px;
      color: #000000;
      border-top: 1px solid #000;
      padding-top: 3px;
      width: 100%;
      text-align: center;
    }

    /* Center: Specs Badges */
    .specs-center {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .spec-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 12px 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(12px);
    }

    .spec-label {
      color: #94a3b8;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .spec-value {
      color: #ffffff;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .spec-value span {
      color: ${theme.primary};
      font-size: 16px;
    }

    /* Right: Authentic Studio Barcode & Hologram */
    .studio-seal {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .barcode-box {
      background: #ffffff;
      padding: 6px 12px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .barcode-lines {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 32px;
      width: 120px;
    }

    .b-bar {
      background: #000;
      height: 100%;
    }

    .barcode-num {
      color: #000;
      font-size: 9px;
      font-family: 'Space Grotesk', monospace;
      font-weight: 700;
      letter-spacing: 2px;
      margin-top: 2px;
    }

    .studio-credit {
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .studio-credit span {
      color: ${theme.primary};
    }
  </style>
</head>
<body>
  <!-- Vinyl Outer Sleeve Line -->
  <div class="sleeve-border"></div>

  <!-- Background Canvas & Dynamic Elements -->
  <div class="bg-canvas"></div>
  <div class="vinyl-grooves"></div>
  <div class="glow-core"></div>
  <div class="cyber-grid"></div>
  <div class="vinyl-glare"></div>

  <!-- Top Header -->
  <div class="header">
    <div class="brand-group">
      <div class="brand-icon-box">
        <span class="brand-icon-text">808</span>
      </div>
      <div class="brand-text-block">
        <div class="brand-title">808 BEAT STORE</div>
        <div class="brand-subtitle">ORIGINAL MASTER RECORDINGS</div>
      </div>
    </div>
    <div class="top-meta-badge">
      <div class="top-meta-dot"></div>
      <div class="top-meta-text">STUDIO VAULT RELEASE</div>
    </div>
  </div>

  <!-- Center Hero Content -->
  <div class="center-section">
    <div class="genre-pill">
      <span class="genre-pill-text">${theme.subGenre}</span>
    </div>
    <h1 class="track-title">${beat.title}</h1>
    <div class="tagline-text">${theme.tagline}</div>

    <!-- Stylized Audio Waveform -->
    <div class="waveform-visualizer">
      <div class="waveform-bar" style="height: 18px;"></div>
      <div class="waveform-bar" style="height: 28px;"></div>
      <div class="waveform-bar" style="height: 42px;"></div>
      <div class="waveform-bar" style="height: 24px;"></div>
      <div class="waveform-bar" style="height: 36px;"></div>
      <div class="waveform-bar" style="height: 48px;"></div>
      <div class="waveform-bar" style="height: 38px;"></div>
      <div class="waveform-bar" style="height: 22px;"></div>
      <div class="waveform-bar" style="height: 44px;"></div>
      <div class="waveform-bar" style="height: 30px;"></div>
      <div class="waveform-bar" style="height: 48px;"></div>
      <div class="waveform-bar" style="height: 34px;"></div>
      <div class="waveform-bar" style="height: 46px;"></div>
      <div class="waveform-bar" style="height: 26px;"></div>
      <div class="waveform-bar" style="height: 40px;"></div>
      <div class="waveform-bar" style="height: 48px;"></div>
      <div class="waveform-bar" style="height: 32px;"></div>
      <div class="waveform-bar" style="height: 20px;"></div>
      <div class="waveform-bar" style="height: 36px;"></div>
      <div class="waveform-bar" style="height: 16px;"></div>
    </div>
  </div>

  <!-- Bottom Specs & Badges -->
  <div class="footer">
    <!-- Iconic Parental Advisory Badge -->
    <div class="advisory-badge">
      <div class="advisory-title">PARENTAL</div>
      <div class="advisory-content">ADVISORY</div>
      <div class="advisory-sub">PROD BY 808 BEAT STORE</div>
    </div>

    <!-- Center BPM & Key -->
    <div class="specs-center">
      <div class="spec-card">
        <div class="spec-label">TEMPO</div>
        <div class="spec-value">${beat.bpm} <span>BPM</span></div>
      </div>
      <div class="spec-card">
        <div class="spec-label">TONIC KEY</div>
        <div class="spec-value">${beat.key}</div>
      </div>
    </div>

    <!-- Right Barcode & Official Studio Seal -->
    <div class="studio-seal">
      <div class="barcode-box">
        <div class="barcode-lines">
          <div class="b-bar" style="width: 3px;"></div>
          <div class="b-bar" style="width: 1px;"></div>
          <div class="b-bar" style="width: 4px;"></div>
          <div class="b-bar" style="width: 2px;"></div>
          <div class="b-bar" style="width: 1px;"></div>
          <div class="b-bar" style="width: 5px;"></div>
          <div class="b-bar" style="width: 2px;"></div>
          <div class="b-bar" style="width: 3px;"></div>
          <div class="b-bar" style="width: 1px;"></div>
          <div class="b-bar" style="width: 4px;"></div>
          <div class="b-bar" style="width: 2px;"></div>
          <div class="b-bar" style="width: 6px;"></div>
          <div class="b-bar" style="width: 1px;"></div>
          <div class="b-bar" style="width: 3px;"></div>
          <div class="b-bar" style="width: 2px;"></div>
          <div class="b-bar" style="width: 5px;"></div>
          <div class="b-bar" style="width: 2px;"></div>
          <div class="b-bar" style="width: 4px;"></div>
          <div class="b-bar" style="width: 1px;"></div>
          <div class="b-bar" style="width: 3px;"></div>
        </div>
        <div class="barcode-num">808-MASTER-2026</div>
      </div>
      <div class="studio-credit">PRODUCED BY <span>808 TANTRIK</span></div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function main() {
  console.log(`🎨 Generating 20 Ultra-HD 1200x1200 True Square Album Posters...`);
  
  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : undefined;

  const browser = await puppeteer.launch({
    headless: 'new',
    ...(chromePath ? { executablePath: chromePath } : {}),
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 1 });

  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const outImg = path.join(artDir, `${slug}.jpg`);

    const html = getSquarePosterHtml(b, slug);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: outImg, type: 'jpeg', quality: 96 });

    // Also mirror to dist if exists
    const distImg = path.resolve(`dist/web/assets/artwork/${slug}.jpg`);
    if (fs.existsSync(path.dirname(distImg))) {
      fs.copyFileSync(outImg, distImg);
    }

    console.log(`[${i + 1}/${beats.length}] ✅ Generated 1200x1200 Vinyl Poster: ${slug}.jpg ("${b.title}")`);
  }

  // Also generate missing-you and clean if present
  const missingYouPath = path.join(artDir, 'missing-you.jpg');
  const cleanPath = path.join(artDir, 'clean.jpg');
  const missingYouCleanPath = path.join(artDir, 'missing-you-clean.jpg');

  const coldGoodbyePath = path.join(artDir, 'cold-goodbye.jpg');
  if (fs.existsSync(coldGoodbyePath)) {
    if (!fs.existsSync(missingYouPath)) fs.copyFileSync(coldGoodbyePath, missingYouPath);
    if (!fs.existsSync(cleanPath)) fs.copyFileSync(coldGoodbyePath, cleanPath);
    if (!fs.existsSync(missingYouCleanPath)) fs.copyFileSync(coldGoodbyePath, missingYouCleanPath);
  }

  await browser.close();
  console.log(`\n🎉 All 20 bespoke 1200x1200 album posters successfully generated in public/assets/artwork/!`);
}

main().catch(console.error);
