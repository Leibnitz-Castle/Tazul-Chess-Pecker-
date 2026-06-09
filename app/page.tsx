import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { HeroBoardDisplay } from "@/components/chess/HeroBoardDisplay";

const FEATURES = [
  {
    icon: "target",
    title: "Practice Pecker",
    body: "Spaced-repetition tactics trainer using the Woodpecker Method. 2179 real exercises from the books by Axel Smith.",
  },
  {
    icon: "openings",
    title: "Aperturas Pecker",
    body: "Opening repertoire drills from elite games. Train your lines until they're reflex.",
  },
  {
    icon: "warehouse",
    title: "Elite Warehouse",
    body: "500,000 games from 2400+ players. Mine positions, study plans, extract tactics.",
  },
];

const STATS = [
  ["2,179", "Woodpecker exercises"],
  ["2", "books covered"],
  ["1800–2600+", "target rating"],
  ["∞", "cycles"],
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(900px 480px at 72% -8%, rgba(200,169,107,.05), transparent 62%), var(--bg)",
      }}
    >
      {/* Nav */}
      <header
        className="flex items-center justify-between"
        style={{ height: 72, padding: "0 32px", maxWidth: 1280, margin: "0 auto" }}
      >
        <Logo size={22} />
        <Link href="/dashboard">
          <Button variant="amber" icon="bolt">
            Enter Platform
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section
        style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 32px 0" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
            minHeight: "52vh",
          }}
        >
          <div className="flex flex-col gap-6">
            <Badge variant="amber" style={{ alignSelf: "flex-start" }}>
              <Icon name="bolt" size={12} fill /> Built for serious players · 1800–2600+
            </Badge>
            <h1
              style={{
                fontSize: 52,
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.035em",
                color: "var(--text)",
              }}
            >
              Train like the GMs.
              <br />
              <span style={{ color: "var(--amber)" }}>Think</span> like the best.
            </h1>
            <p
              className="text-text-secondary"
              style={{ fontSize: 17, maxWidth: 440, lineHeight: 1.55 }}
            >
              The Woodpecker Method in your browser. 2179 real exercises, spaced repetition,
              zero fluff.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/practice">
                <Button variant="amber" size="lg" icon="bolt">
                  Start Training
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="lg" iconRight="arrowRight">
                  View dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero board — chessground, Ruy López position */}
          <div className="relative" style={{ maxWidth: 420, marginLeft: "auto" }}>
            <HeroBoardDisplay />
            <div
              style={{ position: "absolute", bottom: -10, left: 8, height: 28 }}
            >
              <Badge variant="amber">
                <Icon name="bolt" size={12} fill /> Woodpecker Method · real positions
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 32px 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <Card key={i} hover>
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--amber-ghost)",
                  color: "var(--amber)",
                  marginBottom: 16,
                }}
              >
                <Icon name={f.icon} size={20} />
              </span>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </div>
              <p className="text-text-secondary" style={{ fontSize: 14, lineHeight: 1.55 }}>
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 32px 80px" }}>
        <Card style={{ background: "linear-gradient(180deg,#15161b,#101115)" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}
          >
            {STATS.map(([n, l], i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1"
                style={{
                  padding: "4px 0",
                  borderRight:
                    i < STATS.length - 1 ? "1px solid var(--line-soft)" : undefined,
                }}
              >
                <div
                  style={{
                    fontWeight: 750,
                    letterSpacing: "-0.03em",
                    fontSize: 30,
                    color: "var(--amber)",
                  }}
                >
                  {n}
                </div>
                <div className="eyebrow">{l}</div>
              </div>
            ))}
          </div>
        </Card>
        <div
          className="text-text-muted text-center"
          style={{ marginTop: 20, fontSize: 12.5 }}
        >
          Built for serious players. Dark mode, always.
        </div>
      </section>
    </div>
  );
}
