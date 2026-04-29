"use client";

import { format } from "date-fns";
import { ArrowDown, ArrowUp, Minus, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/lib/projects";

const CONFIDENCE_STYLES = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-red-400",
};

const PRIORITY_STYLES = {
  high: "text-red-300 ring-red-500/30 bg-red-500/10",
  medium: "text-amber-300 ring-amber-500/30 bg-amber-500/10",
  low: "text-zinc-400 ring-zinc-700 bg-zinc-800",
};

export function ProjectTabs({ project }: { project: ProjectDetail }) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-zinc-900 border border-zinc-800">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="kpis">KPIs</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="tasks">
          Tasks
          {project.tasks.length > 0 && (
            <span className="ml-1.5 text-xs text-zinc-500">
              {project.tasks.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="meetings">Meetings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-zinc-500">
            Overview
          </h2>
          <p className="text-zinc-200 leading-relaxed">
            {project.overview ?? "No overview yet."}
          </p>
        </section>
        {project.internal_notes && (
          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <EyeOff className="h-3.5 w-3.5" />
              Internal notes — not visible to client
            </h2>
            <p className="text-zinc-200 leading-relaxed">
              {project.internal_notes}
            </p>
          </section>
        )}
      </TabsContent>

      <TabsContent value="kpis">
        {project.kpis.length === 0 ? (
          <EmptyState>No KPIs configured for this project yet.</EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {project.kpis.map((kpi) => {
              const percent =
                kpi.target_value && kpi.current_value
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(kpi.current_value) /
                          Number(kpi.target_value)) *
                          100,
                      ),
                    )
                  : null;
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
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500">
                    {kpi.name}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-semibold text-zinc-100">
                      {kpi.current_value ?? "—"}
                    </div>
                    {kpi.unit && (
                      <div className="text-sm text-zinc-500">{kpi.unit}</div>
                    )}
                    {kpi.trend && (
                      <TrendIcon className={cn("h-4 w-4 ml-auto", trendColor)} />
                    )}
                  </div>
                  {kpi.target_value !== null && (
                    <>
                      <div className="text-xs text-zinc-500">
                        Target: {kpi.target_value} {kpi.unit ?? ""}
                      </div>
                      {percent !== null && (
                        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-brand"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="timeline">
        {project.stages.length === 0 ? (
          <EmptyState>No stages defined for this project.</EmptyState>
        ) : (
          <ol className="space-y-3">
            {project.stages.map((stage) => (
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
                  <div className="font-medium text-zinc-100">{stage.name}</div>
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
        )}
      </TabsContent>

      <TabsContent value="tasks">
        {project.tasks.length === 0 ? (
          <EmptyState>No tasks yet. Process a meeting transcript to extract tasks.</EmptyState>
        ) : (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-zinc-500">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {project.tasks.map((t) => (
                  <tr key={t.id} className="bg-zinc-950 hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-zinc-100">
                      <div className="font-medium">{t.title}</div>
                      {t.source_quote && (
                        <div className="text-xs text-zinc-500 italic mt-1 line-clamp-1">
                          “{t.source_quote}”
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{t.owner ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {t.due_date ? format(new Date(t.due_date), "MMM d") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1",
                          PRIORITY_STYLES[t.priority],
                        )}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-xs", CONFIDENCE_STYLES[t.confidence])}>
                      {t.confidence}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.client_visible ? (
                        <Eye className="h-4 w-4 text-brand inline" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-zinc-600 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="meetings">
        {project.meetings.length === 0 ? (
          <EmptyState>No meetings processed yet.</EmptyState>
        ) : (
          <ul className="space-y-3">
            {project.meetings.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-zinc-200 font-medium">
                    {format(new Date(m.meeting_date), "MMM d, yyyy")}
                  </div>
                  <StatusBadge
                    status={
                      m.review_status === "approved" ? "done" : "in_progress"
                    }
                  />
                </div>
                {m.summary && (
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {m.summary}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}
