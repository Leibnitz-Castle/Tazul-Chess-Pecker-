import { Card, CardHead } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";
import { getWoodpeckerStats } from "@/lib/db";
import { fmtMs, fmtAccuracy } from "@/lib/training/metrics";
import Link from "next/link";

async function getStats() {
  try {
    return await getWoodpeckerStats();
  } catch {
    return null;
  }
}

function RadarChart({ data, size = 220 }: { data: { axis: string; value: number }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 34, n = data.length;
  const pt = (i: number, r: number): [number, number] => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = data.map((d, i) => pt(i, R * d.value).join(",")).join(" ");
  return (
    <svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((g, i) => (
        <polygon
          key={i}
          points={data.map((_, j) => pt(j, R * g).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(200,169,107,0.18)" stroke="var(--amber)" strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = pt(i, R * d.value);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--amber)" />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 18);
        return (
          <text key={i} x={x} y={y} fill="var(--text-2)" fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="middle">
            {d.axis}
          </text>
        );
      })}
    </svg>
  );
}

export default async function ProfilePage() {
  const stats = await getStats();
  const hasData = stats && stats.totalSolved > 0;

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div
        className="flex items-center gap-6"
        style={{
          marginBottom: 28,
          padding: "24px 28px",
          background: "linear-gradient(150deg, rgba(200,169,107,.06), var(--surface))",
          border: "1px solid rgba(200,169,107,.22)",
          borderRadius: 14,
        }}
      >
        <Avatar name="A" size={72} />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Player</h1>
            <Badge variant="amber">
              <Icon name="bolt" size={11} fill /> Woodpecker Practitioner
            </Badge>
          </div>
          <p className="text-text-secondary" style={{ fontSize: 14, marginTop: 4 }}>
            {hasData
              ? `${stats.totalSolved} exercises solved across all cycles`
              : "Start your first Woodpecker series to track progress"}
          </p>
        </div>
        {hasData && stats.recentCycles.length > 0 && (
          <div
            className="flex items-center gap-2 h-9 px-4 rounded-full border"
            style={{
              background: "var(--amber-ghost)",
              borderColor: "rgba(200,169,107,.32)",
              color: "var(--amber-bright)",
              fontWeight: 650,
              fontSize: 14,
            }}
          >
            <Icon name="flame" size={15} fill />
            {stats.recentCycles.length} cycles completed
          </div>
        )}
      </div>

      {!hasData ? (
        /* Empty state */
        <Card style={{ padding: "56px 32px", textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "var(--amber-ghost)",
              color: "var(--amber)",
              margin: "0 auto 20px",
            }}
          >
            <Icon name="puzzle" size={26} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No training history yet</div>
          <p className="text-text-secondary" style={{ fontSize: 14, marginBottom: 24 }}>
            Complete your first Woodpecker series to see your accuracy, average time, streaks, and progress charts here.
          </p>
          <Link href="/practice">
            <button
              className="inline-flex items-center gap-2 px-5 h-10 rounded-[10px] font-semibold text-[14px] cursor-pointer"
              style={{
                background: "var(--amber)",
                color: "#1E1812",
              }}
            >
              <Icon name="bolt" size={15} /> Start Woodpecker Training
            </button>
          </Link>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, gridColumn: "span 2" }}>
            {[
              { label: "Total solved", value: stats.totalSolved.toString(), icon: "check" },
              { label: "Accuracy", value: fmtAccuracy(stats.accuracy), icon: "target" },
              { label: "Avg time / puzzle", value: fmtMs(stats.averageTimeMs), icon: "clock" },
              { label: "Best streak", value: `${stats.bestStreak} in a row`, icon: "flame" },
              {
                label: "WM1 progress",
                value: fmtAccuracy(stats.wm1Progress),
                icon: "book",
              },
              {
                label: "WM2 progress",
                value: fmtAccuracy(stats.wm2Progress),
                icon: "book",
              },
            ].map((s) => (
              <Card key={s.label}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="eyebrow">{s.label}</div>
                  <Icon name={s.icon} size={14} style={{ color: "var(--text-3)" }} />
                </div>
                <div style={{ fontWeight: 750, letterSpacing: "-0.03em", fontSize: 26, color: "var(--amber)" }}>
                  {s.value}
                </div>
              </Card>
            ))}

            {/* WM1 / WM2 progress bars */}
            <Card style={{ gridColumn: "span 2" }}>
              <CardHead title="Book Progress" icon="book" />
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  { label: "The Woodpecker Method (WM1)", value: stats.wm1Progress },
                  { label: "The Woodpecker Method 2 (WM2)", value: stats.wm2Progress },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                      <span className="text-text-secondary" style={{ fontSize: 13 }}>{p.label}</span>
                      <span className="mono tnum font-bold text-amber" style={{ fontSize: 13 }}>
                        {fmtAccuracy(p.value)}
                      </span>
                    </div>
                    <Progress value={p.value} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Active series panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats.activeSeries.length > 0 && (
              <Card>
                <CardHead title="Active Series" icon="bolt" />
                {stats.activeSeries.map((s) => (
                  <Link key={s.id} href={`/practice/series/${s.id}`}>
                    <div
                      className="hover:bg-bg-elevated transition-colors"
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid var(--line-soft)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                      <Progress value={s.totalItems > 0 ? s.currentIndex / s.totalItems : 0} />
                      <div className="text-text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                        {s.currentIndex}/{s.totalItems} solved
                      </div>
                    </div>
                  </Link>
                ))}
              </Card>
            )}

            {/* Radar placeholder */}
            <Card>
              <CardHead title="Tactics Skill" icon="target" />
              <div className="flex justify-center">
                <RadarChart
                  data={[
                    { axis: "Tactics", value: Math.min(1, stats.accuracy * 1.1) },
                    { axis: "Speed", value: Math.min(1, stats.averageTimeMs > 0 ? Math.max(0.1, 1 - stats.averageTimeMs / 120000) : 0.1) },
                    { axis: "WM1", value: stats.wm1Progress },
                    { axis: "WM2", value: stats.wm2Progress },
                    { axis: "Streak", value: Math.min(1, stats.bestStreak / 20) },
                  ]}
                  size={200}
                />
              </div>
              <p className="text-text-muted text-center" style={{ fontSize: 11, marginTop: 8 }}>
                Based on {stats.totalSolved} solved exercises
              </p>
            </Card>
          </div>

          {/* Recent cycles */}
          <Card style={{ gridColumn: "span 3" }}>
            <CardHead title="Recent Cycles" icon="clock" />
            {stats.recentCycles.length === 0 ? (
              <p className="text-text-muted" style={{ fontSize: 13, padding: "16px 0" }}>
                No completed cycles yet.
              </p>
            ) : (
              <div>
                {stats.recentCycles.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between"
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        i < stats.recentCycles.length - 1 ? "1px solid var(--line-soft)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-text-muted mono" style={{ fontSize: 12, width: 72 }}>
                        {(c.startedAt instanceof Date ? c.startedAt : new Date(c.startedAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {c.seriesTitle} · Cycle {c.cycleNumber}
                        </div>
                        <div className="text-text-muted" style={{ fontSize: 12 }}>
                          {c.solvedCount} puzzles · {fmtMs(c.totalTimeMs)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color:
                            c.accuracy >= 0.85
                              ? "var(--green)"
                              : c.accuracy >= 0.70
                              ? "var(--warning)"
                              : "var(--red)",
                        }}
                      >
                        {fmtAccuracy(c.accuracy)}
                      </span>
                      <Badge variant={c.status === "COMPLETED" ? "green" : "default"}>
                        {c.status === "COMPLETED" ? "complete" : "active"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
