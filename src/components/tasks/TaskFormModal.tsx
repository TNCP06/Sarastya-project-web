"use client";

import { useEffect, useState } from "react";
import { createTask, updateTask } from "@/lib/tasks";
import { ApiError } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/api";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Props {
  open: boolean;
  projectId: number;
  /** null = mode tambah, selain itu = mode edit. */
  initial: Task | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskFormModal({
  open,
  projectId,
  initial,
  onClose,
  onSaved,
}: Props) {
  const isEdit = initial !== null;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setStatus(initial?.status ?? "todo");
      setDueDate(initial?.dueDate ?? "");
      setError(null);
      setFieldErrors({});
      setLoading(false);
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFieldErrors({ title: ["Judul wajib diisi"] });
      return;
    }
    setLoading(true);
    setError(null);
    setFieldErrors({});
    const payload = {
      title: trimmed,
      description: description.trim() || null,
      status,
      dueDate: dueDate || null,
    };
    try {
      if (initial) await updateTask(initial.id, payload);
      else await createTask(projectId, payload);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && Object.keys(err.fieldErrors).length) {
          setFieldErrors(err.fieldErrors);
        } else {
          setError(err.message);
        }
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={isEdit ? "Edit Task" : "Tambah Task"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          id="task-title"
          label="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors.title?.[0]}
          maxLength={150}
          autoFocus
          required
        />
        <Textarea
          id="task-desc"
          label="Deskripsi (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description?.[0]}
          maxLength={1000}
          rows={3}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-status"
            className="text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          {fieldErrors.status?.[0] && (
            <p className="text-xs text-red-600">{fieldErrors.status[0]}</p>
          )}
        </div>
        <TextField
          id="task-due"
          label="Jatuh tempo (opsional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={fieldErrors.duedate?.[0]}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
