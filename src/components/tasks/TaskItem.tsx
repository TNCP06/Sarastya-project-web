import type { Task, TaskStatus } from "@/types/api";
import { STATUS_LABEL, STATUS_ORDER, STATUS_SELECT_STYLE } from "@/lib/status";
import { formatDate, formatDateOnly } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function StatusSelect({
  value,
  loading,
  onChange,
}: {
  value: TaskStatus;
  loading: boolean;
  onChange: (status: TaskStatus) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {loading && <Spinner className="h-4 w-4 text-slate-400" />}
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        aria-label="Ubah status"
        className={`h-8 cursor-pointer rounded-lg border px-2 text-xs font-medium focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_SELECT_STYLE[value]}`}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

interface Props {
  task: Task;
  statusLoading: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskItem({
  task,
  statusLoading,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) {
  const done = task.status === "done";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p
          className={`font-medium ${
            done ? "text-slate-400 line-through" : "text-slate-900"
          }`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
            {task.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
          {task.dueDate && <span>Jatuh tempo {formatDateOnly(task.dueDate)}</span>}
          <span>Dibuat {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <StatusSelect
          value={task.status}
          loading={statusLoading}
          onChange={onStatusChange}
        />
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
  );
}
