export type BeatMood =
  | 'Emotional'
  | 'Sad'
  | 'Dark'
  | 'Happy'
  | 'Energetic'
  | 'Motivational'
  | 'Chill'
  | 'Cinematic'
  | 'Melodic'
  | 'Reflective';

export type HipHopStyle =
  | 'Boom Bap'
  | 'Lo-Fi Hip-Hop'
  | 'East Coast Hip-Hop'
  | 'West Coast Hip-Hop'
  | 'Melodic Hip-Hop'
  | 'Golden Age Hip-Hop'
  | 'Soul Hip-Hop'
  | 'Cinematic Hip-Hop'
  | 'Underground Hip-Hop';

export type LicenseTier =
  | 'NON_EXCLUSIVE'
  | 'EXCLUSIVE';

export interface BeatDTO {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  artwork: string;
  previewAudio: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  mood: BeatMood;
  style: HipHopStyle;
  genre: 'Hip-Hop';
  producerName?: string | null;
  producerDisplayName?: string | null;
  copyrightOwner?: string | null;
  publisher?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  playsCount: number;
  salesCount: number;
  availableLicenses?: LicenseDTO[];
  createdAt: string;
}

export interface LicenseDTO {
  id: string;
  name: LicenseTier;
  displayName: string;
  description: string;
  price: number;
  defaultPrice: number;
  isExclusive: boolean;
  includedFiles: string[]; // ["MP3", "WAV", "LICENSE_PDF"]
  commercialUsage: string;
  streamingLimit: number | null; // null means unlimited
  distributionLimit: number | null;
  musicVideoLimit: number | null;
  radioBroadcasting: boolean;
  forProfitPerformances: boolean;
  creditRequirement: string;
  features?: string[];
}

export interface CartItemDTO {
  beatId: string;
  licenseId: string;
  beat: BeatDTO;
  license: LicenseDTO;
  price: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItemDTO {
  id: string;
  beatId: string;
  licenseId: string;
  beatTitle: string;
  licenseName: string;
  price: number;
}

export interface DownloadAccessDTO {
  id: string;
  assetType: 'MP3' | 'WAV' | 'LICENSE_PDF' | 'RECEIPT';
  filename: string;
  downloadUrl: string;
  expiresAt: string;
  remainingDownloads: number;
  isAvailable: boolean;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  items: OrderItemDTO[];
  downloads?: DownloadAccessDTO[];
  paidAt?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
