import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/auth";
import { compileEmailData } from "@/lib/email-data";
import { generateEmailCopy } from "@/lib/email-copywriter";

export async function POST(request: Request) {
  await requireTeam();

  const { projectId } = (await request.json()) as { projectId?: string };
  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const data = await compileEmailData(projectId);
  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const copy = await generateEmailCopy(data);
    return NextResponse.json({ copy });
  } catch (err) {
    console.error("Email copy generation failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}
