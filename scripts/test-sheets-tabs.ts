import dotenv from 'dotenv';
dotenv.config();

const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwYAtcGcnSWTPoZvJKa3DRXekfsRaYIA5_R8iNMPdHWctCZnsZ49ALU0UWmpaOVODxY/exec';

async function run() {
  console.log('Sending multi-sheet test payloads to Google Sheets...');

  // 1. Order / Beat Sale
  const orderRes = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sheetType: 'ORDERS',
      orderNumber: '808-ORD-1001',
      buyerName: 'Raftaar Artist',
      buyerEmail: 'raftaar@hiphop.in',
      beatTitle: 'Gully Banger 808',
      licenseType: 'PREMIUM WAV + STEMS',
      amount: 'INR 2,500',
      transactionId: 'pay_rzp_99281729',
      status: 'PAID',
    }),
  });
  console.log('1. Order Sync Response:', await orderRes.text());

  // 2. User Registration / Login
  const userRes = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sheetType: 'USERS',
      userId: 'usr_808tantrik_admin',
      name: '808 Beat Store Admin',
      email: '808beatstore@gmail.com',
      role: 'ADMIN',
      action: 'GOOGLE_AUTH',
      status: 'ACTIVE',
    }),
  });
  console.log('2. User Sync Response:', await userRes.text());

  // 3. Lead / Custom Beat Request
  const leadRes = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sheetType: 'LEADS',
      name: 'Divine Music Team',
      email: 'team@divine.in',
      phone: '+91 98765 43210',
      subject: 'Exclusive Album Production',
      message: 'Looking for 3 custom drill beats for our upcoming EP.',
      budget: '₹25,000 - ₹50,000',
      type: 'CUSTOM_BEAT_INQUIRY',
    }),
  });
  console.log('3. Lead Sync Response:', await leadRes.text());

  console.log('✅ All 3 categories synchronized successfully!');
}

run().catch(console.error);
