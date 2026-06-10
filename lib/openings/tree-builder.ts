import type { ParsedMove, ParsedPgnGame, ImportedNode, ImportedLine } from "./opening-types";

// ── Path utilities ───────────────────────────────────────────────────────────

export function buildPath(moves: ParsedMove[]): string {
  return moves.map((m) => m.uci).join(".");
}

export function buildPartialPath(moves: ParsedMove[], upToIndex: number): string {
  return moves.slice(0, upToIndex + 1).map((m) => m.uci).join(".");
}

// ── Build deduplicated node tree from all parsed games ───────────────────────

export interface BuildTreeResult {
  nodes: ImportedNode[];
  lines: ImportedLine[];
  nodesCreated: number;
  nodesReused: number;
}

export function buildNodeTree(
  games: ParsedPgnGame[],
  repertoireId: string
): BuildTreeResult {
  // nodesByPath: path → ImportedNode
  const nodesByPath = new Map<string, ImportedNode>();
  const lines: ImportedLine[] = [];
  let nodesCreated = 0;
  let nodesReused = 0;
  let lineOrderIndex = 0;

  for (const game of games) {
    const isMainLineGame = true; // each PGN game is a main-line entry

    // Process all lines (main + variations)
    for (let lineIdx = 0; lineIdx < game.allLines.length; lineIdx++) {
      const moves = game.allLines[lineIdx];
      if (moves.length === 0) continue;

      const lineNodeIds: string[] = [];

      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        const path = buildPartialPath(moves, i);
        const parentPath = i > 0 ? buildPartialPath(moves, i - 1) : null;
        const parentId = parentPath ? nodesByPath.get(parentPath)?.id ?? null : null;

        if (nodesByPath.has(path)) {
          const existing = nodesByPath.get(path)!;
          lineNodeIds.push(existing.id);
          nodesReused++;
          continue;
        }

        const nodeId = crypto.randomUUID();
        const node: ImportedNode = {
          id: nodeId,
          parentId,
          path,
          san: move.san,
          uci: move.uci,
          fenBefore: move.fenBefore,
          fenAfter: move.fenAfter,
          moveNumber: move.moveNumber,
          ply: move.ply,
          depth: i + 1,
          eco: lineIdx === 0 ? game.eco : null, // only main line gets ECO
          lineName: lineIdx === 0 ? game.lineName : null,
          isMainLine: lineIdx === 0 && isMainLineGame,
          orderIndex: lineOrderIndex,
        };

        nodesByPath.set(path, node);
        lineNodeIds.push(nodeId);
        nodesCreated++;
      }

      const finalMove = moves[moves.length - 1];
      const lineId = crypto.randomUUID();
      const lineName =
        lineIdx === 0
          ? game.lineName
          : `${game.lineName} (var. ${lineIdx})`;

      const line: ImportedLine = {
        id: lineId,
        name: lineName,
        eco: lineIdx === 0 ? game.eco : null,
        pgn: moves.map((m, idx) => {
          const prefix =
            m.ply % 2 === 1
              ? `${m.moveNumber}. `
              : idx === 0
              ? `${m.moveNumber}... `
              : "";
          return prefix + m.san;
        }).join(" "),
        startFen: moves[0].fenBefore,
        finalFen: finalMove.fenAfter,
        moveCount: moves.length,
        isMainLine: lineIdx === 0,
        orderIndex: lineOrderIndex,
        nodeIds: lineNodeIds,
      };

      lines.push(line);
      lineOrderIndex++;
    }
  }

  return {
    nodes: Array.from(nodesByPath.values()),
    lines,
    nodesCreated,
    nodesReused,
  };
}

// ── ECO distribution helper ──────────────────────────────────────────────────

export function computeEcoDistribution(
  games: ParsedPgnGame[]
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const g of games) {
    if (g.eco) {
      dist[g.eco] = (dist[g.eco] ?? 0) + 1;
    }
  }
  return dist;
}
