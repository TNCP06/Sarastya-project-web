"use client";

import { useCallback, useEffect, useState } from "react";
import { listProjects, deleteProject } from "@/lib/projects";
import { ApiError } from "@/lib/api";
import type { ProjectListItem } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";
import { useToast } from "@/components/ui/Toast";

export default function ProjectsPage() {
  const toast = useToast();
  const [data, setData] = useState<ProjectListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectListItem | null>(null);

  const [deleting, setDeleting] = useState<ProjectListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const projects = await listProjects();
      setData(projects);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat project.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(project: ProjectListItem) {
    setEditing(project);
    setFormOpen(true);
  }

  function handleSaved() {
    toast.success(editing ? "Project diperbarui." : "Project dibuat.");
    setFormOpen(false);
    setEditing(null);
    load();
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteProject(deleting.id);
      toast.success("Project dihapus.");
      setDeleting(null);
      load();
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "Gagal menghapus project.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project</h1>
          {data && data.length > 0 && (
            <p className="mt-0.5 text-sm text-slate-500">{data.length} project</p>
          )}
        </div>
        <Button onClick={openCreate}>+ Tambah Project</Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Memuat project..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              load();
            }}
          />
        ) : data && data.length === 0 ? (
          <EmptyState
            title="Belum ada project"
            description="Mulai dengan membuat project pertama Anda."
            action={<Button onClick={openCreate}>+ Tambah Project</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => openEdit(project)}
                onDelete={() => {
                  setDeleteError(null);
                  setDeleting(project);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus project?"
        message={
          deleting
            ? `Project "${deleting.name}" beserta semua task di dalamnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Hapus"
        loading={deleteLoading}
        error={deleteError ?? undefined}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleteLoading) setDeleting(null);
        }}
      />
    </div>
  );
}
