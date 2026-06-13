"use client";

import { useEffect, useState } from "react";
import { createProject, updateProject } from "@/lib/projects";
import { ApiError } from "@/lib/api";
import type { ProjectListItem } from "@/types/api";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Props {
  open: boolean;
  /** null = mode tambah, selain itu = mode edit. */
  initial: ProjectListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProjectFormModal({ open, initial, onClose, onSaved }: Props) {
  const isEdit = initial !== null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Reset isian setiap kali modal dibuka.
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setError(null);
      setFieldErrors({});
      setLoading(false);
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFieldErrors({ name: ["Nama wajib diisi"] });
      return;
    }
    setLoading(true);
    setError(null);
    setFieldErrors({});
    const payload = { name: trimmed, description: description.trim() || null };
    try {
      if (initial) await updateProject(initial.id, payload);
      else await createProject(payload);
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
      title={isEdit ? "Edit Project" : "Tambah Project"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          id="project-name"
          label="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name?.[0]}
          maxLength={150}
          autoFocus
          required
        />
        <Textarea
          id="project-desc"
          label="Deskripsi (opsional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description?.[0]}
          maxLength={1000}
          rows={3}
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
