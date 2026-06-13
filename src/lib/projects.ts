import { apiFetch } from "@/lib/api";
import type { Project, ProjectDetail, ProjectListItem } from "@/types/api";

interface ProjectInput {
  name: string;
  description: string | null;
}

export function listProjects(): Promise<ProjectListItem[]> {
  return apiFetch<ProjectListItem[]>("/api/projects");
}

export function getProject(id: number): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${id}`);
}

export function createProject(input: ProjectInput): Promise<Project> {
  return apiFetch<Project>("/api/projects", { method: "POST", body: input });
}

export function updateProject(id: number, input: ProjectInput): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`, { method: "PUT", body: input });
}

export function deleteProject(id: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}
