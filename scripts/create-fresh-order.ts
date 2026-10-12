import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Razorpay from 'razorpay';

async function main() {
  const key_id = 'rzp_test_Tn81seEgSBq1x6';
  const key_secret = '5JaxSs55qC2plSutcAQueZgA';

  const rzp = new Razorpay({ key_id, key_secret });

  console.log('Creating live Razorpay order...');
  const order = await rzp.orders.create({
    amount: 10000, // Rs. 100 in paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: {
      purpose: 'Razorpay Dashboard Activation',
    },
  });

  console.log('✅ Created live order:', order.id);

  // Update public/pay.html and pay.html with this exact order_id!
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>808 Beat Store - Razorpay Test Payment</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      background-color: #07070b;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #11111a;
      border: 1px solid #252538;
      border-radius: 18px;
      padding: 36px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(0, 102, 255, 0.15);
      color: #3b82f6;
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 4px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 26px;
      margin: 0 0 10px 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    .order-box {
      background: #181826;
      border: 1px solid #2e2e46;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #94a3b8;
    }
    .order-val {
      color: #ffffff;
      font-weight: 700;
    }
    .amount-val {
      color: #10b981;
      font-size: 20px;
      font-weight: 800;
    }
    button {
      background: #0066FF;
      color: #ffffff;
      border: none;
      width: 100%;
      padding: 18px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 8px 24px rgba(0, 102, 255, 0.35);
    }
    button:hover {
      background: #0052cc;
      transform: translateY(-1px);
    }
    .info-box {
      margin-top: 24px;
      background: #151522;
      border: 1px dashed #3a3a55;
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .info-box code {
      background: #252538;
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
      font-family: monospace;
      font-size: 13px;
    }
    #status-msg {
      margin-top: 20px;
      padding: 14px;
      border-radius: 10px;
      display: none;
      font-size: 14px;
      line-height: 1.5;
    }
    .success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #10b981;
      display: block !important;
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="badge">Official Razorpay Order Linked</div>
    <h1>808 Beat Store</h1>
    <p>Test Order ID is attached. Click below to pay.</p>

    <div class="order-box">
      <div class="order-row">
        <span>Order ID:</span>
        <span class="order-val"><code>${order.id}</code></span>
      </div>
      <div class="order-row" style="margin-bottom: 0;">
        <span>Amount:</span>
        <span class="amount-val">₹100 (Test)</span>
      </div>
    </div>

    <button id="pay-button" onclick="startRazorpayPayment()">
      💳 PAY NOW WITH TEST CARD
    </button>

    <div id="status-msg"></div>

    <div class="info-box">
      <b>Test Credentials to enter in modal:</b><br>
      • <b>Card:</b> <code>4100 2800 0000 1007</code><br>
      • <b>Expiry:</b> <code>12/26</code> &nbsp;|&nbsp; <b>CVV:</b> <code>123</code><br>
      • <i>OTP screen aane par <b>Success</b> button dabayein!</i>
    </div>
  </div>

  <script>
    function startRazorpayPayment() {
      var btn = document.getElementById('pay-button');
      btn.innerText = 'Opening Modal...';
      btn.disabled = true;

      var options = {
        key: '${key_id}',
        amount: ${order.amount},
        currency: '${order.currency}',
        name: '808 Beat Store',
        description: 'Test Verification Order',
        order_id: '${order.id}',
        prefill: {
          name: '808 Beat Store Owner',
          email: 'test@razorpay.com',
          contact: '9999999999'
        },
        theme: {
          color: '#0066FF'
        },
        handler: function(response) {
          console.log('Payment success:', response);
          var status = document.getElementById('status-msg');
          status.className = 'success';
          status.innerHTML = '🎉 <b>TEST TRANSACTION SUCCESSFUL!</b><br>Payment ID: <code>' + response.razorpay_payment_id + '</code><br>Order ID: <code>' + response.razorpay_order_id + '</code><br><br>👉 <b>Ab Razorpay Dashboard wale tab par jayein aur "I have done the transaction" par click karein!</b>';
          btn.innerText = '✓ Payment Successful';
          btn.style.background = '#10b981';
          btn.disabled = false;
          alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id + '\\n\\nAb Razorpay Dashboard par "I have done the transaction" par click karein!');
        },
        modal: {
          ondismiss: function() {
            btn.innerText = '💳 PAY NOW WITH TEST CARD';
            btn.disabled = false;
          }
        }
      };

      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(resp) {
          alert('Payment Failed: ' + (resp.error ? resp.error.description : 'Unknown error'));
          btn.innerText = '💳 PAY NOW WITH TEST CARD';
          btn.disabled = false;
        });
        rzp.open();
      } catch (err) {
        alert('Could not open Razorpay modal: ' + err.message);
        btn.innerText = '💳 PAY NOW WITH TEST CARD';
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.resolve(process.cwd(), 'pay.html'), htmlContent, 'utf8');
  fs.writeFileSync(path.resolve(process.cwd(), 'public/pay.html'), htmlContent, 'utf8');
  console.log('Updated pay.html and public/pay.html with live order_id!');
}

main().catch(console.error);
