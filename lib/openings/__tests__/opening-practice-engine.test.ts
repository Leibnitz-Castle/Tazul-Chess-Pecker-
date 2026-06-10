import { describe, it, expect } from "vitest";
import {
  getUserSide,
  getSideToMoveFromFen,
  isUserTurn,
  getFenAtIndex,
  getLastMoveUci,
  getAutoMovesFromIndex,
  isLineComplete,
  countUserMoveNodes,
  countCompletedUserMoves,
  calculateAccuracyPercent,
  formatElapsedMs,
  getMasteryFromStats,
  STARTING_FEN,
  type PracticeNode,
} from "../opening-practice-engine";

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Simulates: 1.e4 e5 2.Nf3 (WHITE repertoire - user plays e4 and Nf3)
const WHITE_NODES: PracticeNode[] = [
  {
    id: "n1",
    san: "e4",
    uci: "e2e4",
    fenBefore: STARTING_FEN,
    fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    moveNumber: 1,
    ply: 1,
  },
  {
    id: "n2",
    san: "e5",
    uci: "e7e5",
    fenBefore: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moveNumber: 1,
    ply: 2,
  },
  {
    id: "n3",
    san: "Nf3",
    uci: "g1f3",
    fenBefore: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    moveNumber: 2,
    ply: 3,
  },
];

// Simulates: 1.e4 e6 2.d4 d5 (BLACK repertoire - user plays e6 and d5)
const BLACK_NODES: PracticeNode[] = [
  {
    id: "b1",
    san: "e4",
    uci: "e2e4",
    fenBefore: STARTING_FEN,
    fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    moveNumber: 1,
    ply: 1,
  },
  {
    id: "b2",
    san: "e6",
    uci: "e7e6",
    fenBefore: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    fenAfter: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moveNumber: 1,
    ply: 2,
  },
  {
    id: "b3",
    san: "d4",
    uci: "d2d4",
    fenBefore: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    fenAfter: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
    moveNumber: 2,
    ply: 3,
  },
  {
    id: "b4",
    san: "d5",
    uci: "d7d5",
    fenBefore: "rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2",
    fenAfter: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    moveNumber: 2,
    ply: 4,
  },
];

// ── getUserSide ───────────────────────────────────────────────────────────────

describe("getUserSide", () => {
  it("returns white for white side", () => {
    expect(getUserSide("white")).toBe("white");
  });
  it("returns black for black side", () => {
    expect(getUserSide("black")).toBe("black");
  });
  it("defaults to white for unknown values", () => {
    expect(getUserSide("WHITE")).toBe("white");
  });
});

// ── getSideToMoveFromFen ──────────────────────────────────────────────────────

describe("getSideToMoveFromFen", () => {
  it("returns w for starting position", () => {
    expect(getSideToMoveFromFen(STARTING_FEN)).toBe("w");
  });
  it("returns b after 1.e4", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    expect(getSideToMoveFromFen(fen)).toBe("b");
  });
  it("returns w after 1.e4 e5", () => {
    const fen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    expect(getSideToMoveFromFen(fen)).toBe("w");
  });
});

// ── isUserTurn ────────────────────────────────────────────────────────────────

describe("isUserTurn — WHITE repertoire", () => {
  it("node 0 (1.e4 — white to move): user's turn", () => {
    expect(isUserTurn(WHITE_NODES[0], "white")).toBe(true);
  });
  it("node 1 (1...e5 — black to move): NOT user's turn", () => {
    expect(isUserTurn(WHITE_NODES[1], "white")).toBe(false);
  });
  it("node 2 (2.Nf3 — white to move): user's turn again", () => {
    expect(isUserTurn(WHITE_NODES[2], "white")).toBe(true);
  });
});

describe("isUserTurn — BLACK repertoire", () => {
  it("node 0 (1.e4 — white to move): NOT user's turn (opponent plays)", () => {
    expect(isUserTurn(BLACK_NODES[0], "black")).toBe(false);
  });
  it("node 1 (1...e6 — black to move): user's turn", () => {
    expect(isUserTurn(BLACK_NODES[1], "black")).toBe(true);
  });
  it("node 2 (2.d4 — white to move): NOT user's turn", () => {
    expect(isUserTurn(BLACK_NODES[2], "black")).toBe(false);
  });
  it("node 3 (2...d5 — black to move): user's turn again", () => {
    expect(isUserTurn(BLACK_NODES[3], "black")).toBe(true);
  });
});

// ── getFenAtIndex ─────────────────────────────────────────────────────────────

