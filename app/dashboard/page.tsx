import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { getProjectList } from "@/lib/projects";
import { StatusBadge } from "@/components/shared/status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const projects = await getProjectList();

  return (
    <div className="px-8 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-stone-600 mt-1">
            {projects.length} active across all clients
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => {
          const percent =
            project.total_stages > 0
              ? Math.round((project.done_stages / project.total_stages) * 100)
              : 0;
          const daysToDelivery = project.delivery_date
            ? differenceInCalendarDays(new Date(project.delivery_date), new Date())
            : null;

          return (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group rounded-xl border border-stone-200 bg-white hover:bg-white hover:border-stone-300 transition-colors p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs uppercase tracking-wider text-stone-500 truncate">
                    {project.client.name}
                  </div>
                  <div className="text-base font-medium text-stone-900 truncate">
                    {project.name}
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>{percent}% complete</span>
                  <span>
                    {project.done_stages}/{project.total_stages} stages
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-accent-deep transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-200">
                <div className="truncate">
                  {project.next_stage_name ? (
                    <>
                      <span className="text-stone-400">Next:</span>{" "}
                      <span className="text-stone-700">
                        {project.next_stage_name}
                      </span>
                    </>
                  ) : (
                    <span className="text-stone-400">All stages complete</span>
                  )}
                </div>
                {project.delivery_date && (
                  <div className="text-stone-600 shrink-0 ml-3">
                    {daysToDelivery && daysToDelivery > 0
                      ? `${daysToDelivery}d to delivery`
                      : format(new Date(project.delivery_date), "MMM d")}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
