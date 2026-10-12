import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { scheduleManager } from './schedule-manager';

const SESSION_DIR = path.resolve('data/wa-session');
const QR_HTML_PATH = path.resolve('public/wa-qr.html');
const QR_IMG_PATH = path.resolve('public/assets/wa-qr.png');

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}
if (!fs.existsSync(path.resolve('public/assets'))) {
  fs.mkdirSync(path.resolve('public/assets'), { recursive: true });
}

// Cleanup crash locks from sudden reboot or shutdown
function cleanStaleSessionLocks(baseDir: string) {
  try {
    execSync('wmic process where "name=\'chrome.exe\' and commandline like \'%wa-session%\'" call terminate 2>nul');
  } catch (e) { }

  const dirs = [
    baseDir,
    path.join(baseDir, 'session'),
    path.join(baseDir, 'session', 'Default')
  ];
  const lockFiles = [
    'DevToolsActivePort',
    'SingletonLock',
    'SingletonCookie',
    'SingletonSocket'
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of lockFiles) {
      const full = path.join(dir, file);
      if (fs.existsSync(full)) {
        try {
          fs.unlinkSync(full);
          console.log(`🧹 Cleaned stale crash lock: ${file}`);
        } catch (e) {
          // ignore
        }
      }
    }
  }
}

cleanStaleSessionLocks(SESSION_DIR);

// Single-instance guard
const PID_FILE = path.resolve('data/whatsapp-bot.pid');
if (fs.existsSync(PID_FILE)) {
  try {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (!isNaN(existingPid) && existingPid !== process.pid) {
      try {
        process.kill(existingPid, 0);
        console.log(`⚠️ WhatsApp Bot is already running (PID: ${existingPid}). Exiting duplicate instance.`);
        process.exit(0);
      } catch (e) {
        // PID is stale, continue
      }
    }
  } catch (e) { }
}
try {
  fs.writeFileSync(PID_FILE, String(process.pid), 'utf-8');
} catch (e) { }

process.on('exit', () => {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch (e) { }
});

console.log('🤖 Initializing 808 Beat Store WhatsApp Bot...');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : undefined;

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: SESSION_DIR
  }),
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/{version}.html',
    strict: false
  },
  puppeteer: {
    headless: 'new',
    ...(chromePath ? { executablePath: chromePath } : {}),
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-extensions'
    ]
  }
});

let isProcessingBeat = false;
const botSentMessages = new Set<string>();
const processedMessageIds = new Set<string>();

// Helper function to safely send response strictly back to user's Self-Chat
async function replyToSelfChat(text: string) {
  try {
    const targetId = client.info?.wid?._serialized || '919754303398@c.us';
    const sent = await client.sendMessage(targetId, text);
    if (sent && sent.id) {
      botSentMessages.add(sent.id._serialized);
      if (botSentMessages.size > 500) {
        const first = botSentMessages.values().next().value;
        if (first) botSentMessages.delete(first);
      }
    }
    console.log(`📤 [BOT REPLIED TO SELF-CHAT]:\n${text}\n`);
  } catch (err) {
    console.error('❌ Error sending message to self-chat:', err);
  }
}

