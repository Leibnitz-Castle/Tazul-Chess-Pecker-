"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Reuse ChessgroundBoard from the chess components
const ChessgroundBoard = dynamic(
  () =>
    import("@/components/chess/ChessgroundBoard").then(
      (m) => m.ChessgroundBoard
    ),
  { ssr: false }
);

interface OpeningBoardPanelProps {
  fen: string;
  orientation?: "white" | "black";
  lastMove?: { from: string; to: string } | null;
}

export function OpeningBoardPanel({
  fen,
  orientation = "white",
  lastMove,
}: OpeningBoardPanelProps) {
  const lastMoveUci = lastMove
    ? (`${lastMove.from}${lastMove.to}` as `${string}${string}`)
    : undefined;

  return (
    <div
      className="puzzle-board"
      style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}
    >
      <ChessgroundBoard
        fen={fen}
        orientation={orientation}
        viewOnly={true}
        lastMove={lastMoveUci}
      />
    </div>
  );
}
