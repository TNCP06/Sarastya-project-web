"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProject, deleteProject } from "@/lib/projects";
import { updateTask, deleteTask } from "@/lib/tasks";
import { ApiError } from "@/lib/api";
import type { ProjectDetail, Task, TaskStatus } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tambah / edit task
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Hapus task
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);
  const [taskDeleteError, setTaskDeleteError] = useState<string | null>(null);

  // Ganti status (per task)
  const [statusMutatingId, setStatusMutatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit / hapus project
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectDeleteOpen, setProjectDeleteOpen] = useState(false);
  const [projectDeleteLoading, setProjectDeleteLoading] = useState(false);
  const [projectDeleteError, setProjectDeleteError] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat project.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (Number.isNaN(projectId)) {
      setError("Project tidak ditemukan.");
      setLoading(false);
      return;
    }
    load();
  }, [projectId, load]);

  async function changeStatus(task: Task, status: TaskStatus) {
    if (status === task.status) return;
    setStatusMutatingId(task.id);
    setActionError(null);
    try {
      // PUT full body (kontrak): kirim field lengkap + status baru.
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status,
        dueDate: task.dueDate,
      });
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Gagal mengubah status task.",
      );
    } finally {
      setStatusMutatingId(null);
    }
  }

  function openCreateTask() {
    setEditingTask(null);
    setTaskFormOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskFormOpen(true);
  }

  function handleTaskSaved() {
    setTaskFormOpen(false);
    setEditingTask(null);
    load();
  }

  async function handleConfirmTaskDelete() {
    if (!deletingTask) return;
    setTaskDeleteLoading(true);
    setTaskDeleteError(null);
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      load();
    } catch (err) {
      setTaskDeleteError(
        err instanceof ApiError ? err.message : "Gagal menghapus task.",
      );
    } finally {
      setTaskDeleteLoading(false);
    }
  }

  async function handleConfirmProjectDelete() {
    setProjectDeleteLoading(true);
    setProjectDeleteError(null);
    try {
      await deleteProject(projectId);
      router.push("/projects");
    } catch (err) {
      setProjectDeleteError(
        err instanceof ApiError ? err.message : "Gagal menghapus project.",
      );
      setProjectDeleteLoading(false);
    }
  }

  const tasks = project?.tasks ?? [];
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <Link href="/projects" className="text-sm text-slate-500 hover:underline">
        ← Kembali ke daftar project
      </Link>

      {loading ? (
        <div className="mt-6">
          <LoadingState label="Memuat detail project..." />
        </div>
      ) : error || !project ? (
        <div className="mt-6">
          <ErrorState
            message={error ?? "Project tidak ditemukan."}
            onRetry={
              Number.isNaN(projectId)
                ? undefined
                : () => {
                    setLoading(true);
                    load();
                  }
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-slate-900">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 text-slate-600">{project.description}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setProjectFormOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  setProjectDeleteError(null);
                  setProjectDeleteOpen(true);
                }}
              >
                Hapus
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Task{" "}
                {tasks.length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    ({doneCount}/{tasks.length} selesai)
                  </span>
                )}
              </h2>
              <Button onClick={openCreateTask}>+ Tambah Task</Button>
            </div>

            {actionError && (
              <div className="mt-3">
                <Alert variant="error">{actionError}</Alert>
              </div>
            )}

            <div className="mt-4">
              {tasks.length === 0 ? (
                <EmptyState
                  title="Belum ada task"
                  description="Tambahkan task pertama untuk project ini."
                  action={
                    <Button onClick={openCreateTask}>+ Tambah Task</Button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      statusLoading={statusMutatingId === task.id}
                      onStatusChange={(status) => changeStatus(task, status)}
                      onEdit={() => openEditTask(task)}
                      onDelete={() => {
                        setTaskDeleteError(null);
                        setDeletingTask(task);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <TaskFormModal
        open={taskFormOpen}
        projectId={projectId}
        initial={editingTask}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSaved={handleTaskSaved}
      />

      <ProjectFormModal
        open={projectFormOpen}
        initial={project}
        onClose={() => setProjectFormOpen(false)}
        onSaved={() => {
          setProjectFormOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={deletingTask !== null}
        title="Hapus task?"
        message={
          deletingTask ? `Task "${deletingTask.title}" akan dihapus permanen.` : ""
        }
        confirmLabel="Hapus"
        loading={taskDeleteLoading}
        error={taskDeleteError ?? undefined}
        onConfirm={handleConfirmTaskDelete}
        onClose={() => {
          if (!taskDeleteLoading) setDeletingTask(null);
        }}
      />

      <ConfirmDialog
        open={projectDeleteOpen}
        title="Hapus project?"
        message={
          project
            ? `Project "${project.name}" beserta semua task di dalamnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Hapus"
        loading={projectDeleteLoading}
        error={projectDeleteError ?? undefined}
        onConfirm={handleConfirmProjectDelete}
        onClose={() => {
          if (!projectDeleteLoading) setProjectDeleteOpen(false);
        }}
      />
    </div>
  );
}
