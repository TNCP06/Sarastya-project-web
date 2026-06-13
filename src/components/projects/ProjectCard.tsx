import Link from "next/link";
import type { ProjectListItem } from "@/types/api";
import { formatDate } from "@/lib/format";
import { encodeId } from "@/lib/idcodec";
import { Button } from "@/components/ui/Button";

interface Props {
  project: ProjectListItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: Props) {
  const { taskCount, doneTaskCount } = project;
  const pct = taskCount > 0 ? Math.round((doneTaskCount / taskCount) * 100) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${encodeId(project.id)}`} className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 hover:underline">
            {project.name}
          </h3>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50"
          >
            Hapus
          </Button>
        </div>
      </div>

      {project.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {project.description}
        </p>
      ) : (
        <p className="mt-1 text-sm italic text-slate-400">Tanpa deskripsi</p>
      )}

      <div className="mt-4">
        {taskCount > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {doneTaskCount}/{taskCount} task selesai
              </span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">Belum ada task</p>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Dibuat {formatDate(project.createdAt)}
      </p>
    </div>
  );
}
