"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";

const OpeningPracticeComponent = dynamic(
  () => import("@/components/openings/OpeningPractice").then((m) => m.OpeningPractice),
  { ssr: false }
);
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHead } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RepertoireCard } from "@/components/openings/RepertoireCard";
import { OpeningLineList } from "@/components/openings/OpeningLineList";
import { OpeningBoardPanel } from "@/components/openings/OpeningBoardPanel";
import { EcoBadge } from "@/components/openings/EcoBadge";
import { StatusDot } from "@/components/openings/StatusDot";
import { MasteryRing } from "@/components/openings/MasteryRing";
import type { MasteryStatus } from "@/lib/openings/opening-types";

type Tab =
  | "dashboard"
  | "practice"
  | "tree"
  | "weak"
  | "eco"
  | "import";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "My Repertoires" },
  { id: "practice", label: "Practice" },
  { id: "tree", label: "Opening Tree" },
  { id: "weak", label: "Weaknesses" },
  { id: "eco", label: "ECO Explorer" },
  { id: "import", label: "Import PGN" },
];

interface LineData {
  id: string;
  repertoireId: string;
  name: string;
  eco: string | null;
  side: string;
  pgn: string;
  moveCount: number;
  isMainLine: boolean;
  orderIndex: number;
  metrics: {
    attempts: number;
    accuracy: number;
    mastery: MasteryStatus;
    isWeak: boolean;
    isDueForReview: boolean;
    correct: number;
    incorrect: number;
    avgTimeMs: number;
    lastPracticedAt: Date | null;
  };
  nodes: {
    id: string;
    san: string;
    uci: string;
    fenBefore: string;
    fenAfter: string;
    moveNumber: number;
    ply: number;
  }[];
}

interface RepertoireData {
  id: string;
  name: string;
  color: string;
  description: string | null;
  sourceName: string;
  metrics: {
    totalLines: number;
    totalNodes: number;
    memorization: number;
    weakLines: number;
    dueForReview: number;
  };
  lines: LineData[];
}

