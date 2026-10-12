import { scheduleManager } from './schedule-manager';

console.log('🛡️ 808 Beat Store Fail-Safe Scheduler Daemon Started');
console.log('⏰ Monitoring 20-Beat Queue 24/7 for Scheduled Drops (Daily 7:30 PM IST)...');

// Immediate check on startup
scheduleManager.processDueBeats(async (msg) => {
  console.log(`[DAEMON NOTIFY]: ${msg}`);
}).catch(err => console.error('Startup check error:', err));

// Recurring loop every 30 seconds
setInterval(async () => {
  try {
    await scheduleManager.processDueBeats(async (msg) => {
      console.log(`[DAEMON NOTIFY]: ${msg}`);
    });
  } catch (err: any) {
    console.error('Daemon check cycle error:', err.message);
  }
}, 30000);
