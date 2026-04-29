import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/shared/status-badge";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from("meeting_logs")
    .select("id, meeting_date, summary, review_status, projects!inner(id, name, clients!inner(name))")
    .order("meeting_date", { ascending: false });

  return (
    <div className="px-8 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Processed transcripts. Each meeting can produce tasks and decisions.
          </p>
        </div>
        <Link
          href="/dashboard/meetings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-rose-600 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Process transcript
        </Link>
      </header>

      <div className="space-y-3">
        {(meetings ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center text-sm text-zinc-500">
            No meetings processed yet. Click &ldquo;Process transcript&rdquo; to start.
          </div>
        ) : (
          (meetings ?? []).map((m) => {
            const project = m.projects as unknown as {
              id: string;
              name: string;
              clients: { name: string };
            };
            return (
              <Link
                key={m.id}
                href={`/dashboard/projects/${project.id}`}
                className="block rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-colors p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      {project.clients.name} · {project.name}
                    </div>
                    <div className="text-base font-medium text-zinc-100">
                      {format(new Date(m.meeting_date), "MMMM d, yyyy")}
                    </div>
                  </div>
                  <StatusBadge
                    status={m.review_status === "approved" ? "done" : "in_progress"}
                  />
                </div>
                {m.summary && (
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {m.summary}
                  </p>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
