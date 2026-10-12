import 'dotenv/config';
import crypto from 'crypto';
import { app } from '../apps/api/src/server.js';
import http from 'http';

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}`;
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`, err);
    }
  }

  // TEST 1: Reject amount < 100 paise
  await test('create-order rejects amount < 100 paise with 400', async () => {
    const res = await fetch(`${baseUrl}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 50, currency: 'INR' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Expected success=false');
  });

  // TEST 2: Create live order with Razorpay
  let liveOrderId = '';
  await test('create-order creates live order with amount >= 100 paise', async () => {
    const res = await fetch(`${baseUrl}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 199900, currency: 'INR', receipt: 'test_rcpt_001' }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.order_id || !data.order_id.startsWith('order_')) {
      throw new Error(`Invalid order_id: ${JSON.stringify(data)}`);
    }
    if (data.amount !== 199900) throw new Error(`Expected amount 199900, got ${data.amount}`);
    liveOrderId = data.order_id;
    console.log(`   Generated live order_id: ${liveOrderId}`);
  });

  // TEST 3: Verify payment rejects missing fields
  await test('verify-payment rejects missing fields with 400', async () => {
    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: 'order_123' }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // TEST 4: Verify payment rejects invalid HMAC signature
  await test('verify-payment rejects fraudulent signature with 400', async () => {
    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: liveOrderId,
        payment_id: 'pay_test_123456',
        signature: 'invalid_fraudulent_signature_hex_1234567890abcdef',
      }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // TEST 5: Verify payment accepts cryptographically correct HMAC-SHA256 signature
  await test('verify-payment accepts valid HMAC-SHA256 signature with 200', async () => {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const paymentId = 'pay_test_valid_999';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${liveOrderId}|${paymentId}`)
      .digest('hex');

    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: liveOrderId,
        payment_id: paymentId,
        signature: validSignature,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.success !== true) throw new Error('Expected success=true');
  });

  server.close();
  console.log(`\nResults: ${passed}/${total} tests passed!`);
  if (passed !== total) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
