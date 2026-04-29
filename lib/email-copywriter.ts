import { anthropic, CLAUDE_MODEL } from "@/lib/claude";
import type { EmailData } from "@/lib/email-data";

const SYSTEM_PROMPT = `You write the weekly status email body for NOT., an AI-driven creative agency, to its clients. Voice: confident, calm, written-not-generated. No exclamations. No filler ("Exciting news!", "As always..."). 3-4 short sentences. Use "we" not "the team". Reference deliverables by name. Return only the prose body — no greeting, no signoff.`;

export async function generateEmailCopy(data: EmailData): Promise<string> {
  const userMessage = `Compile a status email body for the client.

CLIENT: ${data.clientName}
PROJECT: ${data.projectName}
OVERALL PROGRESS: ${data.percent}%
STATUS: ${data.status}

COMPLETED THIS WEEK:
${data.thisWeek.length === 0 ? "(none)" : data.thisWeek.map((s) => `- ${s}`).join("\n")}

IN PROGRESS:
${data.inProgress ? `${data.inProgress.name} (${data.inProgress.percent}% through)` : "(nothing in motion)"}

UPCOMING NEXT WEEK:
${data.nextWeek.length === 0 ? "(nothing scheduled)" : data.nextWeek.map((s) => `- ${s}`).join("\n")}

Write the body now.`;

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("\n")
    .trim();

  return text;
}
