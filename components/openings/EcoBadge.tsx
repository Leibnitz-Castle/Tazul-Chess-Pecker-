"use client";

const ECO_COLORS: Record<string, string> = {
  A: "#6E8BAB",
  B: "#C48A41",
  C: "#C8A96B",
  D: "#4E8A62",
  E: "#A4795B",
};

export function EcoBadge({ eco }: { eco: string | null | undefined }) {
  if (!eco) return null;
  const color = ECO_COLORS[eco[0]] ?? "var(--text-2)";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".02em",
        padding: "2px 7px",
        borderRadius: 4,
        background: "var(--surface-2)",
        border: `1px solid ${color}55`,
        color,
        fontFamily: "var(--mono)",
        flexShrink: 0,
      }}
    >
      {eco}
    </span>
  );
}
