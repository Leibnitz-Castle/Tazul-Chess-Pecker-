import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardHead } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { fmtMs, fmtAccuracy, buildCycleComparisons } from "@/lib/training/metrics";
import { StartNextCycleButton } from "@/components/practice/StartNextCycleButton";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

function StatBlock({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-text-muted" style={{ fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: accent ? "var(--amber)" : "var(--text)" }}>
        {value}
      </div>
      {sub && <div className="text-text-muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default async function SeriesSummaryPage({ params }: PageProps) {
  let series;
  try {
    series = await prisma.trainingSeries.findUnique({
      where: { id: params.id },
      include: {
        cycles: { orderBy: { cycleNumber: "asc" } },
      },
    });
  } catch {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <p className="text-text-secondary">Database error — please try again.</p>
      </div>
    );
  }

  if (!series) notFound();

  const completedCycles = series.cycles.filter((c) => c.status === "COMPLETED");
  const latestCycle = completedCycles[completedCycles.length - 1] ?? series.cycles[series.cycles.length - 1];

  if (!latestCycle) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <p className="text-text-secondary">No cycle data yet.</p>
      </div>
    );
  }

  const comparisons = buildCycleComparisons(completedCycles);

  const accuracyColor =
    latestCycle.accuracy >= 0.85
      ? "var(--green)"
      : latestCycle.accuracy >= 0.65
      ? "var(--warning)"
      : "var(--red)";

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      {/* Back */}
      <Link
        href="/practice"
        className="flex items-center gap-2 text-text-secondary text-[13px] font-semibold hover:text-text-main transition-colors"
        style={{ marginBottom: 24 }}
      >
        <Icon name="arrowLeft" size={15} /> Practice Hub
      </Link>

      {/* Hero */}
      <div
        style={{
          padding: "32px 36px",
          background: "linear-gradient(150deg, rgba(200,169,107,.07), var(--surface))",
          border: "1px solid rgba(200,169,107,.22)",
          borderRadius: 16,
          marginBottom: 24,
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 8 }}>
              <Badge variant="amber">
                <Icon name="check" size={11} fill /> Cycle {latestCycle.cycleNumber} complete
              </Badge>
              <Badge>{series.title}</Badge>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Cycle {latestCycle.cycleNumber} Summary
            </h1>
            <p className="text-text-secondary" style={{ fontSize: 14 }}>
              {series.title} · {latestCycle.totalExercises} exercises
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StartNextCycleButton
              seriesId={params.id}
              cycleNumber={latestCycle.cycleNumber + 1}
            />
          </div>
        </div>

        {/* Main stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 28,
            marginTop: 32,
            paddingTop: 28,
            borderTop: "1px solid var(--line-soft)",
          }}
        >
          <StatBlock
            label="Exercises"
            value={`${latestCycle.solvedCount}/${latestCycle.totalExercises}`}
            accent
          />
          <StatBlock
            label="Accuracy"
            value={fmtAccuracy(latestCycle.accuracy)}
            sub={`${latestCycle.correctCount} correct`}
          />
          <StatBlock
            label="Avg time"
            value={fmtMs(latestCycle.averageTimeMs)}
            sub="per exercise"
          />
          <StatBlock
            label="Best streak"
            value={`${latestCycle.bestStreak}`}
            sub="in a row"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Progress */}
        <Card>
          <CardHead title="Completion" icon="check" />
          <div style={{ marginBottom: 8 }}>
            <Progress value={latestCycle.totalExercises > 0 ? latestCycle.solvedCount / latestCycle.totalExercises : 0} />
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-text-muted">{latestCycle.solvedCount} solved</span>
            <span style={{ fontWeight: 700, color: "var(--amber)" }}>
              {latestCycle.totalExercises > 0
                ? Math.round((latestCycle.solvedCount / latestCycle.totalExercises) * 100)
                : 0}%
            </span>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div
              className="text-center"
              style={{ padding: "12px 8px", borderRadius: 10, background: "rgba(78,138,98,.10)" }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--green)", letterSpacing: "-0.02em" }}>
                {latestCycle.correctCount}
              </div>
              <div className="text-text-muted" style={{ fontSize: 11, marginTop: 2 }}>correct</div>
            </div>
            <div
              className="text-center"
              style={{ padding: "12px 8px", borderRadius: 10, background: "rgba(164,77,69,.10)" }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--red)", letterSpacing: "-0.02em" }}>
                {latestCycle.incorrectCount}
              </div>
              <div className="text-text-muted" style={{ fontSize: 11, marginTop: 2 }}>incorrect</div>
            </div>
          </div>
        </Card>

        {/* Total time */}
        <Card>
          <CardHead title="Time" icon="clock" />
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--amber)", marginBottom: 4 }}>
            {fmtMs(latestCycle.totalTimeMs)}
          </div>
          <div className="text-text-muted" style={{ fontSize: 13, marginBottom: 16 }}>total session time</div>
          <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
            <span className="text-text-secondary">Avg per exercise</span>
            <span className="mono font-bold">{fmtMs(latestCycle.averageTimeMs)}</span>
          </div>
        </Card>
      </div>

      {/* Cycle comparison table */}
      {comparisons.length > 1 && (
        <Card style={{ marginBottom: 20 }}>
          <CardHead title="Cycle Comparison" icon="target" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  {["Cycle", "Solved", "Accuracy", "Avg time", "Streak", "Δ Accuracy", "Δ Speed"].map((h) => (
                    <th
                      key={h}
                      className="text-text-muted"
                      style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c) => (
                  <tr key={c.cycleNumber} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>Cycle {c.cycleNumber}</td>
                    <td style={{ padding: "10px 12px" }} className="mono">{c.solvedCount}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: accuracyColor }}>
                      {fmtAccuracy(c.accuracy)}
                    </td>
                    <td style={{ padding: "10px 12px" }} className="mono">{fmtMs(c.averageTimeMs)}</td>
                    <td style={{ padding: "10px 12px" }} className="mono">{c.bestStreak}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {c.accuracyDelta === null ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <span style={{ color: c.accuracyDelta >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                          {c.accuracyDelta >= 0 ? "+" : ""}{Math.round(c.accuracyDelta * 100)}%
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {c.timeDelta === null ? (
                        <span className="text-text-muted">—</span>
                      ) : (
                        <span style={{ color: c.timeDelta <= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                          {c.timeDelta <= 0 ? "" : "+"}{fmtMs(Math.abs(c.timeDelta))} {c.timeDelta <= 0 ? "faster" : "slower"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CTA */}
      <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 8 }}>
        <StartNextCycleButton seriesId={params.id} cycleNumber={latestCycle.cycleNumber + 1} />
        <Link href="/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    </div>
  );
}
