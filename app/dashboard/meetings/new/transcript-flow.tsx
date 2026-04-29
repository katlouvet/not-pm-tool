"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Sparkles, Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SAMPLE_TRANSCRIPT } from "@/lib/sample-transcript";
import type { ExtractionResult, ExtractedTask } from "@/lib/transcript-extraction";

type ProjectOption = { id: string; label: string };

type ReviewableTask = ExtractedTask & {
  approved: boolean;
  client_visible: boolean;
};

const CONF_STYLES = {
  high: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  low: "bg-red-500/15 text-red-300 ring-red-500/30",
};

export function TranscriptFlow({ projects }: { projects: ProjectOption[] }) {
  const router = useRouter();
  const [transcript, setTranscript] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [meetingDate, setMeetingDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractionResult | null>(null);
  const [tasks, setTasks] = useState<ReviewableTask[]>([]);
  const [committing, setCommitting] = useState(false);

  async function onExtract() {
    setExtracting(true);
    setError(null);
    try {
      const res = await fetch("/api/process-transcript", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, projectId, meetingDate }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ExtractionResult;
      setExtracted(data);
      setTasks(
        data.tasks.map((t) => ({
          ...t,
          approved: t.confidence !== "low",
          client_visible: false,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function onCommit() {
    if (!extracted) return;
    setCommitting(true);
    setError(null);
    try {
      const approved = tasks.filter((t) => t.approved);
      const res = await fetch("/api/commit-meeting", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId,
          meetingDate,
          transcript,
          summary: extracted.summary,
          tasks: approved.map((t) => ({
            title: t.title,
            owner: t.owner,
            due_date: t.due_date,
            due_date_original_text: t.due_date_original_text,
            priority: t.priority,
            confidence: t.confidence,
            source_quote: t.source_quote,
            client_visible: t.client_visible,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.push(`/dashboard/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Commit failed");
      setCommitting(false);
    }
  }

  if (extracted) {
    const approvedCount = tasks.filter((t) => t.approved).length;
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-zinc-500">Summary</div>
          <p className="text-sm text-zinc-200 leading-relaxed">{extracted.summary}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500">
              Extracted tasks ({tasks.length})
            </h2>
            <div className="text-xs text-zinc-500">
              {approvedCount} of {tasks.length} selected for commit
            </div>
          </div>

          <ul className="space-y-3">
            {tasks.map((task, i) => (
              <li
                key={i}
                className={cn(
                  "rounded-xl border p-4 space-y-3 transition-colors",
                  task.approved
                    ? "border-zinc-700 bg-zinc-900/60"
                    : "border-zinc-800/50 bg-zinc-900/20 opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setTasks((prev) =>
                        prev.map((t, idx) =>
                          idx === i ? { ...t, approved: !t.approved } : t,
                        ),
                      )
                    }
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0",
                      task.approved
                        ? "bg-blue-500 border-blue-500"
                        : "bg-zinc-900 border-zinc-700 hover:border-zinc-500",
                    )}
                  >
                    {task.approved && <Check className="h-3 w-3 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((t, idx) =>
                            idx === i ? { ...t, title: e.target.value } : t,
                          ),
                        )
                      }
                      className="w-full bg-transparent border-0 text-zinc-100 font-medium focus:outline-none focus:ring-0 px-0"
                    />
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 ring-1",
                          CONF_STYLES[task.confidence],
                        )}
                      >
                        {task.confidence} confidence
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Owner:</span>
                        <input
                          value={task.owner}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((t, idx) =>
                                idx === i
                                  ? { ...t, owner: e.target.value }
                                  : t,
                              ),
                            )
                          }
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-200 text-xs w-32 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Due:</span>
                        <input
                          type="date"
                          value={task.due_date ?? ""}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((t, idx) =>
                                idx === i
                                  ? {
                                      ...t,
                                      due_date: e.target.value || null,
                                    }
                                  : t,
                              ),
                            )
                          }
                          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      {task.due_date_original_text && (
                        <span className="text-zinc-500 italic">
                          ({task.due_date_original_text})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setTasks((prev) =>
                            prev.map((t, idx) =>
                              idx === i
                                ? { ...t, client_visible: !t.client_visible }
                                : t,
                            ),
                          )
                        }
                        className={cn(
                          "ml-auto inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ring-1 transition-colors",
                          task.client_visible
                            ? "bg-blue-500/15 text-blue-300 ring-blue-500/30"
                            : "bg-zinc-800 text-zinc-400 ring-zinc-700 hover:text-zinc-200",
                        )}
                      >
                        {task.client_visible ? (
                          <>
                            <Eye className="h-3 w-3" /> Visible to client
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" /> Internal only
                          </>
                        )}
                      </button>
                    </div>
                    {task.source_quote && (
                      <div className="text-xs text-zinc-500 italic border-l-2 border-zinc-800 pl-3 leading-relaxed">
                        “{task.source_quote}”
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {extracted.decisions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500">
              Decisions noted ({extracted.decisions.length})
            </h2>
            <ul className="space-y-2">
              {extracted.decisions.map((d, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm space-y-1"
                >
                  <div className="text-zinc-100 font-medium">{d.decision}</div>
                  {d.rationale && (
                    <div className="text-zinc-400">{d.rationale}</div>
                  )}
                  {d.source_quote && (
                    <div className="text-xs text-zinc-500 italic mt-2 border-l-2 border-zinc-800 pl-3">
                      “{d.source_quote}”
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {extracted.blockers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500">
              Blockers flagged ({extracted.blockers.length})
            </h2>
            <ul className="space-y-2">
              {extracted.blockers.map((b, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm space-y-1"
                >
                  <div className="text-zinc-100 font-medium">{b.description}</div>
                  <div className="text-xs text-zinc-500">
                    Owner: {b.owner}
                    {b.resolution_by && ` · Resolve by ${b.resolution_by}`}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => {
              setExtracted(null);
              setTasks([]);
            }}
            disabled={committing}
          >
            <X className="h-4 w-4" />
            Discard
          </Button>
          <Button
            onClick={onCommit}
            disabled={committing || approvedCount === 0}
            size="lg"
          >
            {committing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Committing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Commit {approvedCount} task{approvedCount === 1 ? "" : "s"} to project
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Meeting date</Label>
          <Input
            id="date"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transcript">Transcript</Label>
          <button
            type="button"
            onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Use demo sample (FR + EN)
          </button>
        </div>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={16}
          placeholder="Paste your meeting transcript here..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono leading-relaxed focus:outline-none focus:border-zinc-600 resize-y"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={onExtract}
          disabled={extracting || !transcript.trim() || !projectId}
          size="lg"
        >
          {extracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting with Claude...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Extract tasks
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
