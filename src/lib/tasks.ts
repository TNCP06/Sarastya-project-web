import { apiFetch } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/api";

export interface TaskInput {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null; // "YYYY-MM-DD"
}

export function createTask(projectId: number, input: TaskInput): Promise<Task> {
  return apiFetch<Task>(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: input,
  });
}

// PUT adalah full update (kontrak) — dipakai untuk edit task maupun ganti
// status (klien kirim field lengkap).
export function updateTask(id: number, input: TaskInput): Promise<Task> {
  return apiFetch<Task>(`/api/tasks/${id}`, { method: "PUT", body: input });
}

export function deleteTask(id: number): Promise<void> {
  return apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
