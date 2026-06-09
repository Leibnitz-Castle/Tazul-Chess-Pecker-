import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { getPracticeStats, getTrainingSeries } from "@/lib/db";
import { CreateSeriesButton } from "@/components/practice/CreateSeriesButton";

const WM1_CHAPTERS = [
  { name: "Easy Exercises", difficulty: "easy", count: 222 },
  { name: "Intermediate Exercises I", difficulty: "intermediate", count: 509 },
  { name: "Intermediate Exercises III", difficulty: "intermediate", count: 254 },
  { name: "Advanced Exercises", difficulty: "advanced", count: 144 },
];

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: "rgba(78,138,98,0.14)", text: "#7DB892" },
  intermediate: { bg: "rgba(196,138,65,0.14)", text: "#D4A44E" },
  advanced: { bg: "rgba(164,77,69,0.15)", text: "#C9817A" },
};

async function getData() {
  try {
    const [stats, activeSeries] = await Promise.all([
      getPracticeStats(),
      getTrainingSeries("ACTIVE"),
    ]);
    return { stats, activeSeries };
  } catch {
    return {
      stats: { total: 2179, wm1: 1145, wm2: 1034, completed: 0 },
      activeSeries: [],
    };
  }
}

export default async function PracticePage() {
  const { stats, activeSeries } = await getData();

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Practice Hub</h1>
          <p className="text-text-secondary" style={{ fontSize: 14, marginTop: 4 }}>
            Your spaced-repetition training. {stats.total.toLocaleString()} Woodpecker exercises ready.
          </p>
        </div>
      </div>

      {/* Continue active series */}
      {activeSeries.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Continue Training</h2>
            <Badge variant="green">Active</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
            {activeSeries.slice(0, 3).map((s) => {
              const cycle = s.cycles[0];
              const pct = s.totalItems > 0 ? s.currentIndex / s.totalItems : 0;
              return (
                <Link key={s.id} href={`/practice/series/${s.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                      <div className="eyebrow">
                        {cycle ? `Cycle ${cycle.cycleNumber}` : "Cycle 1"}
                      </div>
                      <Badge variant="green">
                        <Icon name="bolt" size={10} fill /> Continue
                      </Badge>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>
                      {s.title}
                    </div>
                    <Progress value={pct} />
                    <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                      <span className="text-text-muted" style={{ fontSize: 12 }}>
                        {s.currentIndex} / {s.totalItems} solved
                      </span>
                      <span className="text-text-muted" style={{ fontSize: 12 }}>
                        {Math.round(pct * 100)}%
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total exercises", value: stats.total.toLocaleString(), icon: "puzzle" },
          { label: "WM1 (2018)", value: stats.wm1.toLocaleString(), icon: "book" },
          { label: "WM2 (2022)", value: stats.wm2.toLocaleString(), icon: "book" },
          { label: "Solved", value: stats.completed.toLocaleString(), icon: "check" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div className="eyebrow">{s.label}</div>
              <Icon name={s.icon} size={14} style={{ color: "var(--text-3)" }} />
            </div>
            <div style={{ fontWeight: 750, fontSize: 28, letterSpacing: "-0.03em", color: "var(--amber)" }}>
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Section: Woodpecker Method 1 */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            The Woodpecker Method
          </h2>
          <Badge variant="amber">WM1 · 2018</Badge>
        </div>
        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {WM1_CHAPTERS.map((ch) => {
            const colors = DIFFICULTY_COLORS[ch.difficulty] ?? DIFFICULTY_COLORS.intermediate;
            return (
              <Card key={ch.name} hover className="animate-card-in h-full">
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <span
                    className="inline-flex items-center gap-1 h-[22px] px-[9px] rounded-full text-[11.5px] font-semibold border"
                    style={{ background: colors.bg, color: colors.text, borderColor: `${colors.text}44` }}
                  >
                    {ch.difficulty}
                  </span>
                  <span className="mono tnum text-text-muted" style={{ fontSize: 12 }}>
                    {ch.count} exercises
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 12 }}>
                  {ch.name}
                </div>
                <div className="flex items-center gap-2">
                  <CreateSeriesButton
                    sourceName="The Woodpecker Method"
                    chapter={ch.name}
                    mode="CHAPTER"
                    label="Start Series"
                    variant="amber"
                    size="sm"
                  />
                  <Link href={`/practice/woodpecker?chapter=${encodeURIComponent(ch.name)}`}>
                    <Button variant="outline" size="sm">Browse</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section: Woodpecker Method 2 */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            The Woodpecker Method 2
          </h2>
          <Badge>WM2 · 2022</Badge>
        </div>
        <Card style={{ padding: "20px 24px" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                1,034 exercises · Chapters 1–500+
              </div>
              <p className="text-text-secondary" style={{ fontSize: 13 }}>
                All WM2 playable exercises. No difficulty rating — train all chapters in order.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreateSeriesButton
                sourceName="The Woodpecker Method 2"
                mode="FULL_BOOK"
                label="Start WM2"
                variant="amber"
                size="sm"
              />
              <Link href="/practice/woodpecker?source=The+Woodpecker+Method+2">
                <Button variant="outline" size="sm">Browse</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Coming soon modules */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
          More Training Modes
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {[
            { icon: "openings", title: "Aperturas Pecker", blurb: "Opening repertoire drills. Coming soon." },
            { icon: "warehouse", title: "Elite Warehouse", blurb: "Mine GM game positions. Coming soon." },
          ].map((m) => (
            <Card key={m.title} style={{ opacity: 0.6 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--amber-ghost)",
                  color: "var(--amber)",
                  marginBottom: 12,
                }}
              >
                <Icon name={m.icon} size={18} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{m.title}</div>
              <p className="text-text-muted" style={{ fontSize: 13 }}>{m.blurb}</p>
              <Badge style={{ marginTop: 12 }}>On the roadmap</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
