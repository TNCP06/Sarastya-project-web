import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      {children}
    </div>
  );
}

export function LoadingState({ label = "Memuat..." }: { label?: string }) {
  return (
    <Centered>
      <Spinner className="h-6 w-6 text-slate-400" />
      <p className="text-sm text-slate-500">{label}</p>
    </Centered>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Centered>
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Coba lagi
        </button>
      )}
    </Centered>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Centered>
      <div>
        <p className="font-medium text-slate-700">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </Centered>
  );
}
