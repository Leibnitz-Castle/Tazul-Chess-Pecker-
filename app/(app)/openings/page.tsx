import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export default function OpeningsPage() {
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
        <Icon name="openings" size={30} />
      </span>
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Aperturas Pecker</h1>
      <p className="text-text-secondary" style={{ fontSize: 14, maxWidth: 380 }}>
        Opening repertoire drills from elite games. Train your lines until they&apos;re reflex.
        Coming in a future release.
      </p>
      <Badge variant="amber" style={{ height: 26 }}>On the roadmap</Badge>
    </div>
  );
}
