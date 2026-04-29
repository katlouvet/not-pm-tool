import { createClient } from "@/lib/supabase/server";

export type ProjectStatus = "planning" | "in_progress" | "done" | "paused";
export type StageStatus = "not_started" | "in_progress" | "done" | "blocked";

export type ProjectListItem = {
  id: string;
  name: string;
  status: ProjectStatus;
  kickoff_date: string | null;
  delivery_date: string | null;
  client: { id: string; name: string; slug: string };
  total_stages: number;
  done_stages: number;
  next_stage_name: string | null;
};

export async function getProjectList(): Promise<ProjectListItem[]> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, status, kickoff_date, delivery_date, clients!inner(id, name, slug), project_stages(id, name, status, sort_order)",
    )
    .order("delivery_date", { ascending: true });

  if (!projects) return [];

  return projects.map((p) => {
    const stages = (p.project_stages ?? []) as Array<{
      id: string;
      name: string;
      status: StageStatus;
      sort_order: number;
    }>;
    const sorted = [...stages].sort((a, b) => a.sort_order - b.sort_order);
    const total = sorted.length;
    const done = sorted.filter((s) => s.status === "done").length;
    const next = sorted.find((s) => s.status !== "done") ?? null;
    const client = p.clients as unknown as {
      id: string;
      name: string;
      slug: string;
    };
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      kickoff_date: p.kickoff_date,
      delivery_date: p.delivery_date,
      client,
      total_stages: total,
      done_stages: done,
      next_stage_name: next?.name ?? null,
    };
  });
}

export type ProjectDetail = {
  id: string;
  name: string;
  status: ProjectStatus;
  kickoff_date: string | null;
  delivery_date: string | null;
  overview: string | null;
  internal_notes: string | null;
  client: { id: string; name: string; slug: string };
  stages: Array<{
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: StageStatus;
    sort_order: number;
  }>;
  kpis: Array<{
    id: string;
    name: string;
    target_value: number | null;
    current_value: number | null;
    unit: string | null;
    trend: "up" | "down" | "flat" | null;
    sort_order: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    owner: string | null;
    due_date: string | null;
    status: "open" | "in_progress" | "done" | "blocked";
    priority: "high" | "medium" | "low";
    confidence: "high" | "medium" | "low";
    client_visible: boolean;
    source_quote: string | null;
  }>;
  meetings: Array<{
    id: string;
    meeting_date: string;
    summary: string | null;
    review_status: "pending" | "approved" | "auto_committed";
  }>;
};

export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetail | null> {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, status, kickoff_date, delivery_date, overview, internal_notes, clients!inner(id, name, slug)",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const [{ data: stages }, { data: kpis }, { data: tasks }, { data: meetings }] =
    await Promise.all([
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
        .select(
          "id, title, owner, due_date, status, priority, confidence, client_visible, source_quote",
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("meeting_logs")
        .select("id, meeting_date, summary, review_status")
        .eq("project_id", projectId)
        .order("meeting_date", { ascending: false }),
    ]);

  return {
    id: project.id,
    name: project.name,
    status: project.status,
    kickoff_date: project.kickoff_date,
    delivery_date: project.delivery_date,
    overview: project.overview,
    internal_notes: project.internal_notes,
    client: project.clients as unknown as {
      id: string;
      name: string;
      slug: string;
    },
    stages: stages ?? [],
    kpis: kpis ?? [],
    tasks: tasks ?? [],
    meetings: meetings ?? [],
  };
}
