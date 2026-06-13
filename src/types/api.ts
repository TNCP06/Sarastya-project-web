// Bentuk data mengikuti kontrak (kontrak-api-projektask.md) dan sudah
// diverifikasi terhadap backend live.

export type TaskStatus = "todo" | "in_progress" | "done";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** Item pada GET /api/projects (list) — memuat agregat jumlah task. */
export interface ProjectListItem {
  id: number;
  name: string;
  description: string | null;
  taskCount: number;
  doneTaskCount: number;
  createdAt: string;
}

/** Objek project polos (response POST/PUT /api/projects). */
export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null; // format YYYY-MM-DD
  createdAt: string;
}

/** GET /api/projects/{id} — detail beserta tasks. */
export interface ProjectDetail extends Project {
  tasks: Task[];
}

/**
 * Body error. Backend live memakai DUA bentuk:
 *  - Global handler (401/404/409/500): { message }
 *  - Validasi 400 (ProblemDetails ASP.NET): { title, status, errors (key PascalCase) }
 */
export interface ApiErrorBody {
  message?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
