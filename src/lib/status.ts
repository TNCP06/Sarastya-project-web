import type { TaskStatus } from "@/types/api";

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "Dikerjakan",
  done: "Selesai",
};

/** Warna untuk kontrol <select> status (border + bg + text + ring). */
export const STATUS_SELECT_STYLE: Record<TaskStatus, string> = {
  todo: "border-slate-300 bg-slate-50 text-slate-700 focus:ring-slate-300",
  in_progress: "border-amber-300 bg-amber-50 text-amber-800 focus:ring-amber-300",
  done: "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-300",
};
