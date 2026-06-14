"use client";

// Sistem notifikasi (toast) global untuk feedback aksi: sukses, error, info.
// Dipasang sekali di root layout; dipakai lewat hook useToast() di mana saja.
// Toast hilang otomatis setelah DURATION, atau bisa ditutup manual.

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastApi {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  return ctx;
}

const variantStyle: Record<ToastVariant, string> = {
  success: "border-green-200 text-green-800",
  error: "border-red-200 text-red-800",
  info: "border-slate-200 text-slate-800",
};

const iconWrap: Record<ToastVariant, string> = {
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  info: "bg-slate-100 text-slate-700",
};

const iconChar: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "i",
};

const DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, variant, message }]);
      window.setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const success = useCallback((m: string) => show(m, "success"), [show]);
  const error = useCallback((m: string) => show(m, "error"), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-sm shadow-lg ${variantStyle[t.variant]}`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${iconWrap[t.variant]}`}
              aria-hidden
            >
              {iconChar[t.variant]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
              className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
