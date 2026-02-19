import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export type Barangay = {
  Name: string;
  PsgcCode: string;
};

type BarangaySelectionState = {
  SelectedBarangay: Barangay | null;
  SelectBarangay: (brgyName: string, psgcCode: string) => void;
  ClearSelection: () => void;
};

export const useBarangaySelectionStore = create<BarangaySelectionState>()(
  persist(
    (set) => ({
      SelectedBarangay: null,
      SelectBarangay: (Name, PsgcCode) =>
        set({ SelectedBarangay: { Name, PsgcCode } }),
      ClearSelection: () => set({ SelectedBarangay: null }),
    }),
    {
      name: "dengue-watch:barangay-selection",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage,
      ),
      version: 1,
    },
  ),
);
