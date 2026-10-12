import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const checkoutItemSchema = z.object({
  beatId: z.string().min(1, 'Beat ID is required'),
  licenseId: z.string().min(1, 'License is required'),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().email('Please enter a valid email address'),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const razorpayVerifySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

export type RazorpayVerifyInput = z.infer<typeof razorpayVerifySchema>;

export const beatFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  bpm: z.coerce.number().int().min(50).max(200),
  key: z.string().min(1, 'Key is required').max(10),
  duration: z.coerce.number().int().min(10).max(600),
  mood: z.enum([
    'Emotional',
    'Sad',
    'Dark',
    'Happy',
    'Energetic',
    'Motivational',
    'Chill',
    'Cinematic',
    'Melodic',
    'Reflective',
  ]),
  style: z.enum([
    'Boom Bap',
    'Lo-Fi Hip-Hop',
    'East Coast Hip-Hop',
    'West Coast Hip-Hop',
    'Melodic Hip-Hop',
    'Golden Age Hip-Hop',
    'Soul Hip-Hop',
    'Cinematic Hip-Hop',
    'Underground Hip-Hop',
  ]),
  description: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  pricing: z.object({
    nonExclusiveMp3: z.coerce.number().positive(),
    nonExclusiveWav: z.coerce.number().positive(),
    premiumStems: z.coerce.number().positive(),
    exclusive: z.coerce.number().positive(),
  }),
});

export type BeatFormData = z.infer<typeof beatFormSchema>;
