import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export default function EliteWarehousePage() {
  return (
    <div
      className="flex flex-col items-center justify-center animate-fade-in"
      style={{ minHeight: "70vh", textAlign: "center", gap: 16, padding: 28 }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          display: "grid",
          placeItems: "center",
          background: "var(--amber-ghost)",
          color: "var(--amber)",
        }}
      >
        <Icon name="warehouse" size={30} />
      </span>
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Elite Warehouse</h1>
      <p className="text-text-secondary" style={{ fontSize: 14, maxWidth: 380 }}>
        500,000+ games from 2400+ rated players. Mine positions, study plans, extract tactics.
        This module is in development.
      </p>
      <Badge variant="amber" style={{ height: 26 }}>On the roadmap</Badge>
    </div>
  );
}