describe("getFenAtIndex", () => {
  it("returns STARTING_FEN at index 0", () => {
    expect(getFenAtIndex(WHITE_NODES, 0)).toBe(STARTING_FEN);
  });
  it("returns fenAfter of node[0] at index 1", () => {
    expect(getFenAtIndex(WHITE_NODES, 1)).toBe(WHITE_NODES[0].fenAfter);
  });
  it("returns fenAfter of node[2] at index 3", () => {
    expect(getFenAtIndex(WHITE_NODES, 3)).toBe(WHITE_NODES[2].fenAfter);
  });
  it("returns STARTING_FEN for empty nodes", () => {
    expect(getFenAtIndex([], 2)).toBe(STARTING_FEN);
  });
});

// ── getAutoMovesFromIndex ─────────────────────────────────────────────────────

describe("getAutoMovesFromIndex — WHITE repertoire (user plays white)", () => {
  it("no auto-play at index 0 (user plays first)", () => {
    const auto = getAutoMovesFromIndex(WHITE_NODES, 0, "white");
    expect(auto).toHaveLength(0);
  });
  it("auto-plays black's response (node[1]) after user plays node[0]", () => {
    const auto = getAutoMovesFromIndex(WHITE_NODES, 1, "white");
    expect(auto).toHaveLength(1);
    expect(auto[0].san).toBe("e5");
  });
  it("no auto-play after black's move (user plays next)", () => {
    const auto = getAutoMovesFromIndex(WHITE_NODES, 2, "white");
    expect(auto).toHaveLength(0);
  });
});

describe("getAutoMovesFromIndex — BLACK repertoire (user plays black)", () => {
  it("auto-plays white's first move (node[0]) at the start", () => {
    const auto = getAutoMovesFromIndex(BLACK_NODES, 0, "black");
    expect(auto).toHaveLength(1);
    expect(auto[0].san).toBe("e4");
  });
  it("no auto-play after user plays black's first move (node[1])", () => {
    const auto = getAutoMovesFromIndex(BLACK_NODES, 2, "black");
    expect(auto).toHaveLength(1);
    expect(auto[0].san).toBe("d4");
  });
  it("no auto-play once past all nodes", () => {
    const auto = getAutoMovesFromIndex(BLACK_NODES, 4, "black");
    expect(auto).toHaveLength(0);
  });
});

// ── isLineComplete ────────────────────────────────────────────────────────────

describe("isLineComplete", () => {
  it("returns false when index < total", () => {
    expect(isLineComplete(2, 3)).toBe(false);
  });
  it("returns true when index === total", () => {
    expect(isLineComplete(3, 3)).toBe(true);
  });
  it("returns true when index > total", () => {
    expect(isLineComplete(4, 3)).toBe(true);
  });
});

// ── countUserMoveNodes / countCompletedUserMoves ──────────────────────────────

describe("countUserMoveNodes", () => {
  it("counts white user moves in WHITE line (2 of 3)", () => {
    expect(countUserMoveNodes(WHITE_NODES, "white")).toBe(2);
  });
  it("counts black user moves in BLACK line (2 of 4)", () => {
    expect(countUserMoveNodes(BLACK_NODES, "black")).toBe(2);
  });
});

describe("countCompletedUserMoves", () => {
  it("returns 0 at index 0", () => {
    expect(countCompletedUserMoves(WHITE_NODES, 0, "white")).toBe(0);
  });
  it("returns 1 after user plays first white move (index 1)", () => {
    expect(countCompletedUserMoves(WHITE_NODES, 1, "white")).toBe(1);
  });
  it("still 1 after opponent auto-plays (index 2)", () => {
    expect(countCompletedUserMoves(WHITE_NODES, 2, "white")).toBe(1);
  });
  it("returns 2 after user plays second move (index 3)", () => {
    expect(countCompletedUserMoves(WHITE_NODES, 3, "white")).toBe(2);
  });
  it("returns 0 for BLACK line at index 0 (opponent hasn't played yet)", () => {
    expect(countCompletedUserMoves(BLACK_NODES, 0, "black")).toBe(0);
  });
  it("still 0 after opponent auto-play (index 1, user hasn't moved)", () => {
    expect(countCompletedUserMoves(BLACK_NODES, 1, "black")).toBe(0);
  });
  it("returns 1 after black plays first move (index 2)", () => {
    expect(countCompletedUserMoves(BLACK_NODES, 2, "black")).toBe(1);
  });
});

// ── calculateAccuracyPercent ──────────────────────────────────────────────────

