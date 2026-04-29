import { format } from "date-fns";

type EmailTemplateProps = {
  clientName: string;
  projectName: string;
  percent: number;
  status: "on_track" | "at_risk" | "blocked" | "complete";
  thisWeek: string[];
  inProgress: { name: string; percent: number } | null;
  nextWeek: string[];
  copy: string;
  portalUrl: string;
  weekOf: Date;
};

const STATUS_LABEL = {
  on_track: "ON TRACK",
  at_risk: "AT RISK",
  blocked: "BLOCKED",
  complete: "COMPLETE",
};

const STATUS_COLOR = {
  on_track: "#34d399",
  at_risk: "#fbbf24",
  blocked: "#f87171",
  complete: "#34d399",
};

export function EmailTemplate({
  clientName,
  projectName,
  percent,
  status,
  thisWeek,
  inProgress,
  nextWeek,
  copy,
  portalUrl,
  weekOf,
}: EmailTemplateProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e4e4e7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 560,
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.3em",
          color: "#a1a1aa",
          textAlign: "center",
        }}
      >
        NOT.
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 8,
          marginBottom: 24,
          fontSize: 12,
          color: "#71717a",
        }}
      >
        Project status update · Week of {format(weekOf, "MMMM d, yyyy")}
      </div>

      <div style={{ textAlign: "center", margin: "24px 0" }}>
        <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={8}
          />
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div style={{ marginTop: 12, fontSize: 24, fontWeight: 600 }}>
          {Math.round(percent)}%{" "}
          <span style={{ color: STATUS_COLOR[status], fontSize: 14, fontWeight: 500 }}>
            · {STATUS_LABEL[status]}
          </span>
        </div>
        <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>
          {projectName}
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid #27272a", margin: "24px 0" }} />

      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#d4d4d8" }}>{copy}</p>

      <hr style={{ border: 0, borderTop: "1px solid #27272a", margin: "24px 0" }} />

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          This week
        </div>
        {thisWeek.length === 0 ? (
          <div style={{ fontSize: 14, color: "#71717a" }}>No completed milestones this week.</div>
        ) : (
          thisWeek.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: "#e4e4e7",
                marginBottom: 6,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color: "#34d399" }}>✓</span>
              <span>{item}</span>
            </div>
          ))
        )}
      </div>

      {inProgress && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "#71717a",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            In progress
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#e4e4e7",
              marginBottom: 6,
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: "#60a5fa" }}>→</span>
            <span>{inProgress.name}</span>
            <span style={{ color: "#71717a", marginLeft: "auto" }}>
              {inProgress.percent}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              backgroundColor: "#27272a",
              borderRadius: 2,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: `${inProgress.percent}%`,
                height: "100%",
                backgroundColor: "#60a5fa",
              }}
            />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#71717a",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Next week
        </div>
        {nextWeek.length === 0 ? (
          <div style={{ fontSize: 14, color: "#71717a" }}>No new milestones starting next week.</div>
        ) : (
          nextWeek.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: "#e4e4e7",
                marginBottom: 6,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color: "#71717a" }}>○</span>
              <span>{item}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <a
          href={portalUrl}
          style={{
            display: "inline-block",
            padding: "12px 28px",
            backgroundColor: "#fafafa",
            color: "#0a0a0a",
            textDecoration: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          View full dashboard →
        </a>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid #27272a", margin: "24px 0" }} />

      <div style={{ fontSize: 11, color: "#52525b", textAlign: "center", lineHeight: 1.6 }}>
        NOT. · {clientName} — {projectName}
        <br />
        Questions? Just reply to this email.
        <br />
        <span style={{ color: "#3f3f46" }}>
          NOT. SAS · 12 rue de l&apos;Exemple, 75001 Paris ·{" "}
          <a href="#" style={{ color: "#3f3f46" }}>
            Unsubscribe
          </a>
        </span>
      </div>
    </div>
  );
}
