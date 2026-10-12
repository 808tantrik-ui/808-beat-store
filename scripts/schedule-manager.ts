import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface ScheduledBeat {
  id: string;
  title: string;
  driveUrl: string;
  bpm: number;
  key: string;
  genre: string;
  mood: string;
  scheduledTime: string; // ISO string e.g. 2026-10-09T14:00:00.000Z (7:30 PM IST)
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  completedAt?: string;
  youtubeUrl?: string;
  storeUrl?: string;
  instagramReelUrl?: string;
  error?: string;
}

const QUEUE_FILE = path.resolve('data/scheduled-beats.json');

function ensureQueueFile(): ScheduledBeat[] {
  const dir = path.dirname(QUEUE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(QUEUE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveQueue(queue: ScheduledBeat[]) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
}

export const scheduleManager = {
  getQueue: (): ScheduledBeat[] => {
    return ensureQueueFile();
  },

  addBeat: (beat: Omit<ScheduledBeat, 'id' | 'status'>): ScheduledBeat => {
    const queue = ensureQueueFile();
    const newEntry: ScheduledBeat = {
      ...beat,
      id: `beat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'PENDING'
    };
    queue.push(newEntry);
    saveQueue(queue);
    return newEntry;
  },

  /**
   * Schedules a batch of up to 30 beats spaced 1 day apart at 7:30 PM IST (14:00 UTC)
   */
  scheduleBatch30Days: (beats: Array<{ title: string; driveUrl: string; bpm?: number; key?: string; genre?: string; mood?: string }>, startDate?: Date): ScheduledBeat[] => {
    const queue = ensureQueueFile();
    const start = startDate ? new Date(startDate) : new Date();
    
    // Set first drop to 7:30 PM IST (14:00 UTC) today or tomorrow
    start.setUTCHours(14, 0, 0, 0);
    if (start.getTime() < Date.now()) {
      start.setUTCDate(start.getUTCDate() + 1);
    }

    const created: ScheduledBeat[] = [];

    beats.forEach((b, index) => {
      const dropTime = new Date(start);
      dropTime.setUTCDate(start.getUTCDate() + index);

      const entry: ScheduledBeat = {
        id: `drop_day_${index + 1}_${Date.now()}`,
        title: b.title || `UNTITLED BEAT ${index + 1}`,
        driveUrl: b.driveUrl,
        bpm: b.bpm || 130,
        key: b.key || 'C Minor',
        genre: b.genre || 'Hip-Hop',
        mood: b.mood || 'Dark, Energetic',
        scheduledTime: dropTime.toISOString(),
        status: 'PENDING'
      };

      queue.push(entry);
      created.push(entry);
    });

    saveQueue(queue);
    return created;
  },

  /**
   * Checks the queue and executes any beat whose scheduled time has arrived
   */
  processDueBeats: async (onNotify?: (msg: string) => Promise<void>) => {
    const queue = ensureQueueFile();
    const now = new Date().getTime();

    const dueBeats = queue.filter(b => (b.status === 'PENDING' || b.status === 'Scheduled' || b.status === 'SCHEDULED') && new Date(b.scheduledTime).getTime() <= now);
    if (dueBeats.length === 0) return;

    for (const beat of dueBeats) {
      beat.status = 'PROCESSING';
      saveQueue(queue);

      if (onNotify) {
        await onNotify(`STARTED: [Daily 7:30 PM Drop] - Publishing "${beat.title}" across YouTube, Website & Instagram!`);
      }

      console.log(`🚀 Executing Scheduled Drop for "${beat.title}" (${beat.scheduledTime})...`);

      const proc = spawn('npx', [
        'tsx',
        'scripts/whatsapp-pipeline.ts',
        '--drive', beat.driveUrl,
        '--title', beat.title,
        '--bpm', String(beat.bpm),
        '--key', beat.key,
        '--genre', beat.genre,
        '--mood', beat.mood
      ], { shell: true });

      let stdout = '';
      proc.stdout.on('data', d => { stdout += d.toString(); });
      proc.stderr.on('data', d => process.stderr.write(d));

      await new Promise<void>((resolve) => {
        proc.on('close', async (code) => {
          if (code === 0) {
            beat.status = 'COMPLETED';
            beat.completedAt = new Date().toISOString();
            const ytMatch = stdout.match(/https:\/\/youtu\.be\/[a-zA-Z0-9_-]+/);
            beat.youtubeUrl = ytMatch ? ytMatch[0] : 'https://youtube.com/@808beatstore';
            const slug = beat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            beat.storeUrl = `https://dashing-medovik-13fc8a.netlify.app/#/beats/${slug}`;
            saveQueue(queue);

            if (onNotify) {
              const msg = `COMPLETED: [Status: Scheduled Daily Drop Published Successfully! 🎯]

🎵 "${beat.title}" (${beat.bpm} BPM • ${beat.key})
• YouTube: ${beat.youtubeUrl}
• Beat Store: ${beat.storeUrl}
• Instagram Reel & Story: Live on @808_beatstore

🔥 Day's drop synchronized automatically!`;
              await onNotify(msg);
            }
          } else {
            beat.status = 'FAILED';
            beat.error = `Process exited with code ${code}`;
            saveQueue(queue);
            if (onNotify) {
              await onNotify(`COMPLETED: [Status: Scheduled Drop Failed for "${beat.title}" - Code ${code}]`);
            }
          }
          resolve();
        });
      });
    }
  }
};
