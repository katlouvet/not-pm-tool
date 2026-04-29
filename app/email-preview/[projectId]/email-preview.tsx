"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Sparkles, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailTemplate } from "@/components/shared/email-template";
import type { EmailData } from "@/lib/email-data";

export function EmailPreview({
  projectId,
  data,
  initialCopy,
}: {
  projectId: string;
  data: EmailData;
  initialCopy: string;
}) {
  const [copy, setCopy] = useState(initialCopy);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/portal/${data.clientSlug}/${projectId}`
      : `/portal/${data.clientSlug}/${projectId}`;

  async function regenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-email-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { copy } = (await res.json()) as { copy: string };
      setCopy(copy);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const subject = `${data.projectName} — ${data.percent}% complete, ${data.status === "on_track" ? "on track" : data.status.replace("_", " ")}`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to project
          </Link>
          <div className="text-xs text-zinc-500 inline-flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            Email preview · sent every Monday at 08:00 CET
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-xs text-zinc-500">Subject</div>
            <div className="text-sm text-zinc-100 font-mono truncate">{subject}</div>
          </div>
          <Button onClick={regenerate} disabled={generating} variant="outline">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Rewrite with Claude
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <EmailTemplate
            clientName={data.clientName}
            projectName={data.projectName}
            percent={data.percent}
            status={data.status}
            thisWeek={data.thisWeek}
            inProgress={data.inProgress}
            nextWeek={data.nextWeek}
            copy={copy}
            portalUrl={portalUrl}
            weekOf={new Date()}
          />
        </div>

        <div className="text-xs text-zinc-500 text-center pt-4 border-t border-zinc-900">
          In production this would be sent automatically every Monday morning via Resend.
          The preview here uses live project data — click <span className="text-zinc-300">Rewrite with Claude</span> to regenerate the copy in NOT.&apos;s voice.
        </div>
      </div>
    </div>
  );
}
