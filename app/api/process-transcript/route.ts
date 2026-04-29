import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/auth";
import { extractMeetingData } from "@/lib/transcript-extraction";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await requireTeam();

  const body = (await request.json()) as {
    transcript?: string;
    projectId?: string;
    meetingDate?: string;
  };

  if (!body.transcript || !body.projectId || !body.meetingDate) {
    return NextResponse.json(
      { error: "transcript, projectId, and meetingDate are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", body.projectId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const result = await extractMeetingData({
      transcript: body.transcript,
      meetingDate: body.meetingDate,
      projectName: project.name,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Extraction failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Extraction failed" },
      { status: 500 },
    );
  }
}
