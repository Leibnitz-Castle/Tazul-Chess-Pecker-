"use client";

type MasteryStatus = "not_studied" | "learning" | "mastered" | "weak" | "due_for_review";

const STATUS_COLORS: Record<MasteryStatus, string> = {
  mastered: "var(--green, #4E8A62)",
  learning: "var(--warning, #C48A41)",
  weak: "var(--red, #A44D45)",
  due_for_review: "var(--warning, #C48A41)",
  not_studied: "var(--surface-3)",
};

interface MasteryRingProps {
  value: number; // 0-1
  size?: number;
  stroke?: number;
  status?: MasteryStatus | null;
}

export function MasteryRing({
  value,
  size = 30,
  stroke = 3.5,
  status,
}: MasteryRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    status && status in STATUS_COLORS
      ? STATUS_COLORS[status]
      : "var(--amber)";

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)" }}
      />
    </svg>
  );
}
