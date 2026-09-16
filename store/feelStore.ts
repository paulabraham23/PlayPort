import { create } from 'zustand';

type FeelState = {
  toast: string | null;
  toastKey: number;
  flashAdd: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

/** Ephemeral UI feel signals (toasts, add flashes) — not backend state. */
export const useFeelStore = create<FeelState>((set) => ({
  toast: null,
  toastKey: 0,
  flashAdd: () => {
    // reserved for global pulse hooks
  },
  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set((s) => ({ toast: message, toastKey: s.toastKey + 1 }));
    toastTimer = setTimeout(() => set({ toast: null }), 1600);
  },
  clearToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: null });
  },
}));
