import Link from "next/link";
import { redirect } from "next/navigation";
import { differenceInCalendarDays, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ProjectStatus, StageStatus } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function PortalHome({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, status, kickoff_date, delivery_date, project_stages(status)",
    )
    .order("delivery_date", { ascending: true });

  const list = (projects ?? []) as Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    kickoff_date: string | null;
    delivery_date: string | null;
    project_stages: Array<{ status: StageStatus }>;
  }>;

  if (list.length === 1) {
    redirect(`/portal/${clientSlug}/${list[0].id}`);
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Your projects</h1>
        <p className="text-sm text-zinc-400">
          {list.length} active {list.length === 1 ? "project" : "projects"} with NOT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((project) => {
          const total = project.project_stages.length;
          const done = project.project_stages.filter(
            (s) => s.status === "done",
          ).length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const daysToDelivery = project.delivery_date
            ? differenceInCalendarDays(new Date(project.delivery_date), new Date())
            : null;

          return (
            <Link
              key={project.id}
              href={`/portal/${clientSlug}/${project.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-colors p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-base font-medium text-zinc-100">
                  {project.name}
                </div>
                <StatusBadge status={project.status} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{percent}% complete</span>
                  {project.delivery_date && (
                    <span>
                      {daysToDelivery && daysToDelivery > 0
                        ? `${daysToDelivery}d to delivery`
                        : format(new Date(project.delivery_date), "MMM d")}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
