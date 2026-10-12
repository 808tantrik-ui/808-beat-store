import Razorpay from 'razorpay';

const rzp = new Razorpay({
  key_id: 'rzp_live_Tn9FcsLbIqMLso',
  key_secret: 'w1eKfL3YUS30bSnjBc0NkOF6',
});

async function test() {
  try {
    const order = await rzp.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: 'test_' + Date.now(),
    });
    console.log('SUCCESS_LIVE_ORDER:', order.id);
  } catch (err: any) {
    console.error('ERROR:', err);
  }
}

test();
