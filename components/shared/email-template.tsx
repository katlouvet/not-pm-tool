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
  on_track: "#1f4842",
  at_risk: "#b45309",
  blocked: "#be123c",
  complete: "#059669",
};

const COLOR = {
  bg: "#f4f1eb",
  card: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#6b6b6b",
  textSubtle: "#9a9a9a",
  border: "#e5e3dd",
  brand: "#cc0000",
  accent: "#1f4842",
  accentDeeper: "#163530",
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
        backgroundColor: COLOR.bg,
        color: COLOR.text,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 560,
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontStyle: "italic",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: COLOR.text,
        }}
      >
        not<span style={{ color: COLOR.brand }}>.</span>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 6,
          marginBottom: 24,
          fontSize: 11,
          color: COLOR.textSubtle,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Project status · Week of {format(weekOf, "MMMM d, yyyy")}
      </div>

      <div
        style={{
          backgroundColor: COLOR.card,
          border: `1px solid ${COLOR.border}`,
          borderRadius: 16,
          padding: "32px 24px",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke={COLOR.border}
            strokeWidth={8}
          />
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke={COLOR.accent}
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
        <div style={{ color: COLOR.textMuted, fontSize: 14, marginTop: 4 }}>
          {projectName}
        </div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.7, color: COLOR.text, padding: "0 4px" }}>
        {copy}
      </p>

      <hr style={{ border: 0, borderTop: `1px solid ${COLOR.border}`, margin: "24px 4px" }} />

      <div style={{ marginBottom: 24, padding: "0 4px" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: COLOR.textSubtle,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          This week
        </div>
        {thisWeek.length === 0 ? (
          <div style={{ fontSize: 14, color: COLOR.textMuted }}>No completed milestones this week.</div>
        ) : (
          thisWeek.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: COLOR.text,
                marginBottom: 6,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color: "#059669" }}>✓</span>
              <span>{item}</span>
            </div>
          ))
        )}
      </div>

      {inProgress && (
        <div style={{ marginBottom: 24, padding: "0 4px" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              color: COLOR.textSubtle,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            In progress
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLOR.text,
              marginBottom: 6,
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: COLOR.accent }}>→</span>
            <span>{inProgress.name}</span>
            <span style={{ color: COLOR.textMuted, marginLeft: "auto" }}>
              {inProgress.percent}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              backgroundColor: COLOR.border,
              borderRadius: 2,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: `${inProgress.percent}%`,
                height: "100%",
                backgroundColor: COLOR.accent,
              }}
            />
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32, padding: "0 4px" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: COLOR.textSubtle,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Next week
        </div>
        {nextWeek.length === 0 ? (
          <div style={{ fontSize: 14, color: COLOR.textMuted }}>No new milestones starting next week.</div>
        ) : (
          nextWeek.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 14,
                color: COLOR.text,
                marginBottom: 6,
                display: "flex",
                gap: 8,
              }}
            >
              <span style={{ color: COLOR.textSubtle }}>○</span>
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
            backgroundColor: COLOR.accent,
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          View full dashboard →
        </a>
      </div>

      <hr style={{ border: 0, borderTop: `1px solid ${COLOR.border}`, margin: "24px 4px" }} />

      <div style={{ fontSize: 11, color: COLOR.textMuted, textAlign: "center", lineHeight: 1.6 }}>
        NOT. · {clientName} — {projectName}
        <br />
        Questions? Just reply to this email.
        <br />
        <span style={{ color: COLOR.textSubtle }}>
          NOT. SAS · 12 rue de l&apos;Exemple, 75001 Paris ·{" "}
          <a href="#" style={{ color: COLOR.textSubtle }}>
            Unsubscribe
          </a>
        </span>
      </div>
    </div>
  );
}
