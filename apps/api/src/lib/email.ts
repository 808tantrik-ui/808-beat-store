import { prisma } from './prisma.js';
import { producerBrand, brandHelpers, isPlaceholder } from '../../../../packages/config/src/brand.js';

export interface EmailPayload {
  to: string;
  type: string;
  orderId?: string;
  subject: string;
  contentHtml: string;
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const producerName = brandHelpers.getProducerName(producerBrand);
  const contactEmail = brandHelpers.getContactEmail(producerBrand) || 'orders@beatstore.local';
  const websiteUrl = brandHelpers.getWebsiteUrl(producerBrand);

  // If no production Resend key is configured or is placeholder, log safely and simulate delivery
  if (!apiKey || isPlaceholder(apiKey) || apiKey.startsWith('re_placeholder') || apiKey === '') {
    console.log(`[EMAIL DISPATCH - DEV SIMULATION] To: ${payload.to} | Subject: ${payload.subject} | Type: ${payload.type}`);
    
    // Save to EmailLog database table for audit trail
    await prisma.emailLog.create({
      data: {
        type: payload.type,
        recipient: payload.to,
        orderId: payload.orderId || null,
        status: 'SENT',
        providerMessageId: `sim_${Date.now()}`,
      },
    });

    return {
      success: true,
      messageId: `sim_${Date.now()}`,
    };
  }

  // Live Resend API call
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${producerName} <orders@${producerBrand.website.domain || 'resend.dev'}>`,
        to: [payload.to],
        reply_to: contactEmail,
        subject: payload.subject,
        html: payload.contentHtml,
      }),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      throw new Error(data?.message || 'Resend API error');
    }

    await prisma.emailLog.create({
      data: {
        type: payload.type,
        recipient: payload.to,
        orderId: payload.orderId || null,
        status: 'SENT',
        providerMessageId: data.id,
      },
    });

    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('[EMAIL ERROR]:', err);
    await prisma.emailLog.create({
      data: {
        type: payload.type,
        recipient: payload.to,
        orderId: payload.orderId || null,
        status: 'FAILED',
        error: err.message,
      },
    });
    return { success: false, error: err.message };
  }
}

/**
 * Admin Alert Placeholder: Triggered when a new user registers on 808 Beat Store.
 */
export async function sendAdminAlertNewUser(user: { email: string; name?: string; id: string }) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || producerBrand.contact.email || 'admin@808beatstore.com';
  console.log(`[ADMIN ALERT - NEW USER] Email: ${user.email} | Name: ${user.name || 'Anonymous'}`);
  return sendTransactionalEmail({
    to: adminEmail,
    type: 'ADMIN_ALERT_NEW_USER',
    subject: `[808 Beat Store] New Artist Registered: ${user.name || user.email}`,
    contentHtml: `
      <h2>New Artist Sign-Up</h2>
      <p>A new customer has registered on 808 Beat Store:</p>
      <ul>
        <li><strong>Name:</strong> ${user.name || 'Not provided'}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>User ID:</strong> ${user.id}</li>
        <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
      </ul>
    `,
  });
}

/**
 * Admin Alert Placeholder: Triggered when a direct contact/licensing inquiry is sent.
 */
export async function sendAdminAlertContactInquiry(inquiry: { name: string; email: string; subject: string; message: string }) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || producerBrand.contact.email || 'admin@808beatstore.com';
  console.log(`[ADMIN ALERT - CONTACT INQUIRY] From: ${inquiry.name} (${inquiry.email}) | Subject: ${inquiry.subject}`);
  return sendTransactionalEmail({
    to: adminEmail,
    type: 'ADMIN_ALERT_CONTACT_INQUIRY',
    subject: `[808 Beat Store Inquiry] ${inquiry.subject}`,
    contentHtml: `
      <h2>New Studio Inquiry Received</h2>
      <p><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
      <p><strong>Subject:</strong> ${inquiry.subject}</p>
      <hr />
      <p style="white-space: pre-wrap;">${inquiry.message}</p>
    `,
  });
}

/**
 * Admin Alert: Triggered when a user logs in to the platform.
 */
export async function sendAdminAlertUserLogin(user: { email: string; name?: string; id?: string; role?: string }) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || producerBrand.contact.email || 'admin@808beatstore.com';
  console.log(`[ADMIN ALERT - USER LOGIN] Email: ${user.email} | Role: ${user.role || 'CUSTOMER'}`);
  return sendTransactionalEmail({
    to: adminEmail,
    type: 'ADMIN_ALERT_USER_LOGIN',
    subject: `[808 Beat Store Alert] User Login: ${user.email} (${user.role || 'CUSTOMER'})`,
    contentHtml: `
      <h2>User Login Notification</h2>
      <p>A user has signed into 808 Beat Store:</p>
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Name:</strong> ${user.name || 'Anonymous / Customer'}</li>
        <li><strong>Account Role:</strong> ${user.role || 'CUSTOMER'}</li>
        <li><strong>Login Timestamp:</strong> ${new Date().toISOString()}</li>
      </ul>
    `,
  });
}

/**
 * Admin Alert: Triggered when a customer successfully completes a purchase.
 */
export async function sendAdminAlertPurchase(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  itemsCount: number;
}) {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || producerBrand.contact.email || 'admin@808beatstore.com';
  console.log(`[ADMIN ALERT - SUCCESSFUL PURCHASE] Order: ${order.orderNumber} | Customer: ${order.customerName} | Total: ₹${order.total}`);
  return sendTransactionalEmail({
    to: adminEmail,
    type: 'ADMIN_ALERT_PURCHASE',
    orderId: order.id,
    subject: `[808 Beat Store] New Sale: ${order.orderNumber} (₹${order.total})`,
    contentHtml: `
      <h2>Commercial License Sale Notification</h2>
      <p>An order has been completed and verified:</p>
      <ul>
        <li><strong>Order Number:</strong> ${order.orderNumber}</li>
        <li><strong>Customer Name:</strong> ${order.customerName}</li>
        <li><strong>Customer Email:</strong> ${order.customerEmail}</li>
        <li><strong>Total Paid:</strong> ₹${order.total.toLocaleString()} ${order.currency}</li>
        <li><strong>Items Licensed:</strong> ${order.itemsCount}</li>
        <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
      </ul>
    `,
  });
}



