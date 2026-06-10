"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { EcoBadge } from "./EcoBadge";
import { StatusDot } from "./StatusDot";
import type { MasteryStatus } from "@/lib/openings/opening-types";

const ChessgroundBoard = dynamic(
  () =>
    import("@/components/chess/ChessgroundBoard").then(
      (m) => m.ChessgroundBoard
    ),
  { ssr: false }
);

interface LineForPractice {
  id: string;
  repertoireId: string;
  name: string;
  eco: string | null;
  side: string;
  pgn: string;
  moveCount: number;
  metrics: { mastery: MasteryStatus; attempts: number; accuracy: number };
  nodes: {
    id: string;
    san: string;
    uci: string;
    fenAfter: string;
    moveNumber: number;
    ply: number;
  }[];
}

interface OpeningPracticeProps {
  lines: LineForPractice[];
  initialLineId?: string | null;
}

type Phase = "idle" | "correct" | "wrong" | "complete";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function OpeningPractice({
  lines,
  initialLineId,
}: OpeningPracticeProps) {
  const mainLines = lines.filter((l) => l.moveCount > 0);
  const [selectedLineId, setSelectedLineId] = useState<string>(
    initialLineId ?? mainLines[0]?.id ?? ""
  );
  const [ply, setPly] = useState(0);
  const [fen, setFen] = useState(STARTING_FEN);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errors, setErrors] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [shake, setShake] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const line = mainLines.find((l) => l.id === selectedLineId) ?? mainLines[0];
  const orientation = line?.side === "black" ? "black" : "white";

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const fenAtPly = useCallback(
    (p: number): string => {
      if (!line) return STARTING_FEN;
      const chess = new Chess();
      for (let i = 0; i < p && i < line.nodes.length; i++) {
        try {
          chess.move(line.nodes[i].san);
        } catch {
          break;
        }
      }
      return chess.fen();
    },
    [line]
  );

  const lastMoveAtPly = useCallback(
    (p: number): string | undefined => {
      if (!line || p <= 0 || p > line.nodes.length) return undefined;
      const node = line.nodes[p - 1];
      return node ? `${node.uci.slice(0, 2)}${node.uci.slice(2, 4)}` : undefined;
    },
    [line]
  );

  const isPlayerTurn = useCallback(
    (p: number): boolean => {
      if (!line) return false;
      if (line.side === "white") return p % 2 === 0; // white moves on even ply (0, 2, 4…)
      return p % 2 === 1; // black moves on odd ply
    },
    [line]
  );

  const advanceTo = useCallback(
    (p: number) => {
      const newFen = fenAtPly(p);
      const newLastMove = lastMoveAtPly(p);
      setFen(newFen);
      setLastMove(newLastMove);
      setPly(p);
    },
    [fenAtPly, lastMoveAtPly]
  );

  // Reset when line changes
  useEffect(() => {
    clearTimers();
    setPly(0);
    setFen(STARTING_FEN);
    setLastMove(undefined);
    setPhase("idle");
    setErrors(0);

    if (!line) return;

    // Auto-play opponent first move if player is black
    if (line.side === "black" && line.nodes.length > 0) {
      const t = setTimeout(() => {
        advanceTo(1);
      }, 500);
      timers.current.push(t);
    }
  }, [selectedLineId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const submitAttempt = useCallback(
    async (
      nodeId: string,
      movePlayed: string,
      expectedMove: string,
      isCorrect: boolean
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
            isCorrect,
            timeMs: Date.now() - startedAt,
            attemptType: "PRACTICE",
          }),
        });
      } catch {
        // non-blocking
      }
    },
    [line, startedAt]
  );

  const handleMove = useCallback(
    async (moveUci: string) => {
      if (!line || phase !== "idle" || !isPlayerTurn(ply)) return;
      if (ply >= line.nodes.length) return;

      const expectedNode = line.nodes[ply];
      const expectedUci = expectedNode.uci;
      const isCorrect = moveUci === expectedUci;

      if (isCorrect) {
        setPhase("correct");
        advanceTo(ply + 1);

        // Submit attempt (non-blocking, best-effort)
        submitAttempt(
          expectedNode.id,
          moveUci,
          expectedUci,
          true
        );

        const nextPly = ply + 1;

        if (nextPly >= line.nodes.length) {
          const t = setTimeout(() => setPhase("complete"), 500);
          timers.current.push(t);
          return;
        }

        // Auto-play opponent reply
        if (!isPlayerTurn(nextPly)) {
          const t1 = setTimeout(() => {
            setPhase("idle");
            advanceTo(nextPly + 1);

            if (nextPly + 1 >= line.nodes.length) {
              const t2 = setTimeout(() => setPhase("complete"), 400);
              timers.current.push(t2);
            }
          }, 600);
          timers.current.push(t1);
        } else {
          const t = setTimeout(() => setPhase("idle"), 400);
          timers.current.push(t);
        }
      } else {
        setErrors((e) => e + 1);
        setPhase("wrong");
        setShake(true);
        setLastMove(moveUci);

        submitAttempt(
          expectedNode.id,
          moveUci,
          expectedUci,
          false
        );

        const t = setTimeout(() => {
          setShake(false);
          setPhase("idle");
          setLastMove(lastMoveAtPly(ply));
          setFen(fenAtPly(ply));
        }, 700);
        timers.current.push(t);
      }
    },
    [line, phase, ply, isPlayerTurn, advanceTo, submitAttempt, fenAtPly, lastMoveAtPly]
  );

  const restartLine = useCallback(() => {
    clearTimers();
    setPly(0);
    setFen(STARTING_FEN);
    setLastMove(undefined);
    setPhase("idle");
    setErrors(0);

    if (!line) return;
    if (line.side === "black" && line.nodes.length > 0) {
      const t = setTimeout(() => advanceTo(1), 500);
      timers.current.push(t);
    }
  }, [line, clearTimers, advanceTo]);

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
          Import a repertoire first using <strong>npm run openings:import</strong>.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 24,
        alignItems: "start",
      }}
    >
      {/* Left: line selector */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Select line
        </div>
        <div style={{ maxHeight: 500, overflowY: "auto" }}>
          {mainLines.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLineId(l.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                background:
                  l.id === selectedLineId
                    ? "rgba(200,169,107,.08)"
                    : "transparent",
                borderLeft:
                  l.id === selectedLineId
                    ? "2px solid var(--amber)"
                    : "2px solid transparent",
                border: "none",
                borderBottom: "1px solid var(--line-soft, var(--line))",
                transition: "background .12s",
              }}
            >
              <StatusDot status={l.metrics.mastery} />
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {l.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                  {l.moveCount} moves
                </div>
              </div>
              {l.eco && <EcoBadge eco={l.eco} />}
            </button>
          ))}
        </div>
      </div>

      {/* Right: board + feedback */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {line?.eco && <EcoBadge eco={line.eco} />}
          <span
            style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}
          >
            {line?.name}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              color: "var(--text-3)",
              fontFamily: "var(--mono)",
            }}
          >
            {ply}/{line?.nodes.length ?? 0} moves
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            background: "var(--surface-2)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${line ? (ply / line.nodes.length) * 100 : 0}%`,
              background: "var(--amber)",
              borderRadius: 999,
              transition: "width .3s ease",
            }}
          />
        </div>

        {/* Board */}
        <div
          className="puzzle-board"
          style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ChessgroundBoard
            fen={fen}
            orientation={orientation}
            viewOnly={phase === "complete" || (line ? !isPlayerTurn(ply) : true)}
            lastMove={lastMove as `${string}${string}` | undefined}
            feedback={
              phase === "correct"
                ? "correct"
                : phase === "wrong"
                ? "wrong"
                : undefined
            }
            shake={shake}
            onMove={(move) => handleMove(move.uci)}
          />
        </div>

        {/* Feedback */}
        <div style={{ minHeight: 56, display: "flex", alignItems: "center" }}>
          {phase === "complete" ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderRadius: 12,
                background:
                  "linear-gradient(120deg, rgba(78,138,98,.14), var(--surface))",
                border: "1px solid rgba(78,138,98,.32)",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--green, #4E8A62)",
                  }}
                >
                  Line complete!
                </div>
                <div
                  style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 3 }}
                >
                  {errors === 0
                    ? "Perfect — no errors."
                    : `${errors} error${errors > 1 ? "s" : ""} made.`}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={restartLine} icon="refresh">
                Again
              </Button>
            </div>
          ) : phase === "correct" ? (
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--green, #4E8A62)",
                padding: "0 4px",
              }}
            >
              ✓ Correct
            </div>
          ) : phase === "wrong" ? (
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--red, #A44D45)",
                padding: "0 4px",
              }}
            >
              ✗ Wrong move — try again
            </div>
          ) : !isPlayerTurn(ply) && ply < (line?.nodes.length ?? 0) ? (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                padding: "0 4px",
                fontStyle: "italic",
              }}
            >
              Playing opponent response…
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: "var(--text-2)",
                padding: "0 4px",
              }}
            >
              {line?.side === "white" ? "Your turn — play White's move" : "Your turn — play Black's move"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
