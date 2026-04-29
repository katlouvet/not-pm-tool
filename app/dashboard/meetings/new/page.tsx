import { createClient } from "@/lib/supabase/server";
import { TranscriptFlow } from "./transcript-flow";

export const dynamic = "force-dynamic";

export default async function NewMeetingPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, clients!inner(name)")
    .order("name");

  const projectOptions = (projects ?? []).map((p) => ({
    id: p.id,
    label: `${(p.clients as unknown as { name: string }).name} — ${p.name}`,
  }));

  return (
    <div className="px-8 py-8 space-y-6 max-w-5xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Process meeting transcript</h1>
        <p className="text-sm text-zinc-400">
          Paste a transcript or use the demo sample. Claude extracts tasks, decisions, and blockers — you review before anything is committed.
        </p>
      </header>
      <TranscriptFlow projects={projectOptions} />
    </div>
  );
}
