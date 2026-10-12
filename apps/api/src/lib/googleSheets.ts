/**
 * Google Sheets Auto-Sync Service
 * Syncs Beat Purchases, Custom Inquiries, and User Registrations directly to Google Sheets
 */

export interface GoogleSheetOrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  beatTitle: string;
  licenseName: string;
  amount: number;
  currency: string;
  paymentId?: string;
  createdAt?: string;
}

export interface GoogleSheetLeadData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  budget?: string;
  type?: 'CONTACT' | 'CUSTOM_BEAT_INQUIRY';
}

/**
 * Sends order data to Google Sheets via Webhook / Google Apps Script
 */
export async function syncOrderToGoogleSheets(data: GoogleSheetOrderData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[GOOGLE SHEETS NOTICE]: GOOGLE_SHEETS_WEBHOOK_URL not yet configured in .env. Skipping cloud sync.');
    return false;
  }

  try {
    const payload = {
      sheetType: 'ORDERS',
      timestamp: new Date().toISOString(),
      orderNumber: data.orderNumber,
      buyerName: data.customerName,
      buyerEmail: data.customerEmail,
      beatTitle: data.beatTitle,
      licenseType: data.licenseName,
      amount: `${data.currency} ${data.amount}`,
      transactionId: data.paymentId || 'N/A',
      status: 'PAID',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[GOOGLE SHEETS SYNC SUCCESS]: Order ${data.orderNumber} logged to Google Sheets.`);
      return true;
    } else {
      console.warn(`[GOOGLE SHEETS SYNC WARN]: Status ${response.status} returned from webhook.`);
      return false;
    }
  } catch (error: any) {
    console.warn('[GOOGLE SHEETS SYNC ERROR]:', error.message);
    return false;
  }
}

/**
 * Sends contact inquiry or lead data to Google Sheets
 */
export async function syncLeadToGoogleSheets(lead: GoogleSheetLeadData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const payload = {
      sheetType: 'LEADS',
      timestamp: new Date().toISOString(),
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      subject: lead.subject || 'General Inquiry',
      message: lead.message,
      budget: lead.budget || 'N/A',
      type: lead.type || 'CONTACT',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error: any) {
    console.warn('[GOOGLE SHEETS LEAD SYNC ERROR]:', error.message);
    return false;
  }
}

export interface GoogleSheetUserData {
  userId: string;
  name?: string;
  email: string;
  role: string;
  action: 'LOGIN' | 'SIGNUP' | 'GOOGLE_AUTH';
}

/**
 * Sends user login/signup event to Google Sheets
 */
export async function syncUserToGoogleSheets(user: GoogleSheetUserData): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const payload = {
      sheetType: 'USERS',
      timestamp: new Date().toISOString(),
      userId: user.userId,
      name: user.name || 'Artist / Producer',
      email: user.email,
      role: user.role,
      action: user.action,
      status: 'ACTIVE',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error: any) {
    console.warn('[GOOGLE SHEETS USER SYNC ERROR]:', error.message);
    return false;
  }
}

