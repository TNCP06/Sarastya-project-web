import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  /** True setelah state di-rehydrate dari localStorage di klien. */
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

// Storage aman-SSR: tidak pernah menyentuh localStorage di server.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "projektask-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      // Hanya simpan kredensial, bukan flag transien.
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Rehydrate manual di klien (lihat AuthProvider) untuk menghindari
      // hydration mismatch SSR; hasHydrated dipakai sebagai gerbang route guard.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);
