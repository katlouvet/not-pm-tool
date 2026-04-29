import { differenceInCalendarWeeks, isAfter, parseISO, addWeeks } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { StageStatus } from "@/lib/projects";

export type EmailData = {
  clientName: string;
  clientSlug: string;
  projectName: string;
  percent: number;
  status: "on_track" | "at_risk" | "blocked" | "complete";
  thisWeek: string[];
  inProgress: { name: string; percent: number } | null;
  nextWeek: string[];
};

export async function compileEmailData(
  projectId: string,
): Promise<EmailData | null> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, status, kickoff_date, delivery_date, clients!inner(name, slug)")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const { data: stages } = await supabase
    .from("project_stages")
    .select("name, start_date, end_date, status, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  const stageList = (stages ?? []) as Array<{
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: StageStatus;
    sort_order: number;
  }>;

  const total = stageList.length;
  const done = stageList.filter((s) => s.status === "done").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const now = new Date();

  const thisWeek = stageList
    .filter((s) => {
      if (s.status !== "done" || !s.end_date) return false;
      return differenceInCalendarWeeks(now, parseISO(s.end_date)) <= 1;
    })
    .map((s) => s.name);

  const inProgressStage = stageList.find((s) => s.status === "in_progress");
  let inProgress: EmailData["inProgress"] = null;
  if (inProgressStage && inProgressStage.start_date && inProgressStage.end_date) {
    const start = parseISO(inProgressStage.start_date);
    const end = parseISO(inProgressStage.end_date);
    const totalDays = (end.getTime() - start.getTime()) / 86_400_000;
    const elapsed = (now.getTime() - start.getTime()) / 86_400_000;
    const stagePercent = Math.max(
      0,
      Math.min(100, Math.round((elapsed / totalDays) * 100)),
    );
    inProgress = { name: inProgressStage.name, percent: stagePercent };
  }

  const nextWeek = stageList
    .filter((s) => {
      if (s.status !== "not_started" || !s.start_date) return false;
      const startDate = parseISO(s.start_date);
      return (
        isAfter(startDate, now) &&
        isAfter(addWeeks(now, 2), startDate)
      );
    })
    .map((s) => s.name);

  let status: EmailData["status"] = "on_track";
  if (project.status === "done") status = "complete";
  else if (stageList.some((s) => s.status === "blocked")) status = "blocked";

  const client = project.clients as unknown as { name: string; slug: string };

  return {
    clientName: client.name,
    clientSlug: client.slug,
    projectName: project.name,
    percent,
    status,
    thisWeek,
    inProgress,
    nextWeek,
  };
}

export function defaultEmailCopy(data: EmailData): string {
  const parts: string[] = [];

  if (data.thisWeek.length > 0) {
    parts.push(
      `This week we wrapped ${data.thisWeek[0]}${data.thisWeek.length > 1 ? ` and ${data.thisWeek.length - 1} more milestone${data.thisWeek.length > 2 ? "s" : ""}` : ""}.`,
    );
  }
  if (data.inProgress) {
    parts.push(
      `${data.inProgress.name} is in motion (${data.inProgress.percent}% of the way through).`,
    );
  }
  if (data.nextWeek.length > 0) {
    parts.push(`Next up: ${data.nextWeek[0]}.`);
  }

  parts.push(
    `Overall the project is ${data.percent}% complete and we're tracking ${data.status === "on_track" ? "on plan" : data.status.replace("_", " ")}.`,
  );

  return parts.join(" ");
}
