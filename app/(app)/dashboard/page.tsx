import { Card, CardHead } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Ring } from "@/components/ui/Ring";
import { Stat } from "@/components/ui/Stat";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

const PERF_SERIES = [1580, 1620, 1590, 1650, 1630, 1680, 1720, 1700, 1740, 1760, 1820, 1800, 1870, 1900, 1880, 1920, 1950, 1940, 1980, 2010, 1990, 2020, 2050, 2080, 2060, 2100, 2120, 2110, 2150, 2140];

const ACTIVE_SETS = [
  { name: "Easy Exercises (WM1)", done: 47, total: 222, status: "active" },
  { name: "Intermediate I (WM1)", done: 12, total: 509, status: "active" },
  { name: "Chapter 1–50 (WM2)", done: 8, total: 50, status: "due" },
];

const STREAK_MINI = [0,1,2,0,1,3,2,1,2,4,3,2,1,2,3,4,3,2,3,4,3,4,3,2,3,4,4,3,2,3,4,4,3,4,3,2,4,3,4,4,3,4,4,3,4,4,4,3,4];

const WEAK_AREAS = [
  { theme: "Back rank mate", accuracy: 0.58, attempts: 24 },
  { theme: "Discovered attack", accuracy: 0.64, attempts: 31 },
  { theme: "Interference", accuracy: 0.71, attempts: 18 },
];

function MiniHeat({ cells }: { cells: number[] }) {
  const LABELS = ["No activity", "1–3 puzzles", "4–9 puzzles", "10–19 puzzles", "20+ puzzles"];
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}
    >
      {cells.map((lvl, i) => (
        <div
          key={i}
          className="animate-heat-in"
          style={{
            "--i": i,
            width: "100%",
            aspectRatio: "1",
            borderRadius: 3,
            background:
              lvl === 0 ? "#221C17" :
              lvl === 1 ? "rgba(200,169,107,.20)" :
              lvl === 2 ? "rgba(200,169,107,.40)" :
              lvl === 3 ? "rgba(200,169,107,.64)" :
              "var(--amber)",
          } as React.CSSProperties}
          title={LABELS[Math.min(lvl, 4)]}
        />
      ))}
    </div>
  );
}

function LineChart({ data, height = 120 }: { data: number[]; height?: number }) {
  const w = 600, pad = 6;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    height - pad - ((v - min) / range) * (height - pad * 2),
  ]);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L${w - pad} ${height} L${pad} ${height} Z`;
  const color = "var(--amber)";
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lcg)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} />
    </svg>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const solvedToday = 23;
  const dailyGoal = 30;

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">{today}</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 6 }}>
          Welcome back, Player.
        </h1>
      </div>

      <div
        className="stagger"
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}
      >
        {/* Today's training */}
        <Card className="animate-card-in">
          <CardHead title="Today's Training" icon="target" />
          <div className="flex items-center gap-5">
            <Ring value={solvedToday / dailyGoal} size={120}>
              <div className="flex flex-col items-center">
                <div style={{ fontWeight: 750, fontSize: 26, letterSpacing: "-0.03em" }}>{solvedToday}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>of {dailyGoal}</div>
              </div>
            </Ring>
            <div className="flex flex-col gap-[10px] justify-center">
              <div>
                <div style={{ fontWeight: 750, fontSize: 22, color: "var(--amber)" }}>
                  {Math.round((solvedToday / dailyGoal) * 100)}%
                </div>
                <div className="eyebrow">of daily goal</div>
              </div>
              <Link href="/practice">
                <Button size="sm" variant="amber" icon="bolt">Resume</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card className="animate-card-in" style={{ gridColumn: "span 2" }}>
          <CardHead
            title="Performance · Puzzle rating (30d)"
            icon="chart"
            action={
              <Badge variant="green">
                <Icon name="arrowRight" size={11} style={{ transform: "rotate(-45deg)" }} /> +107
              </Badge>
            }
          />
          <div className="flex items-end justify-between" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 750, fontSize: 34, letterSpacing: "-0.03em", color: "var(--amber)" }}>
              2,140
            </div>
            <div className="text-text-muted" style={{ fontSize: 12 }}>peak {Math.max(...PERF_SERIES)}</div>
          </div>
          <LineChart data={PERF_SERIES} height={120} />
        </Card>

        {/* Active sets */}
        <Card className="animate-card-in">
          <CardHead
            title="Active Sets"
            icon="layers"
            action={
              <Link href="/practice">
                <button className="text-text-muted hover:text-text-main transition-colors">
                  <Icon name="chevRight" size={16} />
                </button>
              </Link>
            }
          />
          <div className="flex flex-col gap-4">
            {ACTIVE_SETS.map((s) => (
              <div key={s.name} className="flex flex-col gap-[7px]">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                  <span className="mono tnum text-text-muted" style={{ fontSize: 12 }}>
                    {s.done}/{s.total}
                  </span>
                </div>
                <Progress value={s.done / s.total} />
              </div>
            ))}
          </div>
        </Card>

        {/* Streak */}
        <Card className="animate-card-in">
          <CardHead
            title="Current Streak"
            icon="flame"
            action={
              <div
                className="flex items-center gap-[6px] h-8 px-3 rounded-full border"
                style={{
                  background: "var(--amber-ghost)",
                  borderColor: "rgba(200,169,107,.32)",
                  color: "var(--amber-bright)",
                  fontWeight: 650,
                  fontSize: 13,
                }}
              >
                <Icon name="flame" size={13} fill /> 7d
              </div>
            }
          />
          <MiniHeat cells={STREAK_MINI} />
          <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
            <span className="text-text-muted" style={{ fontSize: 12 }}>Last 49 days</span>
            <span className="text-text-muted" style={{ fontSize: 12 }}>
              Longest: <span className="text-amber mono">12d</span>
            </span>
          </div>
        </Card>

        {/* Weak areas */}
        <Card className="animate-card-in">
          <CardHead title="Weak Areas" icon="target" />
          <div className="flex flex-col gap-[14px]">
            {WEAK_AREAS.map((w) => (
              <div key={w.theme} className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{w.theme}</div>
                  <div className="mono text-text-muted" style={{ fontSize: 11.5 }}>
                    {Math.round(w.accuracy * 100)}% · {w.attempts} tries
                  </div>
                </div>
                <Link href="/practice">
                  <Button size="sm" variant="outline">Practice</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        {/* Woodpecker stats */}
        <Card className="animate-card-in" style={{ gridColumn: "span 3" }}>
          <CardHead title="Woodpecker Progress" icon="bolt" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[
              { label: "Total Exercises", value: "2,179", sub: "WM1 + WM2" },
              { label: "Completed", value: "67", sub: "3.1% of total" },
              { label: "Accuracy", value: "74%", sub: "overall" },
              { label: "Avg. Time", value: "1:24", sub: "per puzzle" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[10px] p-4"
                style={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
              >
                <div className="eyebrow">{s.label}</div>
                <div style={{ fontWeight: 750, fontSize: 26, letterSpacing: "-0.03em", marginTop: 8, color: "var(--amber)" }}>
                  {s.value}
                </div>
                <div className="text-text-muted" style={{ fontSize: 12, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
