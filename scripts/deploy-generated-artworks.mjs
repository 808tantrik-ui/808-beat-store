import fs from 'fs';
import path from 'path';

const brainDir = 'C:/Users/808ta/.gemini/antigravity-ide/brain/96c04796-407e-41da-9eef-6b699ad987e8';
const artDir = path.resolve('public/assets/artwork');
const distDir = path.resolve('dist/web/assets/artwork');

if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const mappings = [
  { slug: 'blackout', file: 'blackout_cinematic_thumb_1791729951279.jpg' },
  { slug: 'break-the-wall', file: 'break_the_wall_thumb_1791730126778.jpg' },
  { slug: 'broken-frame-31', file: 'broken_frame_thumb_1791730151888.jpg' },
  { slug: 'broken-frame-31-1', file: 'broken_frame_sad_1791730173894.jpg' },
  { slug: 'cold-goodbye', file: 'cold_goodbye_thumb_1791730196589.jpg' },
  { slug: 'dead-silence', file: 'dead_silence_thumb_1791730219575.jpg' },
  { slug: 'empty-room', file: 'empty_room_thumb_1791730243589.jpg' },
  { slug: 'fading-lights', file: 'fading_lights_thumb_1791730265203.jpg' },
  { slug: 'fault-line', file: 'fault_line_thumb_1791730291245.jpg' },
  { slug: 'fury-road', file: 'fury_road_thumb_1791730315398.jpg' },
  { slug: 'greed-glory', file: 'greed_glory_thumb_1791730353117.jpg' },
  { slug: 'gully-freestyle', file: 'gully_freestyle_thumb_1791730378644.jpg' },
  { slug: 'iron-gate', file: 'iron_gate_thumb_1791730412587.jpg' }
];

mappings.forEach(m => {
  const src = path.join(brainDir, m.file);
  const dest1 = path.join(artDir, `${m.slug}.jpg`);
  const dest2 = path.join(distDir, `${m.slug}.jpg`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest1);
    fs.copyFileSync(src, dest2);
    console.log(`✅ Deployed cinematic artwork for: ${m.slug}.jpg`);
  }
});

console.log('Finished deploying 13 cinematic artworks!');
