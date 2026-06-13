import type { ReactNode } from "react";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-3 py-2 text-sm ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
