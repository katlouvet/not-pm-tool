import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  planning: "bg-stone-100 text-stone-700 ring-1 ring-stone-300",
  in_progress:
    "bg-accent-soft text-accent-deep ring-1 ring-accent-deep/30",
  done: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  paused: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  not_started: "bg-stone-50 text-stone-500 ring-1 ring-stone-200",
  blocked: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  open: "bg-stone-100 text-stone-700 ring-1 ring-stone-300",
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
