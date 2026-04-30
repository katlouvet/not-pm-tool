import { format, parseISO } from "date-fns";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/shared/status-badge";
import type { StageStatus } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: stages } = await supabase
    .from("project_stages")
    .select("id, name, start_date, end_date, status, projects!inner(id, name, clients!inner(name))")
    .order("start_date", { ascending: true });

  const upcoming = (stages ?? [])
    .filter(
      (s): s is typeof s & { start_date: string; end_date: string } =>
        Boolean(s.start_date && s.end_date),
    )
    .filter((s) => parseISO(s.end_date) >= new Date())
    .slice(0, 30);

  return (
    <div className="px-8 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-stone-600 mt-1">
          Upcoming stages across all projects
        </p>
      </header>

      <ol className="space-y-2">
        {upcoming.map((s) => {
          const project = s.projects as unknown as {
            id: string;
            name: string;
            clients: { name: string };
          };
          return (
            <li key={s.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="block rounded-xl border border-stone-200 bg-white hover:bg-white hover:border-stone-300 transition-colors p-4 flex items-center gap-4"
              >
                <div className="text-xs text-stone-500 w-32 shrink-0">
                  {format(parseISO(s.start_date), "MMM d")} →{" "}
                  {format(parseISO(s.end_date), "MMM d")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-stone-900 font-medium">{s.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {project.clients.name} · {project.name}
                  </div>
                </div>
                <StatusBadge status={s.status as StageStatus} />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
