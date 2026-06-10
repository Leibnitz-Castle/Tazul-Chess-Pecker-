import { describe, it, expect } from "vitest";
import { buildPath, buildPartialPath, buildNodeTree, computeEcoDistribution } from "../tree-builder";
import type { ParsedPgnGame } from "../opening-types";

// ── buildPath ─────────────────────────────────────────────────────────────────

describe("buildPath", () => {
  it("joins UCI moves with dots", () => {
    const moves = [
      { uci: "e2e4", san: "e4", fenBefore: "", fenAfter: "", moveNumber: 1, ply: 1 },
      { uci: "e7e5", san: "e5", fenBefore: "", fenAfter: "", moveNumber: 1, ply: 2 },
      { uci: "g1f3", san: "Nf3", fenBefore: "", fenAfter: "", moveNumber: 2, ply: 3 },
    ];
    expect(buildPath(moves)).toBe("e2e4.e7e5.g1f3");
  });

  it("returns empty string for empty array", () => {
    expect(buildPath([])).toBe("");
  });
});

// ── buildPartialPath ──────────────────────────────────────────────────────────

describe("buildPartialPath", () => {
  it("builds path up to given index (inclusive)", () => {
    const moves = [
      { uci: "e2e4", san: "e4", fenBefore: "", fenAfter: "", moveNumber: 1, ply: 1 },
      { uci: "e7e5", san: "e5", fenBefore: "", fenAfter: "", moveNumber: 1, ply: 2 },
      { uci: "g1f3", san: "Nf3", fenBefore: "", fenAfter: "", moveNumber: 2, ply: 3 },
    ];
    expect(buildPartialPath(moves, 0)).toBe("e2e4");
    expect(buildPartialPath(moves, 1)).toBe("e2e4.e7e5");
    expect(buildPartialPath(moves, 2)).toBe("e2e4.e7e5.g1f3");
  });
});

// ── buildNodeTree deduplication ───────────────────────────────────────────────

describe("buildNodeTree", () => {
  const makeParsedMove = (uci: string, san: string, ply: number) => ({
    san,
    uci,
    fenBefore: `fen-before-${ply}`,
    fenAfter: `fen-after-${ply}`,
    moveNumber: Math.ceil(ply / 2),
    ply,
  });

  it("creates nodes from a single game", () => {
    const game: ParsedPgnGame = {
      headers: { White: "TestLine" },
      lineName: "TestLine",
      eco: "C50",
      side: "white",
      mainLine: [
        makeParsedMove("e2e4", "e4", 1),
        makeParsedMove("e7e5", "e5", 2),
        makeParsedMove("g1f3", "Nf3", 3),
      ],
      allLines: [
        [
          makeParsedMove("e2e4", "e4", 1),
          makeParsedMove("e7e5", "e5", 2),
          makeParsedMove("g1f3", "Nf3", 3),
        ],
      ],
    };

    const { nodes, lines, nodesCreated, nodesReused } = buildNodeTree(
      [game],
      "rep-id-1"
    );

    expect(nodesCreated).toBe(3);
    expect(nodesReused).toBe(0);
    expect(nodes).toHaveLength(3);
    expect(lines).toHaveLength(1);
    expect(lines[0].name).toBe("TestLine");
    expect(lines[0].eco).toBe("C50");
    expect(lines[0].nodeIds).toHaveLength(3);
  });

  it("deduplicates shared moves between two games", () => {
    // Game 1: e4 e5 Nf3
    // Game 2: e4 e5 Bc4 (shares e4 e5)
    const game1: ParsedPgnGame = {
      headers: {},
      lineName: "Line1",
      eco: "C50",
      side: "white",
      mainLine: [
        makeParsedMove("e2e4", "e4", 1),
        makeParsedMove("e7e5", "e5", 2),
        makeParsedMove("g1f3", "Nf3", 3),
      ],
      allLines: [
        [
          makeParsedMove("e2e4", "e4", 1),
          makeParsedMove("e7e5", "e5", 2),
          makeParsedMove("g1f3", "Nf3", 3),
        ],
      ],
    };

    const game2: ParsedPgnGame = {
      headers: {},
      lineName: "Line2",
      eco: "C51",
      side: "white",
      mainLine: [
        makeParsedMove("e2e4", "e4", 1),
        makeParsedMove("e7e5", "e5", 2),
        makeParsedMove("f1c4", "Bc4", 3),
      ],
      allLines: [
        [
          makeParsedMove("e2e4", "e4", 1),
          makeParsedMove("e7e5", "e5", 2),
          makeParsedMove("f1c4", "Bc4", 3),
        ],
      ],
    };

    const { nodes, nodesCreated, nodesReused } = buildNodeTree(
      [game1, game2],
      "rep-id-2"
    );

    // e4, e5 are shared → 2 reused; Nf3 and Bc4 are new → 2 created for game2
    expect(nodesCreated).toBe(3 + 1); // 3 from game1, 1 new (Bc4) from game2
    expect(nodesReused).toBe(2); // e4, e5 reused from game2
    expect(nodes).toHaveLength(4); // e4, e5, Nf3, Bc4
  });

  it("assigns correct path to nodes", () => {
    const game: ParsedPgnGame = {
      headers: {},
      lineName: "Path Test",
      eco: null,
      side: "white",
      mainLine: [
        makeParsedMove("e2e4", "e4", 1),
        makeParsedMove("e7e5", "e5", 2),
      ],
      allLines: [
        [makeParsedMove("e2e4", "e4", 1), makeParsedMove("e7e5", "e5", 2)],
      ],
    };

    const { nodes } = buildNodeTree([game], "rep-id-3");
    const e4Node = nodes.find((n) => n.san === "e4");
    const e5Node = nodes.find((n) => n.san === "e5");

    expect(e4Node?.path).toBe("e2e4");
    expect(e5Node?.path).toBe("e2e4.e7e5");
  });

  it("sets parentId correctly", () => {
    const game: ParsedPgnGame = {
      headers: {},
      lineName: "Parent Test",
      eco: null,
      side: "white",
      mainLine: [
        makeParsedMove("e2e4", "e4", 1),
        makeParsedMove("e7e5", "e5", 2),
      ],
      allLines: [
        [makeParsedMove("e2e4", "e4", 1), makeParsedMove("e7e5", "e5", 2)],
      ],
    };

    const { nodes } = buildNodeTree([game], "rep-id-4");
    const e4Node = nodes.find((n) => n.san === "e4")!;
    const e5Node = nodes.find((n) => n.san === "e5")!;

    expect(e4Node.parentId).toBeNull();
    expect(e5Node.parentId).toBe(e4Node.id);
  });
});

// ── computeEcoDistribution ────────────────────────────────────────────────────

describe("computeEcoDistribution", () => {
  it("counts games per ECO code", () => {
    const games: ParsedPgnGame[] = [
      { headers: {}, lineName: "A", eco: "B95", side: "white", mainLine: [], allLines: [] },
      { headers: {}, lineName: "B", eco: "B95", side: "white", mainLine: [], allLines: [] },
      { headers: {}, lineName: "C", eco: "C50", side: "white", mainLine: [], allLines: [] },
      { headers: {}, lineName: "D", eco: null, side: "white", mainLine: [], allLines: [] },
    ];

    const dist = computeEcoDistribution(games);
    expect(dist["B95"]).toBe(2);
    expect(dist["C50"]).toBe(1);
    expect(Object.keys(dist)).not.toContain("null");
  });
});