interface OpeningsModuleProps {
  repertoires: RepertoireData[];
}

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function OpeningsModule({ repertoires }: OpeningsModuleProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [selectedRepId, setSelectedRepId] = useState<string | null>(
    repertoires[0]?.id ?? null
  );
  const [selectedLineId, setSelectedLineId] = useState<string | null>(
    repertoires[0]?.lines[0]?.id ?? null
  );
  const [lineSearch, setLineSearch] = useState("");

  const hasRepertoires = repertoires.length > 0;
  const selectedRep = repertoires.find((r) => r.id === selectedRepId) ?? null;
  const selectedLine =
    selectedRep?.lines.find((l) => l.id === selectedLineId) ?? null;
  const allLines = repertoires.flatMap((r) => r.lines);

  const openRep = (repId: string) => {
    setSelectedRepId(repId);
    const rep = repertoires.find((r) => r.id === repId);
    if (rep?.lines.length) setSelectedLineId(rep.lines[0].id);
    setTab("tree");
  };

  const openPractice = (lineId?: string) => {
    if (lineId) setSelectedLineId(lineId);
    setTab("practice");
  };

  // Collect all lines with weak status from all repertoires
  const weakLines = allLines
    .filter((l) => l.metrics.isWeak)
    .sort((a, b) => a.metrics.accuracy - b.metrics.accuracy);

  // ECO grouped
  const ecoMap = new Map<
    string,
    { lines: number; attempts: number; accuracy: number | null; family: string }
  >();
  for (const line of allLines) {
    if (!line.eco) continue;
    const prev = ecoMap.get(line.eco) ?? {
      lines: 0,
      attempts: 0,
      accuracy: null,
      family: line.eco[0],
    };
    prev.lines++;
    if (line.metrics.attempts > 0) {
      prev.attempts += line.metrics.attempts;
      prev.accuracy =
        prev.accuracy === null
          ? line.metrics.accuracy
          : (prev.accuracy + line.metrics.accuracy) / 2;
    }
    ecoMap.set(line.eco, prev);
  }
  const ecoEntries = Array.from(ecoMap.entries())
    .map(([eco, d]) => ({ eco, ...d }))
    .sort((a, b) => a.eco.localeCompare(b.eco));

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div
        className="flex items-end justify-between flex-wrap gap-3"
        style={{ marginBottom: 18 }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              lineHeight: 1.16,
            }}
          >
            Aperturas Pecker
          </h1>
          <p
            className="text-text-secondary"
            style={{ fontSize: 14, marginTop: 4 }}
          >
            Build, test, and refine your opening repertoire.
          </p>
        </div>
        {!hasRepertoires && (
          <Button
            variant="amber"
            icon="upload"
            onClick={() => setTab("import")}
          >
            Import Repertoire
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--line)",
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              height: 40,
              padding: "0 14px",
              fontSize: 13.5,
              fontWeight: 600,
              color: tab === t.id ? "var(--amber)" : "var(--text-3)",
              borderBottom:
                tab === t.id
                  ? "2px solid var(--amber)"
                  : "2px solid transparent",
              marginBottom: -1,
              transition: "color .14s, border-color .16s",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── My Repertoires ────────────────────────────────────────── */}
      {tab === "dashboard" && (
        <div className="animate-fade-in">
          {!hasRepertoires ? (
            <EmptyRepertoires onImport={() => setTab("import")} />
          ) : (
            <>
              {/* Stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                {[
                  {
                    label: "Total lines",
                    value: allLines.length,
                    icon: "layers",
                  },
                  {
                    label: "Due for review",
                    value: repertoires.reduce(
                      (s, r) => s + r.metrics.dueForReview,
                      0
                    ),
                    icon: "clock",
                    amber: true,
                  },
                  {
                    label: "Avg memorization",
                    value:
                      repertoires.length > 0
                        ? Math.round(
                            (repertoires.reduce(
                              (s, r) => s + r.metrics.memorization,
                              0
                            ) /
                              repertoires.length) *
                              100
                          ) + "%"
                        : "0%",
                    icon: "target",
                  },
                  {
                    label: "Weak lines",
                    value: weakLines.length,
                    icon: "bolt",
                    sub: "< 60% accuracy",
                  },
                ].map((stat) => (
                  <Card key={stat.label} pad>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{ fontSize: 12.5, color: "var(--text-3)", fontWeight: 600 }}
                      >
                        {stat.label}
                      </span>
                      <span style={{ color: "var(--text-3)" }}>
                        <Icon name={stat.icon} size={14} />
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: stat.amber ? "var(--amber)" : "var(--text)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {stat.value}
                    </div>
                    {stat.sub && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-3)",
                          marginTop: 3,
                        }}
                      >
                        {stat.sub}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Repertoire cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                {repertoires.map((rep) => (
                  <RepertoireCard
                    key={rep.id}
                    id={rep.id}
                    name={rep.name}
                    color={rep.color}
                    metrics={rep.metrics}
                    onStudy={() => openRep(rep.id)}
                    onPractice={() => {
                      setSelectedRepId(rep.id);
                      openPractice(rep.lines[0]?.id);
                    }}
                    onTree={() => openRep(rep.id)}
                  />
                ))}
              </div>

              {/* Weak lines */}
              {weakLines.length > 0 && (
                <Card>
                  <CardHead
                    title="Weak lines — review recommended"
                    icon="target"
                    action={
                      <Button
                        size="sm"
                        variant="ghost"
                        iconRight="chevRight"
                        onClick={() => setTab("weak")}
                      >
                        See all
                      </Button>
                    }
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {weakLines.slice(0, 5).map((l) => (
                      <div
                        key={l.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "11px 4px",
                          borderTop: "1px solid var(--line-soft, var(--line))",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            minWidth: 0,
                          }}
                        >
                          <StatusDot status={l.metrics.mastery} />
                          {l.eco && <EcoBadge eco={l.eco} />}
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {l.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: 12.5,
                              fontFamily: "var(--mono)",
                              color: "var(--red, #A44D45)",
                              minWidth: 38,
                              textAlign: "right",
                            }}
                          >
                            {Math.round(l.metrics.accuracy * 100)}%
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPractice(l.id)}
                          >
                            Practice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Practice ──────────────────────────────────────────────── */}
      {tab === "practice" && (
        <div className="animate-fade-in">
          {!hasRepertoires ? (
            <EmptyRepertoires onImport={() => setTab("import")} />
          ) : (
            <OpeningsPracticeTab
              allLines={allLines}
              initialLineId={selectedLineId}
            />
          )}
        </div>
      )}

      {/* ── Opening Tree ──────────────────────────────────────────── */}
      {tab === "tree" && (
        <div className="animate-fade-in">
          {!hasRepertoires ? (
            <EmptyRepertoires onImport={() => setTab("import")} />
          ) : (
            <OpeningsTreeTab
              repertoires={repertoires}
              selectedRepId={selectedRepId}
              onSelectRep={setSelectedRepId}
              selectedLineId={selectedLineId}
              onSelectLine={setSelectedLineId}
              lineSearch={lineSearch}
              onSearchChange={setLineSearch}
              onPractice={openPractice}
            />
          )}
        </div>
      )}

      {/* ── Weaknesses ────────────────────────────────────────────── */}
      {tab === "weak" && (
        <div className="animate-fade-in">
          {weakLines.length === 0 ? (
            <EmptyWeaknesses hasData={hasRepertoires} />
          ) : (
            <WeaknessesTab
              weakLines={weakLines}
              onPractice={openPractice}
            />
          )}
        </div>
      )}

      {/* ── ECO Explorer ──────────────────────────────────────────── */}
      {tab === "eco" && (
        <div className="animate-fade-in">
          {ecoEntries.length === 0 ? (
            <div
              style={{
                padding: "60px 32px",
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 14,
              }}
            >
              Import a repertoire to explore ECO codes.
            </div>
          ) : (
            <EcoExplorerTab entries={ecoEntries} />
          )}
        </div>
      )}

      {/* ── Import PGN ────────────────────────────────────────────── */}
      {tab === "import" && (
        <div className="animate-fade-in">
          <ImportPgnTab hasRepertoires={hasRepertoires} repertoires={repertoires} />
        </div>
      )}
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

function EmptyRepertoires({ onImport }: { onImport: () => void }) {
  return (
    <Card
      style={{
        padding: "60px 32px",
        textAlign: "center",
        maxWidth: 520,
        margin: "24px auto",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          display: "grid",
          placeItems: "center",
          background: "var(--amber-ghost)",
          color: "var(--amber)",
          margin: "0 auto 22px",
        }}
      >
        <Icon name="openings" size={30} />
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
          color: "var(--text)",
        }}
      >
        No repertoire yet
      </div>
      <p
        className="text-text-secondary"
        style={{
          fontSize: 14,
          marginBottom: 22,
          maxWidth: 360,
          marginInline: "auto",
          lineHeight: 1.6,
        }}
      >
        Export your lines from ChessBase, place the PGN files in{" "}
        <code
          style={{
            fontFamily: "var(--mono)",
            background: "var(--surface-2)",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          data/private/openings/
        </code>
        , then run{" "}
        <code
          style={{
            fontFamily: "var(--mono)",
            background: "var(--surface-2)",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          npm run openings:import
        </code>
        .
      </p>
      <Button variant="amber" icon="upload" onClick={onImport}>
        How to import
      </Button>
    </Card>
  );
}

function EmptyWeaknesses({ hasData }: { hasData: boolean }) {
  return (
    <Card
      style={{
        padding: "60px 32px",
        textAlign: "center",
        maxWidth: 480,
        margin: "24px auto",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
          color: "var(--text)",
        }}
      >
        {hasData ? "No weak lines yet" : "No data yet"}
      </div>
      <p
        className="text-text-secondary"
        style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 360, marginInline: "auto" }}
      >
        {hasData
          ? "Keep practicing. Weak lines appear when accuracy drops below 60% with at least 3 attempts."
          : "Import a repertoire and start practicing to see weakness analysis."}
      </p>
    </Card>
  );
}

// ── Practice tab ──────────────────────────────────────────────────────────────

function OpeningsPracticeTab({
  allLines,
  initialLineId,
}: {
  allLines: LineData[];
  initialLineId: string | null;
}) {
  return (
    <OpeningPracticeComponent
      lines={allLines.filter((l) => l.moveCount > 0)}
      initialLineId={initialLineId}
    />
  );
}

// ── Tree tab ──────────────────────────────────────────────────────────────────

function OpeningsTreeTab({
  repertoires,
  selectedRepId,
  onSelectRep,
  selectedLineId,
  onSelectLine,
  lineSearch,
  onSearchChange,
  onPractice,
}: {
  repertoires: RepertoireData[];
  selectedRepId: string | null;
  onSelectRep: (id: string) => void;
  selectedLineId: string | null;
  onSelectLine: (id: string) => void;
  lineSearch: string;
  onSearchChange: (q: string) => void;
  onPractice: (lineId?: string) => void;
}) {
  const selectedRep =
    repertoires.find((r) => r.id === selectedRepId) ?? repertoires[0];
  const selectedLine =
    selectedRep?.lines.find((l) => l.id === selectedLineId) ??
    selectedRep?.lines[0] ??
    null;

  // Parse PGN to show board position
  const getPlyFen = (line: LineData | null, plyCount: number): string => {
    if (!line) return STARTING_FEN;
    try {
      const chess = new Chess();
      const moves = line.pgn
        .replace(/\d+\.\s*/g, "")
        .replace(/\d+\.\.\.\s*/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, plyCount);
      for (const san of moves) {
        try { chess.move(san); } catch { break; }
      }
      return chess.fen();
    } catch {
      return STARTING_FEN;
    }
  };

  const lineNodes = selectedLine
    ? selectedLine.pgn
        .replace(/\d+\.\s*/g, "")
        .replace(/\d+\.\.\.\s*/g, "")
        .split(/\s+/)
        .filter(Boolean)
    : [];

  const [ply, setPly] = useState(lineNodes.length);
  const fen = getPlyFen(selectedLine, ply);

  const lastMoveUci = ply > 0 && selectedLine?.nodes.length
    ? selectedLine.nodes[ply - 1]?.uci
    : undefined;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* Left: Repertoire picker + line list */}
      <Card pad={false} style={{ position: "sticky", top: 80 }}>
        {/* Repertoire selector */}
        <div
          style={{
            padding: "12px 14px 8px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
          >
            {repertoires.map((rep) => (
              <button
                key={rep.id}
                onClick={() => {
                  onSelectRep(rep.id);
                  if (rep.lines.length) onSelectLine(rep.lines[0].id);
                }}
                style={{
                  height: 28,
                  padding: "0 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    selectedRepId === rep.id
                      ? "rgba(200,169,107,.14)"
                      : "var(--surface-2)",
                  border:
                    selectedRepId === rep.id
                      ? "1px solid rgba(200,169,107,.4)"
                      : "1px solid var(--line)",
                  color:
                    selectedRepId === rep.id ? "var(--amber)" : "var(--text-2)",
                  transition: "all .12s",
                }}
              >
                {rep.color === "WHITE" ? "♔" : "♚"} {rep.color}
              </button>
            ))}
          </div>
        </div>

        <OpeningLineList
          lines={selectedRep?.lines ?? []}
          selectedId={selectedLineId}
          onSelect={(id) => {
            onSelectLine(id);
            setPly(
              (selectedRep?.lines.find((l) => l.id === id)?.moveCount ?? 0)
            );
          }}
          searchQuery={lineSearch}
          onSearchChange={onSearchChange}
        />
      </Card>

      {/* Right: Board + line viewer + details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selectedLine ? (
          <>
            <Card>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) minmax(240px,0.7fr)",
                  gap: 20,
                  alignItems: "start",
                }}
              >
                {/* Board */}
                <div>
                  <OpeningBoardPanel
                    fen={fen}
                    orientation={
                      selectedLine.side === "black" ? "black" : "white"
                    }
                    lastMove={
                      lastMoveUci
                        ? {
                            from: lastMoveUci.slice(0, 2),
                            to: lastMoveUci.slice(2, 4),
                          }
                        : undefined
                    }
                  />
                  {/* Nav buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPly(0)}
                      disabled={ply === 0}
                    >
                      <Icon name="prev" size={14} style={{ transform: "rotate(180deg)" }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPly((p) => Math.max(0, p - 1))}
                      disabled={ply === 0}
                    >
                      <Icon name="prev" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPly((p) => Math.min(lineNodes.length, p + 1))}
                      disabled={ply >= lineNodes.length}
                    >
                      <Icon name="next" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPly(lineNodes.length)}
                      disabled={ply >= lineNodes.length}
                    >
                      <Icon name="next" size={14} style={{ transform: "rotate(180deg)" }} />
                    </Button>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        fontFamily: "var(--mono)",
                        marginLeft: 8,
                      }}
                    >
                      {ply}/{lineNodes.length}
                    </span>
                  </div>
                </div>

                {/* PGN move list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {selectedLine.eco && <EcoBadge eco={selectedLine.eco} />}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {selectedLine.name}
                    </span>
                  </div>

                  {/* Move list */}
                  <div
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: 10,
                      maxHeight: 280,
                      overflowY: "auto",
                    }}
                  >
                    {lineNodes.length === 0 ? (
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                        No moves
                      </span>
                    ) : (
                      (() => {
                        const pairs: { n: number; w: string; b: string | null; wi: number; bi: number }[] = [];
                        for (let i = 0; i < lineNodes.length; i += 2) {
                          pairs.push({
                            n: Math.floor(i / 2) + 1,
                            w: lineNodes[i],
                            b: lineNodes[i + 1] ?? null,
                            wi: i,
                            bi: i + 1,
                          });
                        }
                        return pairs.map((p) => (
                          <div
                            key={p.n}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "32px 1fr 1fr",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--text-3)",
                                textAlign: "right",
                                paddingRight: 6,
                                fontFamily: "var(--mono)",
                              }}
                            >
                              {p.n}.
                            </span>
                            <button
                              onClick={() => setPly(p.wi + 1)}
                              style={{
                                textAlign: "left",
                                fontSize: 13,
                                fontWeight: 600,
                                fontFamily: "var(--mono)",
                                padding: "4px 8px",
                                borderRadius: 6,
                                cursor: "pointer",
                                background:
                                  ply === p.wi + 1
                                    ? "var(--amber-ghost)"
                                    : "transparent",
                                color:
                                  ply === p.wi + 1
                                    ? "var(--amber)"
                                    : "var(--text-2)",
                                border: "none",
                                transition: "all .12s",
                              }}
                            >
                              {p.w}
                            </button>
                            {p.b ? (
                              <button
                                onClick={() => setPly(p.bi + 1)}
                                style={{
                                  textAlign: "left",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  fontFamily: "var(--mono)",
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  background:
                                    ply === p.bi + 1
                                      ? "var(--amber-ghost)"
                                      : "transparent",
                                  color:
                                    ply === p.bi + 1
                                      ? "var(--amber)"
                                      : "var(--text-2)",
                                  border: "none",
                                  transition: "all .12s",
                                }}
                              >
                                {p.b}
                              </button>
                            ) : (
                              <span />
                            )}
                          </div>
                        ));
                      })()
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      variant="amber"
                      size="sm"
                      icon="bolt"
                      onClick={() => onPractice(selectedLine.id)}
                    >
                      Practice
                    </Button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <StatusDot status={selectedLine.metrics.mastery} />
                      <MasteryRing
                        value={selectedLine.metrics.accuracy}
                        size={22}
                        stroke={3}
                        status={selectedLine.metrics.mastery}
                      />
                      <span
                        style={{ fontSize: 12, color: "var(--text-3)" }}
                      >
                        {selectedLine.metrics.attempts === 0
                          ? "Not practiced"
                          : `${Math.round(selectedLine.metrics.accuracy * 100)}% acc · ${selectedLine.metrics.attempts} attempts`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <p style={{ color: "var(--text-3)", fontSize: 14 }}>
              Select a line from the list.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Weaknesses tab ────────────────────────────────────────────────────────────

function WeaknessesTab({
  weakLines,
  onPractice,
}: {
  weakLines: LineData[];
  onPractice: (lineId: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <CardHead title={`${weakLines.length} weak lines`} icon="target" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {weakLines.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 6px",
                borderBottom: "1px solid var(--line-soft, var(--line))",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <StatusDot status="weak" />
                {l.eco && <EcoBadge eco={l.eco} />}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.name}
                  </div>
                  <div
                    style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}
                  >
                    {l.metrics.attempts} attempts · avg{" "}
                    {Math.round(l.metrics.avgTimeMs / 1000)}s
                    {l.metrics.lastPracticedAt
                      ? ` · last practiced ${new Date(l.metrics.lastPracticedAt).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
              </div>
              <div
                style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--mono)",
                    color: "var(--red, #A44D45)",
                    minWidth: 42,
                    textAlign: "right",
                  }}
                >
                  {Math.round(l.metrics.accuracy * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="amber"
                  onClick={() => onPractice(l.id)}
                >
                  Practice
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── ECO Explorer tab ──────────────────────────────────────────────────────────

const ECO_FAMILY_LABELS: Record<string, string> = {
  A: "Flank Openings (A00–A99)",
  B: "Semi-Open — excl. French (B00–B99)",
  C: "Open & French (C00–C99)",
  D: "Closed & Semi-Closed (D00–D99)",
  E: "Indian Defenses (E00–E99)",
};

function EcoExplorerTab({
  entries,
}: {
  entries: { eco: string; family: string; lines: number; attempts: number; accuracy: number | null }[];
}) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const families = Array.from(new Set(entries.map((e) => e.family))).sort();
  const filtered = selectedFamily
    ? entries.filter((e) => e.family === selectedFamily)
    : entries;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Family filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedFamily(null)}
          style={{
            height: 30,
            padding: "0 14px",
            borderRadius: 6,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            background: !selectedFamily ? "rgba(200,169,107,.14)" : "var(--surface-2)",
            border: !selectedFamily ? "1px solid rgba(200,169,107,.4)" : "1px solid var(--line)",
            color: !selectedFamily ? "var(--amber)" : "var(--text-2)",
          }}
        >
          All
        </button>
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFamily(f === selectedFamily ? null : f)}
            style={{
              height: 30,
              padding: "0 14px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              background: selectedFamily === f ? "rgba(200,169,107,.14)" : "var(--surface-2)",
              border: selectedFamily === f ? "1px solid rgba(200,169,107,.4)" : "1px solid var(--line)",
              color: selectedFamily === f ? "var(--amber)" : "var(--text-2)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {selectedFamily && (
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          {ECO_FAMILY_LABELS[selectedFamily] ?? `Group ${selectedFamily}`}
        </p>
      )}

      <Card pad={false}>
        {filtered.map((entry) => (
          <div
            key={entry.eco}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr auto",
              gap: 14,
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: "1px solid var(--line-soft, var(--line))",
            }}
          >
            <EcoBadge eco={entry.eco} />
            <div>
              <div
                style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}
              >
                {entry.lines} line{entry.lines !== 1 ? "s" : ""}
              </div>
              {entry.attempts > 0 && (
                <div
                  style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}
                >
                  {entry.attempts} attempts
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              {entry.accuracy !== null ? (
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--mono)",
                    color:
                      entry.accuracy >= 0.85
                        ? "var(--green, #4E8A62)"
                        : entry.accuracy < 0.6
                        ? "var(--red, #A44D45)"
                        : "var(--warning, #C48A41)",
                  }}
                >
                  {Math.round(entry.accuracy * 100)}%
                </span>
              ) : (
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  not studied
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Import PGN tab ────────────────────────────────────────────────────────────

function ImportPgnTab({
  hasRepertoires,
  repertoires,
}: {
  hasRepertoires: boolean;
  repertoires: RepertoireData[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 0.85fr",
        gap: 20,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <CardHead title="Import Instructions" icon="upload" />
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {[
              {
                step: 1,
                text: (
                  <>
                    Export your repertoire from <strong>ChessBase</strong> as
                    PGN (File → Export → PGN).
                  </>
                ),
              },
              {
                step: 2,
                text: (
                  <>
                    Place the white repertoire at:{" "}
                    <code
                      style={{
                        fontFamily: "var(--mono)",
                        background: "var(--surface-2)",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      data/private/openings/repertoire_white.pgn
                    </code>
                  </>
                ),
              },
              {
                step: 3,
                text: (
                  <>
                    Place the black repertoire at:{" "}
                    <code
                      style={{
                        fontFamily: "var(--mono)",
                        background: "var(--surface-2)",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      data/private/openings/repertoire_black.pgn
                    </code>
                  </>
                ),
              },
              {
                step: 4,
                text: (
                  <>
                    Run in the terminal:{" "}
                    <code
                      style={{
                        fontFamily: "var(--mono)",
                        background: "var(--surface-2)",
                        padding: "1px 5px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      npm run openings:import
                    </code>
                  </>
                ),
              },
              {
                step: 5,
                text: "Reload this page — your repertoires will appear in My Repertoires.",
              },
            ].map(({ step, text }) => (
              <div
                key={step}
                style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    background: "var(--amber-ghost)",
                    color: "var(--amber)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {step}
                </span>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "var(--text-2)",
                    lineHeight: 1.6,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHead title="Reimport" icon="refresh" />
          <p
            style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}
          >
            To delete existing data and re-import from scratch:
          </p>
          <code
            style={{
              display: "block",
              fontFamily: "var(--mono)",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12.5,
              color: "var(--text)",
            }}
          >
            npm run openings:reimport
          </code>
        </Card>
      </div>

      {/* Right: status panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <CardHead title="Import Status" icon="check" />
          {hasRepertoires ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {repertoires.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background:
                      "linear-gradient(120deg, rgba(78,138,98,.08), var(--surface))",
                    border: "1px solid rgba(78,138,98,.25)",
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: "rgba(78,138,98,.14)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--green, #4E8A62)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <div
                      style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}
                    >
                      {rep.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}
                    >
                      {rep.metrics.totalLines} lines · {rep.metrics.totalNodes} nodes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: 14,
              }}
            >
              No repertoires imported yet.
            </div>
          )}
        </Card>

        <Card>
          <CardHead title="Privacy Note" icon="lichess" />
          <p
            style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}
          >
            PGN files in <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>data/private/</code> are{" "}
            <strong>never committed to Git</strong>. They remain on your local
            machine only. The import script reads them once and stores the data
            in your local PostgreSQL database.
          </p>
        </Card>
      </div>
    </div>
  );
}
