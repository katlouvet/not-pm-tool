import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { getProjectDetail } from "@/lib/projects";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProjectTabs } from "./project-tabs";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  return (
    <div className="px-8 py-8 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All projects
      </Link>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {project.client.name}
            </div>
            <h1 className="text-2xl font-semibold mt-1">{project.name}</h1>
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
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
      </header>

      <ProjectTabs project={project} />
    </div>
  );
}
