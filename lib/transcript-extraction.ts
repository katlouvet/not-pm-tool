import { anthropic, CLAUDE_MODEL } from "@/lib/claude";

export type ExtractedTask = {
  title: string;
  owner: string;
  due_date: string | null;
  due_date_original_text: string | null;
  priority: "high" | "medium" | "low";
  confidence: "high" | "medium" | "low";
  source_quote: string;
};

export type ExtractedDecision = {
  decision: string;
  rationale: string;
  source_quote: string;
};

export type ExtractedBlocker = {
  description: string;
  owner: string;
  resolution_by: string | null;
};

export type ExtractionResult = {
  summary: string;
  tasks: ExtractedTask[];
  decisions: ExtractedDecision[];
  blockers: ExtractedBlocker[];
};

const SYSTEM_PROMPT = `You are an expert meeting notes processor for an AI-driven creative agency called NOT. You receive meeting transcripts (often mixed FR + EN) and extract structured action items, decisions, and blockers.

CRITICAL RULES:
1. Every task you extract MUST include a verbatim source_quote from the transcript (in the original language). If you cannot find a clear quote, do not extract the task.
2. The OWNER of a task is the person who will DO the work, never the person who assigned it. If unclear, set owner to "TBD" and confidence to "low".
3. Tasks/decisions/blockers are stored in English. The source_quote stays in the original language.
4. If a date is mentioned in natural language (e.g. "vendredi prochain", "by next week", "fin du mois"), include both the inferred ISO date AND the original phrasing.
5. Set confidence:
   - "high" — owner is named, deliverable is concrete, source_quote is unambiguous
   - "medium" — minor ambiguity (e.g. soft date, slight ambiguity in scope)
   - "low" — owner is "TBD" or quote is ambiguous
6. The transcript will include the meeting date as context. Use it to resolve relative dates.

Return ONLY a tool call to "extract_meeting_data". Do not write any prose.`;

const TOOL_SCHEMA = {
  name: "extract_meeting_data",
  description: "Extract structured tasks, decisions, blockers, and a summary from a meeting transcript.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: {
        type: "string",
        description: "2-3 sentence summary of the meeting. Written in English. Focus on outcomes, not chitchat.",
      },
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Concrete action, in English. Imperative voice." },
            owner: { type: "string", description: "Person who will DO the work. 'TBD' if unclear." },
            due_date: { type: "string", description: "ISO date YYYY-MM-DD, or empty string if not specified." },
            due_date_original_text: { type: "string", description: "Original date phrasing from the transcript (any language)." },
            priority: { type: "string", enum: ["high", "medium", "low"] },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            source_quote: { type: "string", description: "Verbatim quote from the transcript, in original language." },
          },
          required: ["title", "owner", "priority", "confidence", "source_quote"],
        },
      },
      decisions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            decision: { type: "string" },
            rationale: { type: "string" },
            source_quote: { type: "string" },
          },
          required: ["decision", "source_quote"],
        },
      },
      blockers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            owner: { type: "string" },
            resolution_by: { type: "string", description: "ISO date or empty string." },
          },
          required: ["description", "owner"],
        },
      },
    },
    required: ["summary", "tasks", "decisions", "blockers"],
  },
};

export async function extractMeetingData(args: {
  transcript: string;
  meetingDate: string;
  projectName: string;
}): Promise<ExtractionResult> {
  const userMessage = `Meeting date: ${args.meetingDate}
Project: ${args.projectName}

Transcript:
"""
${args.transcript}
"""`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "extract_meeting_data" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool call");
  }

  const raw = toolUse.input as {
    summary: string;
    tasks: Array<Record<string, unknown>>;
    decisions: Array<Record<string, unknown>>;
    blockers: Array<Record<string, unknown>>;
  };

  return {
    summary: raw.summary,
    tasks: raw.tasks.map((t) => ({
      title: String(t.title),
      owner: String(t.owner ?? "TBD"),
      due_date: typeof t.due_date === "string" && t.due_date ? t.due_date : null,
      due_date_original_text:
        typeof t.due_date_original_text === "string" && t.due_date_original_text
          ? t.due_date_original_text
          : null,
      priority: (t.priority as "high" | "medium" | "low") ?? "medium",
      confidence: (t.confidence as "high" | "medium" | "low") ?? "medium",
      source_quote: String(t.source_quote ?? ""),
    })),
    decisions: raw.decisions.map((d) => ({
      decision: String(d.decision),
      rationale: typeof d.rationale === "string" ? d.rationale : "",
      source_quote: String(d.source_quote ?? ""),
    })),
    blockers: raw.blockers.map((b) => ({
      description: String(b.description),
      owner: String(b.owner ?? "TBD"),
      resolution_by:
        typeof b.resolution_by === "string" && b.resolution_by
          ? b.resolution_by
          : null,
    })),
  };
}
