import { create } from 'zustand';
import type { ReverseGeocodedAddress } from '@/lib/places';

export interface LocationDraft {
  lat: number;
  lng: number;
  address?: ReverseGeocodedAddress | null;
}

interface LocationDraftState {
  draft: LocationDraft | null;
  setDraft: (draft: LocationDraft) => void;
  clearDraft: () => void;
}

/**
 * One-shot handoff from the map pin screen (/address/locate) back to the
 * address form. The form consumes (and clears) it on focus.
 */
export const useLocationDraftStore = create<LocationDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
