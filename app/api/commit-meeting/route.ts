import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireTeam } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ExtractedTask } from "@/lib/transcript-extraction";

type CommitBody = {
  projectId: string;
  meetingDate: string;
  meetingId?: string;
  transcript: string;
  summary: string;
  tasks: Array<ExtractedTask & { client_visible?: boolean }>;
};

export async function POST(request: Request) {
  await requireTeam();

  const body = (await request.json()) as CommitBody;

  if (!body.projectId || !body.meetingDate || !body.tasks) {
    return NextResponse.json(
      { error: "projectId, meetingDate, and tasks are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const meetingId =
    body.meetingId ??
    `meeting-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  // Idempotency check
  const { data: existing } = await supabase
    .from("meeting_logs")
    .select("id")
    .eq("project_id", body.projectId)
    .eq("meeting_id", meetingId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Meeting already processed", meetingLogId: existing.id },
      { status: 409 },
    );
  }

  const { data: meetingLog, error: meetingError } = await supabase
    .from("meeting_logs")
    .insert({
      project_id: body.projectId,
      meeting_id: meetingId,
      meeting_date: body.meetingDate,
      summary: body.summary,
      raw_transcript: body.transcript,
      review_status: "approved",
      processed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (meetingError || !meetingLog) {
    return NextResponse.json(
      { error: meetingError?.message ?? "Failed to create meeting log" },
      { status: 500 },
    );
  }

  if (body.tasks.length > 0) {
    const taskRows = body.tasks.map((t) => ({
      project_id: body.projectId,
      title: t.title,
      owner: t.owner,
      due_date: t.due_date ?? null,
      due_date_original_text: t.due_date_original_text ?? null,
      status: "open" as const,
      priority: t.priority,
      confidence: t.confidence,
      source_meeting_id: meetingLog.id,
      source_quote: t.source_quote,
      client_visible: t.client_visible ?? false,
    }));

    const { error: taskError } = await supabase.from("tasks").insert(taskRows);

    if (taskError) {
      // Roll back the meeting log so we don't leave an orphan
      await supabase.from("meeting_logs").delete().eq("id", meetingLog.id);
      return NextResponse.json(
        { error: `Failed to insert tasks: ${taskError.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    meetingLogId: meetingLog.id,
    tasksCreated: body.tasks.length,
  });
}
