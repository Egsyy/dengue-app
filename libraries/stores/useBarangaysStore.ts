import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { Localities } from "@/libraries/api/AdministrativeAreaAPI";
import type { AdministrativeArea } from "@/models/AdministrativeArea";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

type BarangaysState = {
  barangaysByMunicipality: Record<string, AdministrativeArea[]>;
  lastFetchedAtByMunicipality: Record<string, number>;

  isLoading: boolean;
  error: string | null;

  getBarangays: (municipalityPsgcCode: string) => AdministrativeArea[];
  fetchBarangays: (
    municipalityPsgcCode: string,
    options?: { force?: boolean; ttlMs?: number },
  ) => Promise<void>;
  clearBarangays: (municipalityPsgcCode?: string) => void;
};

export const useBarangaysStore = create<BarangaysState>()(
  persist(
    (set, get) => ({
      barangaysByMunicipality: {},
      lastFetchedAtByMunicipality: {},
      isLoading: false,
      error: null,

      getBarangays: (municipalityPsgcCode) => {
        return get().barangaysByMunicipality[municipalityPsgcCode] ?? [];
      },

      fetchBarangays: async (municipalityPsgcCode, options) => {
        const ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000; // 24h
        const force = options?.force ?? false;

        const existing = get().barangaysByMunicipality[municipalityPsgcCode];
        const lastFetchedAt =
          get().lastFetchedAtByMunicipality[municipalityPsgcCode] ?? 0;
        const isFresh =
          !!existing &&
          existing.length > 0 &&
          Date.now() - lastFetchedAt < ttlMs;

        if (!force && isFresh) return;

        set({ isLoading: true, error: null });
        try {
          const barangays =
            await Localities.getAllBarangaysByPsgccode(municipalityPsgcCode);
          set((state) => ({
            barangaysByMunicipality: {
              ...state.barangaysByMunicipality,
              [municipalityPsgcCode]: barangays,
            },
            lastFetchedAtByMunicipality: {
              ...state.lastFetchedAtByMunicipality,
              [municipalityPsgcCode]: Date.now(),
            },
            isLoading: false,
            error: null,
          }));
        } catch (e) {
          set({
            isLoading: false,
            error: e instanceof Error ? e.message : "Failed to fetch barangays",
          });
        }
      },

      clearBarangays: (municipalityPsgcCode) => {
        if (!municipalityPsgcCode) {
          set({ barangaysByMunicipality: {}, lastFetchedAtByMunicipality: {} });
          return;
        }

        set((state) => {
          const { [municipalityPsgcCode]: _, ...restBarangays } =
            state.barangaysByMunicipality;
          const { [municipalityPsgcCode]: __, ...restFetchedAt } =
            state.lastFetchedAtByMunicipality;
          return {
            barangaysByMunicipality: restBarangays,
            lastFetchedAtByMunicipality: restFetchedAt,
          };
        });
      },
    }),
    {
      name: "dengue-watch:barangays",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage,
      ),
      partialize: (state) => ({
        barangaysByMunicipality: state.barangaysByMunicipality,
        lastFetchedAtByMunicipality: state.lastFetchedAtByMunicipality,
      }),
    },
  ),
);
