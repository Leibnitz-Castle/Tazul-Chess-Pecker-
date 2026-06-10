import { PrismaClient } from "@prisma/client";
import { parsePgnFile } from "./pgn-parser";
import { buildNodeTree, computeEcoDistribution } from "./tree-builder";
import type { OpeningColor, OpeningSourceType, ImportReport } from "./opening-types";

export interface ImportOptions {
  pgn: string;
  color: OpeningColor;
  name: string;
  sourceName: string;
  description?: string;
  sourceType?: OpeningSourceType;
  devUserId?: string;
  /** If true, delete existing repertoire with same name+color before importing */
  reimport?: boolean;
}

export async function importOpeningRepertoire(
  prisma: PrismaClient,
  opts: ImportOptions
): Promise<ImportReport> {
  const {
    pgn,
    color,
    name,
    sourceName,
    description,
    sourceType = "PGN",
    devUserId = "dev-user-001",
    reimport = false,
  } = opts;

  const side = color === "WHITE" ? "white" : "black";

  // Reimport: delete existing
  if (reimport) {
    await prisma.openingRepertoire.deleteMany({
      where: { devUserId, name, color },
    });
  } else {
    // Idempotency: skip if already exists
    const existing = await prisma.openingRepertoire.findFirst({
      where: { devUserId, name, color },
    });
    if (existing) {
      return {
        repertoireId: existing.id,
        repertoireName: existing.name,
        color,
        totalGamesInPgn: 0,
        linesCreated: 0,
        linesSkipped: 0,
        nodesCreated: 0,
        nodesReused: 0,
        parseErrors: [],
        ecoDistribution: {},
        createdAt: new Date().toISOString(),
      };
    }
  }

  const { games, errors } = parsePgnFile(pgn, side);

  if (games.length === 0) {
    const rawGameCount = pgn.match(/^\[Event/gm)?.length ?? 0;
    return {
      repertoireId: "",
      repertoireName: name,
      color,
      totalGamesInPgn: rawGameCount,
      linesCreated: 0,
      linesSkipped: rawGameCount,
      nodesCreated: 0,
      nodesReused: 0,
      parseErrors: errors,
      ecoDistribution: {},
      createdAt: new Date().toISOString(),
    };
  }

  // Create repertoire record
  const repertoire = await prisma.openingRepertoire.create({
    data: {
      devUserId,
      name,
      color,
      sourceType,
      sourceName,
      description: description ?? null,
    },
  });

  const { nodes, lines, nodesCreated, nodesReused } = buildNodeTree(
    games,
    repertoire.id
  );

  // Batch-insert nodes (no upsert needed — we already deduplicate in memory)
  await prisma.$transaction(
    nodes.map((n) =>
      prisma.openingMoveNode.create({
        data: {
          id: n.id,
          repertoireId: repertoire.id,
          parentId: n.parentId,
          moveNumber: n.moveNumber,
          san: n.san,
          uci: n.uci,
          fenBefore: n.fenBefore,
          fenAfter: n.fenAfter,
          ply: n.ply,
          eco: n.eco,
          lineName: n.lineName,
          path: n.path,
          depth: n.depth,
          orderIndex: n.orderIndex,
          isMainLine: n.isMainLine,
        },
      })
    )
  );

  // Insert lines + line-node junction
  for (const line of lines) {
    const createdLine = await prisma.openingLine.create({
      data: {
        id: line.id,
        repertoireId: repertoire.id,
        name: line.name,
        eco: line.eco,
        side,
        pgn: line.pgn,
        startFen: line.startFen,
        finalFen: line.finalFen,
        moveCount: line.moveCount,
        isMainLine: line.isMainLine,
        orderIndex: line.orderIndex,
      },
    });

    if (line.nodeIds.length > 0) {
      await prisma.openingLineNode.createMany({
        data: line.nodeIds.map((nodeId, idx) => ({
          lineId: createdLine.id,
          nodeId,
          orderIndex: idx,
        })),
        skipDuplicates: true,
      });
    }
  }

  return {
    repertoireId: repertoire.id,
    repertoireName: name,
    color,
    totalGamesInPgn: games.length + errors.length,
    linesCreated: lines.length,
    linesSkipped: errors.length,
    nodesCreated,
    nodesReused,
    parseErrors: errors,
    ecoDistribution: computeEcoDistribution(games),
    createdAt: new Date().toISOString(),
  };
}
