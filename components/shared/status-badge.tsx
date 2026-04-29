import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  planning: "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700",
  in_progress: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  done: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
  not_started: "bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700",
  blocked: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
  open: "bg-zinc-800 text-zinc-300 ring-1 ring-zinc-700",
} as const;

const STATUS_LABELS = {
  planning: "Planning",
  in_progress: "In progress",
  done: "Done",
  paused: "Paused",
  not_started: "Not started",
  blocked: "Blocked",
  open: "Open",
} as const;

type Status = keyof typeof STATUS_STYLES;

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
