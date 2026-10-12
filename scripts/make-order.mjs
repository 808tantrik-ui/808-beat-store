import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';

const rzp = new Razorpay({
  key_id: 'rzp_test_Tn81seEgSBq1x6',
  key_secret: '5JaxSs55qC2plSutcAQueZgA',
});

async function run() {
  const order = await rzp.orders.create({
    amount: 10000,
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
  });
  console.log('NEW_ORDER_ID=' + order.id);

  const file = path.resolve(process.cwd(), 'public/pay.html');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/order_id:\s*'[^']*'|order_id:\s*"[^"]*"/g, `order_id: '${order.id}'`);
  if (!content.includes('order_id:')) {
    content = content.replace(/key:\s*'rzp_test_Tn81seEgSBq1x6',/, `key: 'rzp_test_Tn81seEgSBq1x6',\n        order_id: '${order.id}',`);
  }
  fs.writeFileSync(file, content, 'utf8');
  fs.writeFileSync(path.resolve(process.cwd(), 'pay.html'), content, 'utf8');
  console.log('SUCCESSFULLY_INJECTED=' + order.id);
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
