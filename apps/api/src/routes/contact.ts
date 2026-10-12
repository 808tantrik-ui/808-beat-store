import { Router, Request, Response } from 'express';
import { sendAdminAlertContactInquiry } from '../lib/email.js';
import { syncLeadToGoogleSheets } from '../lib/googleSheets.js';

export const contactRouter = Router();

// POST /api/contact - Receive inquiry and dispatch admin alert
contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, email, and message are required.',
        },
      });
    }

    // Trigger admin alert placeholder
    await sendAdminAlertContactInquiry({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
    });

    // Auto-sync lead to Google Sheets
    syncLeadToGoogleSheets({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      type: 'CONTACT',
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been dispatched to 808 Beat Store studio management.',
    });
  } catch (error: any) {
    console.error('Contact inquiry error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTACT_ERROR',
        message: error.message || 'Failed to dispatch contact inquiry.',
      },
    });
  }
});
