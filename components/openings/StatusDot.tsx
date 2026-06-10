"use client";

type MasteryStatus = "not_studied" | "learning" | "mastered" | "weak" | "due_for_review";

const STATUS_COLORS: Record<MasteryStatus, string> = {
  mastered: "var(--green, #4E8A62)",
  learning: "var(--warning, #C48A41)",
  weak: "var(--red, #A44D45)",
  due_for_review: "var(--warning, #C48A41)",
  not_studied: "var(--surface-3)",
};

export function StatusDot({
  status,
  size = 8,
}: {
  status: MasteryStatus;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: STATUS_COLORS[status] ?? "var(--surface-3)",
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}
