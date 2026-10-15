import { create } from 'zustand';
import { BeatDTO } from '@shared/types';

export type AuthModalReason = 'initial' | 'checkout' | 'download' | 'buy_now' | 'manual' | 'admin';

interface ModalState {
  activeLicenseBeat: BeatDTO | null;
  openLicenseModal: (beat: BeatDTO) => void;
  closeLicenseModal: () => void;

  // Auth Modal State
  isAuthModalOpen: boolean;
  authModalReason: AuthModalReason | null;
  openAuthModal: (reason?: AuthModalReason) => void;
  closeAuthModal: () => void;

  // Full-Screen Beat Player Modal State
  isFullScreenPlayerOpen: boolean;
  openFullScreenPlayer: () => void;
  closeFullScreenPlayer: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  activeLicenseBeat: null,
  openLicenseModal: (beat) => set({ activeLicenseBeat: beat }),
  closeLicenseModal: () => set({ activeLicenseBeat: null }),

  isAuthModalOpen: false,
  authModalReason: null,
  openAuthModal: (reason = 'manual') =>
    set({ isAuthModalOpen: true, authModalReason: reason }),
  closeAuthModal: () =>
    set({ isAuthModalOpen: false, authModalReason: null }),

  isFullScreenPlayerOpen: false,
  openFullScreenPlayer: () => set({ isFullScreenPlayerOpen: true }),
  closeFullScreenPlayer: () => set({ isFullScreenPlayerOpen: false }),
}));
