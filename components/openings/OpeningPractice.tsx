"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { EcoBadge } from "./EcoBadge";
import { StatusDot } from "./StatusDot";
import {
  getUserSide,
  isUserTurn,
  getFenAtIndex,
  getLastMoveUci,
  getAutoMovesFromIndex,
  calculateAccuracyPercent,
  isLineComplete,
  countUserMoveNodes,
  countCompletedUserMoves,
  formatElapsedMs,
  STARTING_FEN,
  type PracticeNode,
  type PracticeStatus,
} from "@/lib/openings/opening-practice-engine";
import type { MasteryStatus } from "@/lib/openings/opening-types";

const ChessgroundBoard = dynamic(
  () =>
    import("@/components/chess/ChessgroundBoard").then(
      (m) => m.ChessgroundBoard
    ),
  { ssr: false }
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineForPractice {
  id: string;
  repertoireId: string;
  name: string;
  eco: string | null;
  side: string;
  pgn: string;
  moveCount: number;
  metrics: { mastery: MasteryStatus; attempts: number; accuracy: number };
  nodes: PracticeNode[];
}

interface OpeningPracticeProps {
  lines: LineForPractice[];
  initialLineId?: string | null;
}

type PracticeMode = "study" | "practice";

// ── Component ─────────────────────────────────────────────────────────────────

export function OpeningPractice({
  lines,
  initialLineId,
}: OpeningPracticeProps) {
  const mainLines = lines.filter((l) => l.moveCount > 0);

  // ── Line selection ──────────────────────────────────────────────────────────
  const [selectedLineId, setSelectedLineId] = useState<string>(
    initialLineId ?? mainLines[0]?.id ?? ""
  );

  const line = mainLines.find((l) => l.id === selectedLineId) ?? mainLines[0];
  const userSide = line ? getUserSide(line.side) : "white";

  // ── Mode toggle ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<PracticeMode>("practice");

  // ── Study mode state ────────────────────────────────────────────────────────
  const [studyIndex, setStudyIndex] = useState(0);

  // ── Practice mode state ─────────────────────────────────────────────────────
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [fen, setFen] = useState(STARTING_FEN);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<PracticeStatus>("WAITING_USER_MOVE");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [lastOpponentSan, setLastOpponentSan] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "practice" && status !== "LINE_COMPLETE") {
      elapsedRef.current = setInterval(() => {
        setElapsed(Date.now() - startedAt);
      }, 1000);
    }
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [mode, status, startedAt]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // ── Auto-play sequence ──────────────────────────────────────────────────────
  // Plays consecutive opponent moves one by one with delays.
  // Runs entirely from passed args (no captured state), so useCallback([]) is safe.
  const playAutoMoves = useCallback(
    (
      nodes: PracticeNode[],
      startIndex: number,
      uSide: "white" | "black"
    ) => {
      const autoMoves = getAutoMovesFromIndex(nodes, startIndex, uSide);
      if (autoMoves.length === 0) {
        setStatus("WAITING_USER_MOVE");
        return;
      }

      setStatus("AUTO_PLAYING");

      autoMoves.forEach((node, i) => {
        const newIndex = startIndex + i + 1;
        const isLast = i === autoMoves.length - 1;

        const t = setTimeout(
          () => {
            setFen(node.fenAfter);
            setLastMove(node.uci);
            setLastOpponentSan(node.san);

            if (isLast) {
              setPracticeIndex(newIndex);
              if (isLineComplete(newIndex, nodes.length)) {
                setStatus("LINE_COMPLETE");
              } else {
                setStatus("WAITING_USER_MOVE");
              }
            }
          },
          (i + 1) * 600
        );

        timers.current.push(t);
      });
    },
    [] // no state deps — all values come from args
  );

  // ── Reset when line changes ─────────────────────────────────────────────────
  useEffect(() => {
    clearTimers();
    if (elapsedRef.current) clearInterval(elapsedRef.current);

    setStudyIndex(0);
    setPracticeIndex(0);
    setFen(STARTING_FEN);
    setLastMove(undefined);
    setStatus("WAITING_USER_MOVE");
    setCorrect(0);
    setIncorrect(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setLastOpponentSan(null);
    setShake(false);

    if (!line || line.nodes.length === 0) return;

    const uSide = getUserSide(line.side);
    const autoMoves = getAutoMovesFromIndex(line.nodes, 0, uSide);
    if (autoMoves.length > 0 && mode === "practice") {
      setStatus("AUTO_PLAYING");
      const t = setTimeout(() => {
        playAutoMoves(line.nodes, 0, uSide);
      }, 300);
      timers.current.push(t);
    }
  }, [selectedLineId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger initial auto-play when switching INTO practice mode
  useEffect(() => {
    if (mode !== "practice") return;
    if (!line || line.nodes.length === 0) return;

    // Only auto-play if we're at the start (not mid-line)
    if (practiceIndex !== 0) return;

    const uSide = getUserSide(line.side);
    const autoMoves = getAutoMovesFromIndex(line.nodes, 0, uSide);
    if (autoMoves.length > 0 && status === "WAITING_USER_MOVE") {
      setStatus("AUTO_PLAYING");
      const t = setTimeout(() => {
        playAutoMoves(line.nodes, 0, uSide);
      }, 300);
      timers.current.push(t);
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearTimers();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [clearTimers]);

  // ── Submit attempt ──────────────────────────────────────────────────────────
  const submitAttempt = useCallback(
    async (
      nodeId: string,
      movePlayed: string,
      expectedMove: string,
      isCorrectMove: boolean,
      attemptType = "PRACTICE"
    ) => {
      try {
        await fetch("/api/openings/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repertoireId: line?.repertoireId,
            lineId: line?.id,
            nodeId,
            movePlayed,
            expectedMove,
            isCorrect: isCorrectMove,
            timeMs: elapsed,
            attemptType,
          }),
        });
      } catch {
        // non-blocking
      }
    },
    [line, elapsed]
  );

  // ── Handle user move ────────────────────────────────────────────────────────
  const handleMove = useCallback(
    async (moveUci: string) => {
      if (!line || status !== "WAITING_USER_MOVE") return;
      if (practiceIndex >= line.nodes.length) return;

      const expectedNode = line.nodes[practiceIndex];
      if (!isUserTurn(expectedNode, userSide)) return;

      const isCorrectMove = moveUci === expectedNode.uci;

      if (isCorrectMove) {
        setCorrect((c) => c + 1);
        setStatus("CORRECT");

        const newIndex = practiceIndex + 1;
        setFen(expectedNode.fenAfter);
        setLastMove(moveUci);
        setPracticeIndex(newIndex);

        submitAttempt(expectedNode.id, moveUci, expectedNode.uci, true);

        if (isLineComplete(newIndex, line.nodes.length)) {
          const t = setTimeout(() => setStatus("LINE_COMPLETE"), 700);
          timers.current.push(t);
          return;
        }

        // Auto-play opponent if their turn is next
        const auto = getAutoMovesFromIndex(line.nodes, newIndex, userSide);
        if (auto.length > 0) {
          const t = setTimeout(
            () => playAutoMoves(line.nodes, newIndex, userSide),
            500
          );
          timers.current.push(t);
        } else {
          const t = setTimeout(() => setStatus("WAITING_USER_MOVE"), 300);
          timers.current.push(t);
        }
      } else {
        setIncorrect((inc) => inc + 1);
        setStatus("INCORRECT");
        setShake(true);
        setLastMove(moveUci);

        submitAttempt(expectedNode.id, moveUci, expectedNode.uci, false);

        const t = setTimeout(() => {
          setShake(false);
          setStatus("WAITING_USER_MOVE");
          setFen(getFenAtIndex(line.nodes, practiceIndex));
          setLastMove(getLastMoveUci(line.nodes, practiceIndex));
        }, 700);
        timers.current.push(t);
      }
    },
    [line, status, practiceIndex, userSide, submitAttempt, playAutoMoves]
  );

  // ── Show move ────────────────────────────────────────────────────────────────
  const handleShowMove = useCallback(() => {
    if (!line) return;
    if (status !== "WAITING_USER_MOVE" && status !== "INCORRECT") return;
    if (practiceIndex >= line.nodes.length) return;

    const node = line.nodes[practiceIndex];
    if (!isUserTurn(node, userSide)) return;

    clearTimers();
    setShake(false);

    setIncorrect((inc) => inc + 1);
    submitAttempt(node.id, "SHOW_MOVE", node.uci, false, "SHOW_MOVE");

    const newIndex = practiceIndex + 1;
    setFen(node.fenAfter);
    setLastMove(node.uci);
    setPracticeIndex(newIndex);
    setStatus("CORRECT");

    if (isLineComplete(newIndex, line.nodes.length)) {
      const t = setTimeout(() => setStatus("LINE_COMPLETE"), 700);
      timers.current.push(t);
      return;
    }

    const auto = getAutoMovesFromIndex(line.nodes, newIndex, userSide);
    if (auto.length > 0) {
      const t = setTimeout(
        () => playAutoMoves(line.nodes, newIndex, userSide),
        500
      );
      timers.current.push(t);
    } else {
      const t = setTimeout(() => setStatus("WAITING_USER_MOVE"), 400);
      timers.current.push(t);
    }
  }, [line, status, practiceIndex, userSide, clearTimers, submitAttempt, playAutoMoves]);

  // ── Restart line ─────────────────────────────────────────────────────────────
  const restartLine = useCallback(() => {
    clearTimers();
    if (elapsedRef.current) clearInterval(elapsedRef.current);

    setPracticeIndex(0);
    setFen(STARTING_FEN);
    setLastMove(undefined);
    setStatus("WAITING_USER_MOVE");
    setCorrect(0);
    setIncorrect(0);
    setStartedAt(Date.now());
    setElapsed(0);
    setLastOpponentSan(null);
    setShake(false);

    if (!line || line.nodes.length === 0) return;

    const uSide = getUserSide(line.side);
    const autoMoves = getAutoMovesFromIndex(line.nodes, 0, uSide);
    if (autoMoves.length > 0) {
      setStatus("AUTO_PLAYING");
      const t = setTimeout(() => playAutoMoves(line.nodes, 0, uSide), 400);
      timers.current.push(t);
    }
  }, [line, clearTimers, playAutoMoves]);

  // ── Next line ────────────────────────────────────────────────────────────────
  const goNextLine = useCallback(() => {
    const idx = mainLines.findIndex((l) => l.id === selectedLineId);
    const next = mainLines[(idx + 1) % mainLines.length];
    if (next) setSelectedLineId(next.id);
  }, [mainLines, selectedLineId]);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (mainLines.length === 0) {
    return (
      <div
        style={{
          padding: "60px 32px",
          textAlign: "center",
          color: "var(--text-3)",
        }}
      >
        <p style={{ fontSize: 15, marginBottom: 16 }}>
          No lines available for practice.
        </p>
        <p style={{ fontSize: 13 }}>
          Import a repertoire first using{" "}
          <strong>npm run openings:import</strong>.
        </p>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalNodes = line?.nodes.length ?? 0;
  const userMoveTotal = line ? countUserMoveNodes(line.nodes, userSide) : 0;
  const userMoveDone = line
    ? countCompletedUserMoves(line.nodes, practiceIndex, userSide)
    : 0;
  const totalAttempts = correct + incorrect;
  const accuracy = calculateAccuracyPercent(correct, totalAttempts);

  const studyFen = line ? getFenAtIndex(line.nodes, studyIndex) : STARTING_FEN;
  const studyLastMove = line ? getLastMoveUci(line.nodes, studyIndex) : undefined;

  // Board props depend on mode
  const boardFen = mode === "study" ? studyFen : fen;
  const boardLastMove = mode === "study" ? studyLastMove : lastMove;
  const boardViewOnly =
    mode === "study" ||
    status === "LINE_COMPLETE" ||
    status === "AUTO_PLAYING" ||
    status === "CORRECT" ||
    (line ? !isUserTurn(line.nodes[practiceIndex] ?? line.nodes[0], userSide) : true);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 288px",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* ── Left: Line selector ──────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
          position: "sticky",
          top: 80,
          maxHeight: "calc(100vh - 100px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--line)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
            flexShrink: 0,
          }}
        >
          Lines ({mainLines.length})
        </div>
        <div style={{ overflowY: "auto", flexGrow: 1 }}>
          {mainLines.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLineId(l.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                background:
                  l.id === selectedLineId
                    ? "rgba(200,169,107,.09)"
                    : "transparent",
                borderLeft:
                  l.id === selectedLineId
                    ? "2px solid var(--amber)"
                    : "2px solid transparent",
                border: "none",
                borderBottom: "1px solid var(--line-soft, rgba(255,255,255,.04))",
                transition: "background .1s",
              }}
            >
              <StatusDot status={l.metrics.mastery} />
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {l.name}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}>
                  {l.moveCount} moves
                  {l.metrics.attempts > 0 &&
                    ` · ${Math.round(l.metrics.accuracy * 100)}%`}
                </div>
              </div>
              {l.eco && <EcoBadge eco={l.eco} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Center: Board ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Board */}
        <div
          className="puzzle-board"
          style={{
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ChessgroundBoard
            fen={boardFen}
            orientation={userSide}
            viewOnly={boardViewOnly}
            lastMove={boardLastMove as `${string}${string}` | undefined}
            feedback={
              status === "CORRECT" && mode === "practice"
                ? "correct"
                : status === "INCORRECT"
                ? "wrong"
                : undefined
            }
            shake={shake}
            onMove={(move) => handleMove(move.uci)}
          />
        </div>

        {/* Study mode navigation */}
        {mode === "study" && line && (
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStudyIndex(0)}
              disabled={studyIndex === 0}
            >
              ⏮
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStudyIndex((i) => Math.max(0, i - 1))}
              disabled={studyIndex === 0}
            >
              ◀
            </Button>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-3)",
                fontFamily: "var(--mono)",
                minWidth: 60,
                textAlign: "center",
              }}
            >
              {studyIndex}/{totalNodes}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setStudyIndex((i) => Math.min(totalNodes, i + 1))
              }
              disabled={studyIndex >= totalNodes}
            >
              ▶
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStudyIndex(totalNodes)}
              disabled={studyIndex >= totalNodes}
            >
              ⏭
            </Button>
          </div>
        )}

        {/* Move list */}
        {line && line.nodes.length > 0 && (
          <MoveLine
            nodes={line.nodes}
            activeIndex={mode === "study" ? studyIndex : practiceIndex}
            onClickIndex={
              mode === "study" ? (i) => setStudyIndex(i) : undefined
            }
          />
        )}
      </div>

      {/* ── Right: Practice panel ────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "sticky",
          top: 80,
        }}
      >
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "var(--surface-2)",
            borderRadius: 8,
            padding: 3,
            gap: 3,
          }}
        >
          {(["study", "practice"] as PracticeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background:
                  mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--amber)" : "var(--text-3)",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.2)" : "none",
                transition: "all .15s",
                textTransform: "capitalize",
              }}
            >
              {m === "study" ? "Study" : "Practice"}
            </button>
          ))}
        </div>

        {/* Line info */}
        {line && (
          <div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--text-3)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                {line.side === "black" ? "♚ Black" : "♔ White"}
              </span>
              {line.eco && <EcoBadge eco={line.eco} />}
            </div>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.3,
              }}
            >
              {line.name}
            </div>
          </div>
        )}

        {/* Progress */}
        {mode === "practice" && line && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11.5,
                color: "var(--text-3)",
                marginBottom: 5,
              }}
            >
              <span>Your moves</span>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                {userMoveDone}/{userMoveTotal}
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: "var(--surface-2)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${userMoveTotal > 0 ? (userMoveDone / userMoveTotal) * 100 : 0}%`,
                  background:
                    status === "LINE_COMPLETE"
                      ? "var(--green, #4E8A62)"
                      : "var(--amber)",
                  borderRadius: 999,
                  transition: "width .35s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Status message */}
        {mode === "practice" && (
          <StatusMessage
            status={status}
            userSide={userSide}
            lastOpponentSan={lastOpponentSan}
          />
        )}

        {/* Metrics (only in practice, not line_complete) */}
        {mode === "practice" && status !== "LINE_COMPLETE" && totalAttempts > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <MetricChip
              label="Accuracy"
              value={`${accuracy}%`}
              color={
                accuracy >= 85
                  ? "var(--green, #4E8A62)"
                  : accuracy < 60
                  ? "var(--red, #A44D45)"
                  : "var(--amber)"
              }
            />
            <MetricChip label="Time" value={formatElapsedMs(elapsed)} />
          </div>
        )}

        {/* Line complete summary */}
        {mode === "practice" && status === "LINE_COMPLETE" && (
          <LineCompleteSummary
            accuracy={accuracy}
            elapsed={elapsed}
            correct={correct}
            incorrect={incorrect}
            onPracticeAgain={restartLine}
            onNextLine={goNextLine}
          />
        )}

        {/* Action buttons */}
        {mode === "practice" && status !== "LINE_COMPLETE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {(status === "WAITING_USER_MOVE" || status === "INCORRECT") &&
              practiceIndex < (line?.nodes.length ?? 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowMove}
                  style={{ width: "100%" }}
                >
                  Show move
                </Button>
              )}
            <Button
              variant="ghost"
              size="sm"
              icon="refresh"
              onClick={restartLine}
              style={{ width: "100%" }}
            >
              Restart line
            </Button>
          </div>
        )}

        {/* Study mode hint */}
        {mode === "study" && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              lineHeight: 1.6,
              marginTop: 4,
            }}
          >
            Navigate the line with the arrows below the board. Click any move
            in the list to jump to that position.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusMessage({
  status,
  userSide,
  lastOpponentSan,
}: {
  status: PracticeStatus;
  userSide: "white" | "black";
  lastOpponentSan: string | null;
}) {
  if (status === "LINE_COMPLETE") return null;

  const configs: Record<
    Exclude<PracticeStatus, "LINE_COMPLETE">,
    { text: string; color: string; bg: string }
  > = {
    WAITING_USER_MOVE: {
      text:
        userSide === "white"
          ? "Your turn — play White's move"
          : "Your turn — play Black's move",
      color: "var(--text-2)",
      bg: "transparent",
    },
    AUTO_PLAYING: {
      text: lastOpponentSan
        ? `Opponent played ${lastOpponentSan}`
        : "Opponent is playing…",
      color: "var(--text-3)",
      bg: "transparent",
    },
    CORRECT: {
      text: "✓ Correct!",
      color: "var(--green, #4E8A62)",
      bg: "rgba(78,138,98,.08)",
    },
    INCORRECT: {
      text: "✗ Wrong — try again",
      color: "var(--red, #A44D45)",
      bg: "rgba(164,77,69,.08)",
    },
  };

  const cfg = configs[status];

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        transition: "all .2s",
        minHeight: 40,
        display: "flex",
        alignItems: "center",
      }}
    >
      {cfg.text}
    </div>
  );
}

function MetricChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: 8,
        padding: "8px 10px",
      }}
    >
      <div style={{ fontSize: 10.5, color: "var(--text-3)", marginBottom: 3 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "var(--mono)",
          color: color ?? "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LineCompleteSummary({
  accuracy,
  elapsed,
  correct,
  incorrect,
  onPracticeAgain,
  onNextLine,
}: {
  accuracy: number;
  elapsed: number;
  correct: number;
  incorrect: number;
  onPracticeAgain: () => void;
  onNextLine: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 10,
          background: "linear-gradient(120deg, rgba(78,138,98,.12), var(--surface-2))",
          border: "1px solid rgba(78,138,98,.24)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "var(--green, #4E8A62)",
            marginBottom: 10,
          }}
        >
          ✓ Line complete!
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
          }}
        >
          {[
            { label: "Accuracy", value: `${accuracy}%`, highlight: accuracy >= 85 },
            { label: "Time", value: formatElapsedMs(elapsed) },
            { label: "Correct", value: String(correct) },
            { label: "Mistakes", value: String(incorrect) },
          ].map(({ label, value, highlight }) => (
            <div key={label}>
              <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{label}</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "var(--mono)",
                  color: highlight ? "var(--green, #4E8A62)" : "var(--text)",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <Button
        variant="amber"
        size="sm"
        icon="refresh"
        onClick={onPracticeAgain}
        style={{ width: "100%" }}
      >
        Practice again
      </Button>
      <Button
        variant="outline"
        size="sm"
        iconRight="chevRight"
        onClick={onNextLine}
        style={{ width: "100%" }}
      >
        Next line
      </Button>
    </div>
  );
}

function MoveLine({
  nodes,
  activeIndex,
  onClickIndex,
}: {
  nodes: PracticeNode[];
  activeIndex: number;
  onClickIndex?: (index: number) => void;
}) {
  // Group moves into pairs (white, black)
  const pairs: {
    n: number;
    white: PracticeNode | null;
    black: PracticeNode | null;
    wi: number;
    bi: number;
  }[] = [];

  for (let i = 0; i < nodes.length; i += 2) {
    pairs.push({
      n: Math.floor(i / 2) + 1,
      white: nodes[i] ?? null,
      black: nodes[i + 1] ?? null,
      wi: i + 1, // index AFTER this move (1-based)
      bi: i + 2,
    });
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "8px 6px",
        maxWidth: 460,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        {pairs.map((p) => (
          <span key={p.n} style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                fontFamily: "var(--mono)",
                padding: "2px 4px",
              }}
            >
              {p.n}.
            </span>
            {p.white && (
              <MoveChip
                san={p.white.san}
                active={activeIndex === p.wi}
                onClick={onClickIndex ? () => onClickIndex(p.wi) : undefined}
              />
            )}
            {p.black && (
              <MoveChip
                san={p.black.san}
                active={activeIndex === p.bi}
                onClick={onClickIndex ? () => onClickIndex(p.bi) : undefined}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function MoveChip({
  san,
  active,
  onClick,
}: {
  san: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: "var(--mono)",
        padding: "3px 7px",
        borderRadius: 5,
        border: "none",
        cursor: onClick ? "pointer" : "default",
        background: active ? "var(--amber-ghost)" : "transparent",
        color: active ? "var(--amber)" : "var(--text-2)",
        transition: "all .1s",
      }}
    >
      {san}
    </button>
  );
}
