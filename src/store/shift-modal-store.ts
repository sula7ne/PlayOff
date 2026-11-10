import { create } from "zustand";

type ShiftModalState = {
  isOpen: boolean;
  onResolve: (() => void) | null;
  open: (onResolve: () => void) => void;
  close: () => void;
};

export const useShiftModalStore = create<ShiftModalState>()((set) => ({
  isOpen: false,
  onResolve: null,
  open: (onResolve) => set({ isOpen: true, onResolve }),
  close: () => set({ isOpen: false, onResolve: null }),
}));

export function openShiftRequired(onResolve: () => void) {
  useShiftModalStore.getState().open(onResolve);
}
