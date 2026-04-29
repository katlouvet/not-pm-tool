import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Minus, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProgressRing } from "@/components/shared/progress-ring";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus, StageStatus } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function PortalProjectPage({
  params,
}: {
  params: Promise<{ clientSlug: string; projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, kickoff_date, delivery_date, overview")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) notFound();

  const [{ data: stages }, { data: kpis }, { data: tasks }] = await Promise.all([
    supabase
      .from("project_stages")
      .select("id, name, start_date, end_date, status, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("kpis")
      .select("id, name, target_value, current_value, unit, trend, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, owner, due_date")
      .eq("project_id", projectId)
      .eq("status", "open"),
    // RLS already restricts to client_visible = true
  ]);

  const stageList = (stages ?? []) as Array<{
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: StageStatus;
    sort_order: number;
  }>;

  const total = stageList.length;
  const done = stageList.filter((s) => s.status === "done").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const inProgressStage = stageList.find((s) => s.status === "in_progress");
  const actionItems = (tasks ?? []) as Array<{
    id: string;
    title: string;
    owner: string | null;
    due_date: string | null;
  }>;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/80 to-zinc-950 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ProgressRing percent={percent} label={statusLabel(project.status)} />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Project status
            </div>
            <h1 className="text-3xl font-semibold">{project.name}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center md:justify-start text-sm text-zinc-400">
              {project.kickoff_date && (
                <div>
                  <span className="text-zinc-500">Kick-off:</span>{" "}
                  {format(new Date(project.kickoff_date), "MMM d, yyyy")}
                </div>
              )}
              {project.delivery_date && (
                <div>
                  <span className="text-zinc-500">Delivery:</span>{" "}
                  {format(new Date(project.delivery_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
            {project.overview && (
              <p className="text-sm text-zinc-400 leading-relaxed pt-2">
                {project.overview}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Action required */}
      {actionItems.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="text-sm font-medium text-amber-200">
              {actionItems.length} item{actionItems.length === 1 ? "" : "s"} awaiting your input
            </div>
            <ul className="space-y-1 text-sm text-zinc-300">
              {actionItems.map((t) => (
                <li key={t.id} className="flex justify-between gap-3">
                  <span className="truncate">{t.title}</span>
                  {t.due_date && (
                    <span className="text-xs text-zinc-500 shrink-0">
                      due {format(new Date(t.due_date), "MMM d")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* KPIs */}
      {kpis && kpis.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500">
            Key metrics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((kpi) => {
              const TrendIcon =
                kpi.trend === "up"
                  ? ArrowUp
                  : kpi.trend === "down"
                    ? ArrowDown
                    : Minus;
              const trendColor =
                kpi.trend === "up"
                  ? "text-emerald-400"
                  : kpi.trend === "down"
                    ? "text-red-400"
                    : "text-zinc-500";
              return (
                <div
                  key={kpi.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
                >
                  <div className="text-xs text-zinc-500">{kpi.name}</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-semibold text-zinc-100">
                      {kpi.current_value ?? "—"}
                    </div>
                    {kpi.unit && (
                      <div className="text-xs text-zinc-500">{kpi.unit}</div>
                    )}
                    {kpi.trend && (
                      <TrendIcon
                        className={cn("h-3.5 w-3.5 ml-auto", trendColor)}
                      />
                    )}
                  </div>
                  {kpi.target_value !== null && (
                    <div className="text-xs text-zinc-500">
                      Target: {kpi.target_value} {kpi.unit ?? ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">
          Production timeline
        </h2>
        <ol className="space-y-2">
          {stageList.map((stage) => (
            <li
              key={stage.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center gap-4"
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  stage.status === "done" && "bg-emerald-400",
                  stage.status === "in_progress" && "bg-brand animate-pulse",
                  stage.status === "not_started" && "bg-zinc-700",
                  stage.status === "blocked" && "bg-red-400",
                )}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-medium",
                    stage.status === "done"
                      ? "text-zinc-400 line-through"
                      : "text-zinc-100",
                  )}
                >
                  {stage.name}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {stage.start_date &&
                    format(new Date(stage.start_date), "MMM d")}
                  {stage.end_date && (
                    <>
                      {" – "}
                      {format(new Date(stage.end_date), "MMM d, yyyy")}
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={stage.status} />
            </li>
          ))}
        </ol>
      </section>

      <footer className="text-center text-xs text-zinc-600 py-6 border-t border-zinc-900">
        Questions? Just reply to your weekly update email.
      </footer>
    </main>
  );

  function statusLabel(status: ProjectStatus) {
    return {
      planning: "PLANNING",
      in_progress: "ON TRACK",
      done: "COMPLETE",
      paused: "ON HOLD",
    }[status];
  }
}
