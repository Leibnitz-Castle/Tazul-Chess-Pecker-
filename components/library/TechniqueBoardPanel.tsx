"use client";

import { useState, useMemo } from "react";
import { ChessgroundBoard } from "@/components/chess/ChessgroundBoard";
import { computePosition, canNavigateMoves, getBoardOrientation, FALLBACK_FEN } from "@/lib/library/board-utils";

interface ExampleData {
  id: string;
  fenInitial: string;
  mainlineMoves: string[];
  mainlineLength: number;
  eco: string | null;
  orderIndex: number;
}

interface TechniqueBoardPanelProps {
  examples: ExampleData[];
  techniqueNumber: number;
}

export function TechniqueBoardPanel({ examples, techniqueNumber }: TechniqueBoardPanelProps) {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(-1);

  const example = examples[exampleIdx] ?? null;
  const moves = useMemo(() => example?.mainlineMoves ?? [], [example]);
  const canNav = example ? canNavigateMoves(example.fenInitial) : false;

  const { fen, lastMove } = useMemo(
    () => computePosition(example?.fenInitial ?? "", moves, moveIdx),
    [example, moves, moveIdx]
  );

  const orientation = useMemo(
    () => getBoardOrientation(fen || FALLBACK_FEN),
    [fen]
  );

  function selectExample(idx: number) {
    setExampleIdx(idx);
    setMoveIdx(-1);
  }

  function goToStart() { setMoveIdx(-1); }
  function goPrev() { setMoveIdx((m) => Math.max(-1, m - 1)); }
  function goNext() { setMoveIdx((m) => Math.min(moves.length - 1, m + 1)); }
  function goToEnd() { setMoveIdx(moves.length - 1); }

  if (examples.length === 0) {
    return (
      <div
        style={{
          padding: "60px 0",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: 14,
        }}
      >
        Todavía no hay ejemplos importados para esta técnica.
      </div>
    );
  }

  const moveLabel =
    moveIdx < 0
      ? "Posición inicial"
      : `Jugada ${moveIdx + 1} / ${moves.length}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {/* Board */}
      <ChessgroundBoard
        fen={fen}
        orientation={orientation}
        viewOnly
        lastMove={lastMove}
      />

      {/* Move counter */}
      {canNav && moves.length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.03em",
          }}
        >
          {moveLabel}
        </div>
      )}

      {/* Navigation controls */}
      {canNav && moves.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {[
            { label: "◀◀", action: goToStart, disabled: moveIdx < 0, title: "Posición inicial" },
            { label: "◀", action: goPrev, disabled: moveIdx < 0, title: "Jugada anterior" },
            { label: "▶", action: goNext, disabled: moveIdx >= moves.length - 1, title: "Siguiente jugada" },
            { label: "▶▶", action: goToEnd, disabled: moveIdx >= moves.length - 1, title: "Posición final" },
          ].map(({ label, action, disabled, title }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              title={title}
              style={{
                width: 38,
                height: 30,
                borderRadius: 6,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: disabled ? "var(--text-3)" : "var(--text-2)",
                fontSize: 10,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.35 : 1,
                transition: "all 0.1s",
                fontFamily: "monospace",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* SAN move list */}
      {canNav && moves.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            padding: "8px 0 4px",
            borderTop: "1px solid var(--line)",
            maxHeight: 100,
            overflowY: "auto",
          }}
        >
          {moves.map((san, i) => (
            <button
              key={i}
              onClick={() => setMoveIdx(i)}
              style={{
                padding: "3px 5px",
                borderRadius: 4,
                border: "none",
                background: moveIdx === i ? "rgba(200,169,107,0.16)" : "transparent",
                color: moveIdx === i ? "var(--amber)" : "var(--text-3)",
                fontSize: 11,
                fontFamily: "monospace",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {i % 2 === 0 && (
                <span style={{ opacity: 0.45, marginRight: 1, fontSize: 10 }}>
                  {Math.floor(i / 2) + 1}.
                </span>
              )}
              {san}
            </button>
          ))}
        </div>
      )}

      {!canNav && example && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            textAlign: "center",
            paddingTop: 8,
            fontStyle: "italic",
          }}
        >
          Diagrama de análisis — navegación no disponible
        </div>
      )}

      {/* Example selector */}
      {examples.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid var(--line)",
            marginTop: 4,
          }}
        >
          <button
            onClick={() => { if (exampleIdx > 0) selectExample(exampleIdx - 1); }}
            disabled={exampleIdx === 0}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text-3)",
              fontSize: 12,
              cursor: exampleIdx === 0 ? "default" : "pointer",
              opacity: exampleIdx === 0 ? 0.35 : 1,
            }}
          >
            ← Anterior
          </button>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Ejemplo {exampleIdx + 1} / {examples.length}
          </span>
          <button
            onClick={() => {
              if (exampleIdx < examples.length - 1) selectExample(exampleIdx + 1);
            }}
            disabled={exampleIdx >= examples.length - 1}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text-3)",
              fontSize: 12,
              cursor: exampleIdx >= examples.length - 1 ? "default" : "pointer",
              opacity: exampleIdx >= examples.length - 1 ? 0.35 : 1,
            }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