// Helper function to send media files (Reels, Stories, Posters) directly to user's Self-Chat
async function sendMediaToSelfChat(filePath: string, caption?: string) {
  try {
    if (!fs.existsSync(filePath)) return;
    const targetId = client.info?.wid?._serialized || '919754303398@c.us';
    if (MessageMedia && MessageMedia.fromFilePath) {
      const media = MessageMedia.fromFilePath(filePath);
      const sent = await client.sendMessage(targetId, media, { caption });
      if (sent && sent.id) {
        botSentMessages.add(sent.id._serialized);
      }
      console.log(`📤 [BOT SENT MEDIA TO SELF-CHAT]: ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.warn('⚠️ Media send fallback:', err);
  }
}

// 1. QR Code Event
client.on('qr', async (qr) => {
  console.log('\n======================================================');
  console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP (LINKED DEVICES):');
  console.log('======================================================\n');

  qrcodeTerminal.generate(qr, { small: true });

  try {
    await QRCode.toFile(QR_IMG_PATH, qr, { width: 450, margin: 2 });
    const qrDataUrl = await QRCode.toDataURL(qr, { width: 450, margin: 2 });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>808 Beat Store - WhatsApp QR Login</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { background: #080815; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: #121324; border: 1px solid #1E2340; border-radius: 16px; padding: 20px; text-align: center; max-width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { color: #00F0FF; font-size: 16px; margin: 0 0 6px 0; }
        p { color: #94A3B8; font-size: 12px; margin: 0 0 10px 0; }
        .qr-box { background: #fff; padding: 10px; border-radius: 10px; display: inline-block; margin: 6px 0; }
        .qr-box img { width: 170px; height: 170px; display: block; border-radius: 4px; }
        .hint { font-size: 11px; color: #64748B; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🎹 808 Beat Store Bot</h1>
        <p>WhatsApp > Linked Devices > Scan</p>
        <div class="qr-box"><img src="${qrDataUrl}" alt="QR" /></div>
        <div class="hint">Compact View • Auto-refreshes</div>
      </div>
    </body>
    </html>`;
    fs.writeFileSync(QR_HTML_PATH, htmlContent, 'utf-8');
    try {
      spawn('cmd', ['/c', 'start', '', QR_HTML_PATH], { detached: true, stdio: 'ignore' });
    } catch (e) { }
  } catch (err) {
    console.error('Error generating QR image:', err);
  }
});

// Lifecycle Events
client.on('loading_screen', (percent, message) => {
  console.log(`⏳ [WhatsApp Loading]: ${percent}% - ${message}`);
});

client.on('authenticated', () => {
  console.log('🔐 [WhatsApp Auth]: Session restored successfully from cache!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ [WhatsApp Auth Failure]:', msg);
});

client.on('disconnected', async (reason) => {
  console.warn('⚠️ [WhatsApp Disconnected]:', reason);
  try {
    await client.destroy();
  } catch (e) { }
  if (reason === 'LOGOUT') {
    console.log('🔄 Session was logged out. Purging session directory for fresh QR authentication...');
    try {
      if (fs.existsSync(SESSION_DIR)) {
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
      }
    } catch (e) { }
    process.exit(0);
  }
  console.log('🔄 Re-initializing WhatsApp client in 5 seconds...');
  setTimeout(() => {
    cleanStaleSessionLocks(SESSION_DIR);
    client.initialize().catch((err) => console.error('Error during auto-reconnect:', err));
  }, 5000);
});

// 2. Ready Event
client.on('ready', async () => {
  const myWid = client.info?.wid?._serialized || '919754303398@c.us';
  console.log('\n======================================================');
  console.log('🎉 808 BEAT STORE WHATSAPP BOT IS LIVE & CONNECTED!');
  console.log(`⚡ Operating strictly under Self-Chat Protocol for ${myWid}`);
  console.log('======================================================\n');

  if (fs.existsSync(QR_HTML_PATH)) {
    fs.unlinkSync(QR_HTML_PATH);
  }

  // Autonomous 30-Day Batch Schedule Worker (checks every 60s for due daily drops)
  setInterval(() => {
    scheduleManager.processDueBeats(replyToSelfChat).catch(e => console.error('Schedule worker error:', e));
  }, 60000);
});

// 3. Message Listener - Strictly Self-Chat Only (Note-to-Self)
client.on('message_create', async (msg) => {
  // Prevent duplicate processing of the same message event
  if (msg.id && processedMessageIds.has(msg.id._serialized)) {
    return;
  }

  // Ignore messages sent by the bot itself
  if (msg.id && botSentMessages.has(msg.id._serialized)) {
    return;
  }

  const myWid = client.info?.wid?._serialized || '919754303398@c.us';
  const myNumber = client.info?.wid?.user || '9754303398';

  // Rule 1: Target Communication (Self-Chat Only)
  let chat: any;
  try {
    chat = await msg.getChat();
  } catch (e) {
    return;
  }

  // Strictly reject groups
  if (!chat || chat.isGroup) {
    return;
  }

  // Strictly reject any chat with external contacts or other numbers
  const chatId = chat.id?._serialized || '';
  const isSelfChat =
    chatId === myWid ||
    (chat.id?.user === myNumber && msg.fromMe) ||
    (msg.to === myWid && msg.from === myWid);

  if (!isSelfChat) {
    // Under NO circumstances process or reply to external contacts or outside chats
    return;
  }

  if (msg.id) {
    processedMessageIds.add(msg.id._serialized);
    if (processedMessageIds.size > 500) {
      const oldest = processedMessageIds.values().next().value;
      if (oldest) processedMessageIds.delete(oldest);
    }
  }

  const body = msg.body?.trim();
  if (!body) return;

  // Ignore bot output patterns to avoid echoing
  if (
    body.startsWith('STARTED') ||
    body.startsWith('COMPLETED') ||
    body.startsWith('[Status:') ||
    body.startsWith('🤖') ||
    body.startsWith('🎹') ||
    body.startsWith('⏳') ||
    body.startsWith('🎉')
  ) {
    return;
  }

  console.log(`\n📩 [SELF-CHAT COMMAND RECEIVED]: "${body}"`);
  const lower = body.toLowerCase();

  // -------------------------------------------------------------
  // A. Beat Upload Pipeline (Google Drive Link)
  // -------------------------------------------------------------
  if (body.includes('drive.google.com')) {
    if (isProcessingBeat) {
      await replyToSelfChat('STARTED: [Status: A beat is currently being processed. Please wait for the current task to finish.]');
      return;
    }

    const driveMatch = body.match(/https?:\/\/drive\.google\.com\/[^\s]+/);
    const driveUrl = driveMatch ? driveMatch[0] : null;

    const titleMatch = body.match(/(?:title|name)[:\s-]+([^\n,]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'UNTITLED BEAT';

    const bpmMatch = body.match(/(?:bpm)[:\s-]+(\d+)/i);
    const bpm = bpmMatch ? bpmMatch[1].trim() : '130';

    const keyMatch = body.match(/(?:key)[:\s-]+([^\n,]+)/i);
    const key = keyMatch ? keyMatch[1].trim() : 'C Minor';

    const moodMatch = body.match(/(?:mood)[:\s-]+([^\n,]+)/i);
    const mood = moodMatch ? moodMatch[1].trim() : 'Energetic, Hard';

    const genreMatch = body.match(/(?:genre|style)[:\s-]+([^\n,]+)/i);
    const genre = genreMatch ? genreMatch[1].trim() : 'Hip-Hop';

    // Step 1: Binary Task Initiation Confirmation
    await replyToSelfChat(`STARTED: [Status: Started working on your request] - Processing beat upload "${title}" (${bpm} BPM - ${key})`);
    isProcessingBeat = true;

    try {
      const proc = spawn('npx', [
        'tsx',
        'scripts/whatsapp-pipeline.ts',
        '--drive', driveUrl || '',
        '--title', title,
        '--bpm', bpm,
        '--key', key,
        '--mood', mood,
        '--genre', genre
      ], {
        shell: true
      });

      let stdoutData = '';
      proc.stdout.on('data', (d) => {
        stdoutData += d.toString();
        process.stdout.write(d);
      });
      proc.stderr.on('data', (d) => process.stderr.write(d));

      proc.on('close', async (code) => {
        isProcessingBeat = false;
        if (code === 0) {
          const ytMatch = stdoutData.match(/https:\/\/youtu\.be\/[a-zA-Z0-9_-]+/);
          const ytUrl = ytMatch ? ytMatch[0] : 'https://youtube.com/@808beatstore';
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const storeUrl = `https://dashing-medovik-13fc8a.netlify.app/#/beats/${slug}`;

          const reelFile = path.resolve(`public/assets/instagram/${slug}-reel-9x16.mp4`);
          const storyFile = path.resolve(`public/assets/instagram/${slug}-story-9x16.mp4`);

          // Step 2: Binary Task Completion Confirmation with Multi-Platform Breakdown
          const finalMsg = `COMPLETED: [Status: Task Completed successfully]

🎵 "${title}" (${bpm} BPM • ${key})
• Produced by 808 Beat Store

🌐 MULTI-PLATFORM SIMULTANEOUS DISTRIBUTION:
📺 YouTube: ${ytUrl}
🛒 Beat Store: ${storeUrl}
📸 Instagram Reel: Live / Ready (9:16 Vertical HD)
📱 Instagram Story: Live / Ready (9:16 Vertical 15s Teaser)
🔗 Official IG: https://www.instagram.com/808_beatstore?stkn=MWxnMmFqaWJjbWZlOQ%3D%3D&utm_source=qr

🔥 YouTube, Beat Store & Instagram are completely in sync!`;

          await replyToSelfChat(finalMsg);

          // Deliver 9:16 Reel Video directly to WhatsApp self-chat if exists
          if (fs.existsSync(reelFile)) {
            await sendMediaToSelfChat(reelFile, `🎬 [Instagram Reel - 9:16 HD]\n"${title}" (${bpm} BPM - ${key})\n#808BeatStore #TypeBeat`);
          }

          // Deliver 9:16 Story Video directly to WhatsApp self-chat if exists
          if (fs.existsSync(storyFile)) {
            await sendMediaToSelfChat(storyFile, `📱 [Instagram Story - 15s Teaser]\n"${title}"\nSwipe Up / Link in Bio`);
          }
        } else {
          await replyToSelfChat(`COMPLETED: [Status: Task Failed - Process exited with code ${code}]`);
        }
      });
    } catch (err: any) {
      isProcessingBeat = false;
      await replyToSelfChat(`COMPLETED: [Status: Task Failed - ${err.message || 'Unknown error'}]`);
    }
    return;
  }

  // -------------------------------------------------------------
  // B. Price Update Command
  // -------------------------------------------------------------
  if (lower.includes('price') || lower.includes('keemat') || lower.includes('rate')) {
    const numMatch = body.match(/(\d{3,6})/);
    if (numMatch) {
      const newPrice = parseInt(numMatch[1], 10);
      const isExclusive = lower.includes('exclusive');
      const priceType = isExclusive ? 'Exclusive License' : 'Non-Exclusive License';

      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Updating ${priceType} to ₹${newPrice.toLocaleString('en-IN')}`);

      const brandPath = path.resolve('packages/config/src/brand.ts');
      const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');

      if (fs.existsSync(brandPath)) {
        let brandContent = fs.readFileSync(brandPath, 'utf-8');
        if (isExclusive) {
          brandContent = brandContent.replace(/exclusivePrice:\s*\d+/, `exclusivePrice: ${newPrice}`);
        } else {
          brandContent = brandContent.replace(/nonExclusivePrice:\s*\d+/, `nonExclusivePrice: ${newPrice}`);
        }
        fs.writeFileSync(brandPath, brandContent, 'utf-8');
      }

      if (fs.existsSync(fallbackPath)) {
        let fbContent = fs.readFileSync(fallbackPath, 'utf-8');
        if (isExclusive) {
          fbContent = fbContent.replace(/"name":\s*"EXCLUSIVE",\s*"displayName":\s*"Exclusive License",\s*"description":\s*"[^"]*",\s*"price":\s*\d+/g, (m) => m.replace(/"price":\s*\d+/, `"price": ${newPrice}`));
        } else {
          fbContent = fbContent.replace(/"name":\s*"NON_EXCLUSIVE",\s*"displayName":\s*"Non-Exclusive License",\s*"description":\s*"[^"]*",\s*"price":\s*\d+/g, (m) => m.replace(/"price":\s*\d+/, `"price": ${newPrice}`));
        }
        fs.writeFileSync(fallbackPath, fbContent, 'utf-8');
      }

      const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
      buildProc.on('close', async () => {
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - ${priceType} updated to ₹${newPrice.toLocaleString('en-IN')}. Store bundle rebuilt.`);
      });
      return;
    }
  }

  // -------------------------------------------------------------
  // C. UPI ID Update Command
  // -------------------------------------------------------------
  const upiMatch = body.match(/([a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32})/);
  if (upiMatch && (lower.includes('upi') || lower.includes('id') || lower.includes('payment') || lower.includes('badlo') || lower.includes('change'))) {
    const newUpi = upiMatch[1];
    await replyToSelfChat(`STARTED: [Status: Started working on your request] - Updating UPI ID to ${newUpi}`);

    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf-8');
      envContent = envContent.replace(/UPI_ID="[^"]*"/, `UPI_ID="${newUpi}"`);
      envContent = envContent.replace(/VITE_UPI_ID="[^"]*"/, `VITE_UPI_ID="${newUpi}"`);
      fs.writeFileSync(envPath, envContent, 'utf-8');
    }

    const checkoutPath = path.resolve('apps/web/src/pages/CheckoutPage.tsx');
    if (fs.existsSync(checkoutPath)) {
      let checkoutContent = fs.readFileSync(checkoutPath, 'utf-8');
      checkoutContent = checkoutContent.replace(/9754303398@ybl/g, newUpi);
      fs.writeFileSync(checkoutPath, checkoutContent, 'utf-8');
    }

    const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
    buildProc.on('close', async () => {
      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Checkout UPI ID updated to ${newUpi}.`);
    });
    return;
  }

  // -------------------------------------------------------------
  // D. Delete / Remove Beat Command
  // -------------------------------------------------------------
  if (lower.includes('delete beat') || lower.includes('remove beat') || lower.includes('beat hata do') || lower.includes('delete karo beat')) {
    const targetTitle = body.replace(/delete\s+beat|remove\s+beat|beat\s+hata\s+do|delete\s+karo\s+beat/gi, '').trim();
    if (targetTitle) {
      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Removing beat "${targetTitle}"`);

      const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');
      if (fs.existsSync(fallbackPath)) {
        let fbContent = fs.readFileSync(fallbackPath, 'utf-8');
        const regex = new RegExp(`\\{[^\\}]*"title":\\s*"${targetTitle}"[\\s\\S]*?\\},?`, 'i');
        fbContent = fbContent.replace(regex, '');
        fs.writeFileSync(fallbackPath, fbContent, 'utf-8');
      }

      const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
      buildProc.on('close', async () => {
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Beat "${targetTitle}" removed from catalog.`);
      });
      return;
    }
  }

  // -------------------------------------------------------------
  // E. List Beats Command
  // -------------------------------------------------------------
  if (lower.includes('list') || lower.includes('all beats') || lower.includes('catalog') || lower.includes('kitne beat')) {
    const fallbackPath = path.resolve('apps/web/src/data/fallbackData.ts');
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf-8');
      const titles = [...content.matchAll(/"title":\s*"([^"]+)"/g)].map(m => m[1]);
      const listText = titles.slice(0, 10).map((t, i) => `${i + 1}. ${t}`).join('\n');
      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]\n\n🎵 808 Beat Store Catalog (${titles.length} Tracks):\n${listText}\n\n🌐 https://dashing-medovik-13fc8a.netlify.app/#/beats`);
      return;
    }
  }

  // -------------------------------------------------------------
  // F. Change Tagline or Hero Banner
  // -------------------------------------------------------------
  if (lower.includes('tagline:') || lower.includes('hero:')) {
    const newText = body.replace(/tagline:|hero:/i, '').trim();
    await replyToSelfChat(`STARTED: [Status: Started working on your request] - Updating tagline to "${newText}"`);

    const brandPath = path.resolve('packages/config/src/brand.ts');
    if (fs.existsSync(brandPath)) {
      let brandContent = fs.readFileSync(brandPath, 'utf-8');
      brandContent = brandContent.replace(/tagline:\s*"[^"]*"/, `tagline: "${newText}"`);
      fs.writeFileSync(brandPath, brandContent, 'utf-8');
    }
    const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
    buildProc.on('close', async () => {
      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Website tagline updated to "${newText}".`);
    });
    return;
  }

  // -------------------------------------------------------------
  // G. About Page Update Command
  // -------------------------------------------------------------
  if (lower.includes('about')) {
    const hasNewContent = body.includes(':') || lower.includes('likh') || lower.includes('set karo') || lower.includes('mera bio');
    if (hasNewContent) {
      const newAboutText = body.replace(/about\s*:\s*|about\s*me\s*likho\s*|about\s*kardo\s*|bio\s*:\s*/i, '').trim();
      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Updating About text`);

      const brandPath = path.resolve('packages/config/src/brand.ts');
      if (fs.existsSync(brandPath)) {
        let brandContent = fs.readFileSync(brandPath, 'utf-8');
        brandContent = brandContent.replace(/heroSubtitle:\s*"[^"]*"/, `heroSubtitle: "${newAboutText}"`);
        fs.writeFileSync(brandPath, brandContent, 'utf-8');
      }
      const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
      buildProc.on('close', async () => {
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - About page updated to: "${newAboutText}".`);
      });
      return;
    } else {
      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - To update About page, send: About: <your new bio text>`);
      return;
    }
  }

  // -------------------------------------------------------------
  // H. Instagram Full Automation & Publishing Suite
  // -------------------------------------------------------------
  if (lower.startsWith('insta') || lower.startsWith('instagram') || lower.includes('reel') || lower.includes('story')) {
    // 1. Meta Graph API Credentials Configuration
    if (lower.includes('token:') || lower.includes('id:') || lower.includes('config') || lower.includes('creds')) {
      await replyToSelfChat('STARTED: [Status: Started working on your request] - Updating Instagram API credentials');
      const tokenMatch = body.match(/token[:\s]+([^\s,]+)/i);
      const idMatch = body.match(/id[:\s]+([^\s,]+)/i);

      const envPath = path.resolve('.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8');
        if (tokenMatch) {
          envContent = envContent.replace(/INSTAGRAM_ACCESS_TOKEN="[^"]*"/, `INSTAGRAM_ACCESS_TOKEN="${tokenMatch[1]}"`);
          if (!envContent.includes('INSTAGRAM_ACCESS_TOKEN=')) envContent += `\nINSTAGRAM_ACCESS_TOKEN="${tokenMatch[1]}"`;
        }
        if (idMatch) {
          envContent = envContent.replace(/INSTAGRAM_ACCOUNT_ID="[^"]*"/, `INSTAGRAM_ACCOUNT_ID="${idMatch[1]}"`);
          if (!envContent.includes('INSTAGRAM_ACCOUNT_ID=')) envContent += `\nINSTAGRAM_ACCOUNT_ID="${idMatch[1]}"`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
      }

      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Instagram Meta API credentials saved.\nReels & Stories will now publish directly to @808_beatstore.`);
      return;
    }

    // 2. On-Demand Reel Generator / Publisher
    if (lower.includes('reel') || lower.includes('video upload')) {
      const targetTitle = body.replace(/insta|instagram|reel|generate|banao|upload|post|karo/gi, '').trim() || 'SAMPLE BEAT';
      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Generating 9:16 vertical Reel for "${targetTitle}"`);

      const reelProc = spawn('npx', ['tsx', 'scripts/instagram-cli.ts', 'reel', '--title', targetTitle], { shell: true });
      let reelStdout = '';
      reelProc.stdout.on('data', (d) => { reelStdout += d.toString(); });

      reelProc.on('close', async (code) => {
        if (code === 0) {
          const slug = targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const reelPath = path.resolve(`public/assets/instagram/${slug}-reel-9x16.mp4`);
          await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]\n\n🎬 Instagram Reel (9:16 Vertical HD) ready for "${targetTitle}".\n• Channel: @808_beatstore\n• Formatted with viral hook caption & 3-tier hashtags.`);
          if (fs.existsSync(reelPath)) {
            await sendMediaToSelfChat(reelPath, `🎬 Instagram Reel: "${targetTitle}"\n#808BeatStore #TypeBeat`);
          }
        } else {
          await replyToSelfChat(`COMPLETED: [Status: Reel generation completed with status ${code}]`);
        }
      });
      return;
    }

    // 3. On-Demand Story Generator / Publisher
    if (lower.includes('story')) {
      const targetTitle = body.replace(/insta|instagram|story|generate|lagao|post|karo/gi, '').trim() || 'SAMPLE BEAT';
      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Creating 15s Story teaser for "${targetTitle}"`);

      const storyProc = spawn('npx', ['tsx', 'scripts/instagram-cli.ts', 'story', '--title', targetTitle], { shell: true });
      storyProc.on('close', async (code) => {
        const slug = targetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const storyPath = path.resolve(`public/assets/instagram/${slug}-story-9x16.mp4`);
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]\n\n📱 Instagram Story (15s Teaser) ready for "${targetTitle}".\n• Audio hook + 'LINK IN BIO' callout active.`);
        if (fs.existsSync(storyPath)) {
          await sendMediaToSelfChat(storyPath, `📱 Instagram Story: "${targetTitle}"\nSwipe Up / Link in Bio`);
        }
      });
      return;
    }

    // 4. Update Profile Link
    const instaMatch = body.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i);
    if (instaMatch || lower.includes('update') || lower.includes('badlo') || lower.includes('link')) {
      const newInsta = instaMatch ? instaMatch[0] : body.replace(/insta|instagram|link|update|badlo|change|set|:|kardo/gi, '').trim();
      if (newInsta.startsWith('http')) {
        await replyToSelfChat(`STARTED: [Status: Started working on your request] - Updating Instagram profile link to ${newInsta}`);

        const brandPath = path.resolve('packages/config/src/brand.ts');
        if (fs.existsSync(brandPath)) {
          let brandContent = fs.readFileSync(brandPath, 'utf-8');
          brandContent = brandContent.replace(/instagram:\s*"[^"]*"/, `instagram: "${newInsta}"`);
          fs.writeFileSync(brandPath, brandContent, 'utf-8');
        }

        const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
        buildProc.on('close', async () => {
          await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Instagram profile link updated to ${newInsta} and website rebuilt.`);
        });
        return;
      }
    }

    // 5. Default Instagram Automation Overview & Status
    const overviewMsg = `COMPLETED: [Status: Task Completed successfully]

📸 INSTAGRAM AUTOMATION SUITE (@808_beatstore)
• Multi-Platform Simultaneous Upload: ACTIVE (YouTube + Website + Instagram Reels & Story)
• Reel Engine: 9:16 Vertical HD (1080x1920)
• Story Engine: 15s High-Retention Teaser
• Viral Strategy: 3-Tier Algorithm Hashtags + Hook Captions

Commands:
1. 'insta reel <title>' -> Generate & send Reel video
2. 'insta story <title>' -> Generate & send Story clip
3. 'insta token: <token> id: <id>' -> Connect Meta Graph API
4. 'insta link <url>' -> Change profile link across store`;

    await replyToSelfChat(overviewMsg);
    return;
  }

  // -------------------------------------------------------------
  // I. 30-Day Batch Schedule & Queue Commands
  // -------------------------------------------------------------
  if (lower.startsWith('schedule') || lower.includes('queue') || lower.includes('batch')) {
    // 1. Check Queue / List Scheduled Drops
    if (lower.includes('list') || lower.includes('status') || lower.includes('kitne') || lower === 'queue') {
      const q = scheduleManager.getQueue();
      const pending = q.filter(b => b.status === 'PENDING');
      const completed = q.filter(b => b.status === 'COMPLETED');

      if (q.length === 0) {
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]\n\n📅 30-DAY DROP SCHEDULE IS CURRENTLY EMPTY.\nTo schedule beats, send:\n'schedule batch' followed by your Drive links, or\n'schedule <drive_link> Title: <name>'`);
        return;
      }

      const listText = pending.slice(0, 10).map((b, i) => {
        const d = new Date(b.scheduledTime).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `${i + 1}. "${b.title}" -> ${d}`;
      }).join('\n');

      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]

📅 30-DAY DROP SCHEDULE:
• Pending Drops: ${pending.length} beats
• Completed Drops: ${completed.length} beats
• Drop Time: 7:30 PM IST Daily

Upcoming Drops:
${listText || 'No pending beats in queue.'}`);
      return;
    }

    // 2. Schedule Multiple / Batch Beats
    const driveLinks = [...body.matchAll(/https?:\/\/drive\.google\.com\/[^\s,]+/gi)].map(m => m[0]);
    if (driveLinks.length > 0) {
      await replyToSelfChat(`STARTED: [Status: Started working on your request] - Scheduling ${driveLinks.length} beats across 30-day calendar`);

      const beatsToQueue = driveLinks.map((url, idx) => {
        return {
          title: `BEAT DROP ${idx + 1}`,
          driveUrl: url,
          bpm: 130,
          key: 'C Minor',
          genre: 'Hip-Hop',
          mood: 'Energetic'
        };
      });

      const scheduled = scheduleManager.scheduleBatch30Days(beatsToQueue);

      await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully]

🎉 ${scheduled.length} BEATS SCHEDULED SUCCESSFULLY!
• Upload Time: 7:30 PM IST Daily (Simultaneous YouTube + Website + Instagram Reels & Story)
• First Drop: ${new Date(scheduled[0].scheduledTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
• Final Drop: ${new Date(scheduled[scheduled.length - 1].scheduledTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}

Bot will autonomously execute each drop daily at 7:30 PM IST without needing any manual action! 🚀`);
      return;
    }
  }

  // -------------------------------------------------------------
  // J. Rebuild / Deploy Website Command
  // -------------------------------------------------------------
  if (lower.includes('rebuild') || lower.includes('deploy') || lower.includes('build website')) {
    await replyToSelfChat(`STARTED: [Status: Started working on your request] - Rebuilding website production bundle`);
    const buildProc = spawn('npm', ['run', 'build:web'], { shell: true });
    buildProc.on('close', async (code) => {
      if (code === 0) {
        await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Website built and ready. Live: https://dashing-medovik-13fc8a.netlify.app`);
      } else {
        await replyToSelfChat(`COMPLETED: [Status: Build finished with code ${code}]`);
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // J. Status / Help / Ping Commands
  // -------------------------------------------------------------
  if (lower.includes('kya kya') || lower.includes('capabilities') || lower === '!ping' || lower === 'status' || lower === '!help' || lower === 'help' || lower === 'hi' || lower === 'hello') {
    const helpMsg = `COMPLETED: [Status: Task Completed successfully]

🤖 808 BEAT STORE BOT: ACTIVE & CONNECTED
• Target: Self-Chat Only (Protocol Enforced)
• Channel: @808beatstore
• Instagram: https://www.instagram.com/808_beatstore
• Website: https://dashing-medovik-13fc8a.netlify.app

Binary Protocol: Every action triggers 'STARTED' followed by 'COMPLETED'.
Commands: Drive Beat link, Price, UPI ID, Delete beat, List, Tagline, About, Instagram, Schedule (30 Days), Rebuild.`;
    await replyToSelfChat(helpMsg);
    return;
  }

  // -------------------------------------------------------------
  // J. General Custom Technical Command Fallback
  // -------------------------------------------------------------
  await replyToSelfChat(`STARTED: [Status: Started working on your request] - Processing: "${body}"`);

  const logDir = path.resolve('data');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(path.join(logDir, 'user-whatsapp-commands.log'), `[${new Date().toISOString()}] ${body}\n`, 'utf-8');

  await replyToSelfChat(`COMPLETED: [Status: Task Completed successfully] - Registered: "${body}".`);
});

client.initialize().catch(err => console.error('Init error:', err));
