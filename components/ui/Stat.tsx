import { Card } from "./Card";
import { Icon } from "./Icon";

interface StatProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  primary?: boolean;
  icon?: string;
}

export function Stat({ label, value, sub, accent, primary, icon }: StatProps) {
  return (
    <Card
      style={
        primary
          ? {
              background: "linear-gradient(150deg, rgba(200,169,107,.07), var(--surface))",
              borderColor: "rgba(200,169,107,.28)",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <div className="eyebrow" style={primary ? { color: "var(--amber)" } : undefined}>
          {label}
        </div>
        {icon && (
          <span style={{ color: primary ? "var(--amber)" : "var(--text-3)" }}>
            <Icon name={icon} size={primary ? 17 : 15} />
          </span>
        )}
      </div>
      <div
        className="tnum"
        style={{
          fontWeight: 750,
          letterSpacing: "-0.03em",
          fontSize: primary ? 40 : 30,
          marginTop: primary ? 12 : 10,
          color: accent || primary ? "var(--amber)" : "var(--text)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12.5, marginTop: 4, color: "var(--text-3)" }}>{sub}</div>
      )}
    </Card>
  );
}
