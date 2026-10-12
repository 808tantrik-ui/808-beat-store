import { create } from 'zustand';
import { BeatDTO, LicenseDTO } from '@shared/types';

export interface CartItem {
  beat: BeatDTO;
  license: LicenseDTO;
  price: number;
}

interface CartStoreState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (beat: BeatDTO, license: LicenseDTO) => void;
  removeItem: (beatId: string) => void;
  updateLicense: (beatId: string, newLicense: LicenseDTO) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

const STORAGE_KEY = 'beatstore_cart_v1';

function loadInitialItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: CartItem[] = JSON.parse(raw);
    return parsed.map((item) => {
      if (item.beat && item.beat.id === 'missing-you-beat') {
        return {
          ...item,
          beat: {
            ...item.beat,
            id: '41f7b65a-a2c6-42b3-8774-8d26f0be8394',
          },
        };
      }
      return item;
    });
  } catch {
    return [];
  }
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: loadInitialItems(),
  isCartOpen: false,

  addItem: (beat: BeatDTO, license: LicenseDTO) => {
    const items = get().items;
    const existingIndex = items.findIndex((i) => i.beat.id === beat.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      // Update license if already in cart
      updated = [...items];
      updated[existingIndex] = {
        beat,
        license,
        price: license.price,
      };
    } else {
      updated = [...items, { beat, license, price: license.price }];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    set({ items: updated, isCartOpen: true });
  },

  removeItem: (beatId: string) => {
    const updated = get().items.filter((i) => i.beat.id !== beatId);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ items: updated });
  },

  updateLicense: (beatId: string, newLicense: LicenseDTO) => {
    const updated = get().items.map((i) => {
      if (i.beat.id === beatId) {
        return {
          ...i,
          license: newLicense,
          price: newLicense.price,
        };
      }
      return i;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ items: updated });
  },

  clearCart: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ items: [] });
  },

  toggleCart: () => {
    set({ isCartOpen: !get().isCartOpen });
  },

  setIsCartOpen: (open: boolean) => {
    set({ isCartOpen: open });
  },

  getSubtotal: () => {
    return get().items.reduce((acc, item) => acc + item.price, 0);
  },

  getTotal: () => {
    return get().getSubtotal();
  },
}));