describe("calculateAccuracyPercent", () => {
  it("returns 0 for 0 total", () => {
    expect(calculateAccuracyPercent(0, 0)).toBe(0);
  });
  it("returns 100 for all correct", () => {
    expect(calculateAccuracyPercent(5, 5)).toBe(100);
  });
  it("returns 0 for all incorrect", () => {
    expect(calculateAccuracyPercent(0, 5)).toBe(0);
  });
  it("rounds correctly", () => {
    expect(calculateAccuracyPercent(2, 3)).toBe(67);
  });
});

// ── formatElapsedMs ───────────────────────────────────────────────────────────

describe("formatElapsedMs", () => {
  it("shows seconds only under 1 minute", () => {
    expect(formatElapsedMs(45000)).toBe("45s");
    expect(formatElapsedMs(1000)).toBe("1s");
  });
  it("shows minutes and seconds at 1+ minutes", () => {
    expect(formatElapsedMs(90000)).toBe("1m 30s");
    expect(formatElapsedMs(130000)).toBe("2m 10s");
  });
  it("pads seconds with leading zero", () => {
    expect(formatElapsedMs(65000)).toBe("1m 05s");
  });
});

// ── getMasteryFromStats ───────────────────────────────────────────────────────

describe("getMasteryFromStats", () => {
  it("not_studied for 0 attempts", () => {
    expect(getMasteryFromStats(0, 0)).toBe("not_studied");
  });
  it("learning for < 3 attempts regardless of accuracy", () => {
    expect(getMasteryFromStats(1, 1.0)).toBe("learning");
    expect(getMasteryFromStats(2, 0.0)).toBe("learning");
  });
  it("mastered when accuracy >= 0.85 with >= 3 attempts", () => {
    expect(getMasteryFromStats(3, 0.85)).toBe("mastered");
    expect(getMasteryFromStats(10, 1.0)).toBe("mastered");
  });
  it("weak when accuracy < 0.60 with >= 3 attempts", () => {
    expect(getMasteryFromStats(3, 0.59)).toBe("weak");
    expect(getMasteryFromStats(5, 0.0)).toBe("weak");
  });
  it("learning for intermediate accuracy with >= 3 attempts", () => {
    expect(getMasteryFromStats(4, 0.70)).toBe("learning");
    expect(getMasteryFromStats(3, 0.60)).toBe("learning");
  });
});

// ── Integration: full WHITE practice flow ────────────────────────────────────

describe("Full WHITE practice flow (integration)", () => {
  it("correctly identifies auto-play after each user move", () => {
    const nodes = WHITE_NODES;
    const side = "white";
    let index = 0;

    // Start: no auto-play, user plays first
    expect(getAutoMovesFromIndex(nodes, index, side)).toHaveLength(0);
    expect(isUserTurn(nodes[index], side)).toBe(true);

    // User plays e4 → index = 1
    index = 1;
    const auto1 = getAutoMovesFromIndex(nodes, index, side);
    expect(auto1).toHaveLength(1);
    expect(auto1[0].san).toBe("e5");

    // After auto-play e5 → index = 2
    index = 2;
    expect(getAutoMovesFromIndex(nodes, index, side)).toHaveLength(0);
    expect(isUserTurn(nodes[index], side)).toBe(true);

    // User plays Nf3 → index = 3
    index = 3;
    expect(isLineComplete(index, nodes.length)).toBe(true);
  });
});

// ── Integration: full BLACK practice flow ────────────────────────────────────

describe("Full BLACK practice flow (integration)", () => {
  it("auto-plays white at start, then alternates correctly", () => {
    const nodes = BLACK_NODES;
    const side = "black";
    let index = 0;

    // Start: auto-play white's 1.e4
    const auto0 = getAutoMovesFromIndex(nodes, index, side);
    expect(auto0).toHaveLength(1);
    expect(auto0[0].san).toBe("e4");

    // After auto e4 → index = 1, user plays e6
    index = 1;
    expect(isUserTurn(nodes[index], side)).toBe(true);

    // User plays e6 → index = 2
    index = 2;
    const auto2 = getAutoMovesFromIndex(nodes, index, side);
    expect(auto2).toHaveLength(1);
    expect(auto2[0].san).toBe("d4");

    // After auto d4 → index = 3, user plays d5
    index = 3;
    expect(isUserTurn(nodes[index], side)).toBe(true);

    // User plays d5 → line complete
    index = 4;
    expect(isLineComplete(index, nodes.length)).toBe(true);
  });
});
