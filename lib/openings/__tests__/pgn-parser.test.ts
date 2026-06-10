import { describe, it, expect } from "vitest";
import {
  parsePgnHeaders,
  splitPgnGames,
  stripAnnotations,
  tokenizeMoveText,
  sanSequenceToParsedMoves,
  parsePgnGame,
  parsePgnFile,
} from "../pgn-parser";

// ── stripAnnotations ──────────────────────────────────────────────────────────

describe("stripAnnotations", () => {
  it("removes curly-brace comments", () => {
    const result = stripAnnotations("1. e4 {[%cal Yd1f3]} e5");
    expect(result).not.toContain("{");
    expect(result).toContain("e4");
    expect(result).toContain("e5");
  });

  it("removes NAG symbols", () => {
    const result = stripAnnotations("1. e4 $17 e5 $2");
    expect(result).not.toContain("$");
  });

  it("removes result markers", () => {
    const result = stripAnnotations("1. e4 e5 2. Nf3 *");
    expect(result.trim()).not.toMatch(/\*$/);
  });

  it("normalizes whitespace", () => {
    const result = stripAnnotations("1. e4    e5   2. Nf3");
    expect(result).not.toContain("  ");
  });
});

// ── parsePgnHeaders ───────────────────────────────────────────────────────────

describe("parsePgnHeaders", () => {
  it("parses standard headers", () => {
    const pgn = `[Event "?"]\n[White "Najdorf"]\n[ECO "B95"]\n\n1. e4`;
    const headers = parsePgnHeaders(pgn);
    expect(headers.Event).toBe("?");
    expect(headers.White).toBe("Najdorf");
    expect(headers.ECO).toBe("B95");
  });

  it("handles missing headers gracefully", () => {
    const headers = parsePgnHeaders("1. e4 e5");
    expect(headers.White).toBeUndefined();
  });
});

// ── splitPgnGames ─────────────────────────────────────────────────────────────

describe("splitPgnGames", () => {
  it("splits two games correctly", () => {
    const pgn = `[Event "?"]\n[White "Line1"]\n\n1. e4 *\n\n[Event "?"]\n[White "Line2"]\n\n1. d4 *`;
    const games = splitPgnGames(pgn);
    expect(games).toHaveLength(2);
    expect(games[0]).toContain("Line1");
    expect(games[1]).toContain("Line2");
  });

  it("handles single game", () => {
    const pgn = `[Event "?"]\n[White "Solo"]\n\n1. e4 e5`;
    const games = splitPgnGames(pgn);
    expect(games).toHaveLength(1);
  });

  it("does not split on ChessBase [%cal/%csl annotation continuations", () => {
    // ChessBase sometimes puts { at end of one line and [%cal...] on the next
    const pgn = [
      `[Event "?"]`,
      `[White "Line1"]`,
      ``,
      `1. e4 c5 2. Nf3 d6 3. d4 Nd5 {`,
      `[%cal Yd1d4]} 4. Nxd4 *`,
      ``,
      `[Event "?"]`,
      `[White "Line2"]`,
      ``,
      `1. d4 d5 *`,
    ].join("\n");
    const games = splitPgnGames(pgn);
    expect(games).toHaveLength(2);
    expect(games[0]).toContain("Line1");
    expect(games[0]).toContain("[%cal");
    expect(games[1]).toContain("Line2");
  });

  it("strips BOM from start of file", () => {
    const pgn = `﻿[Event "?"]\n[White "Solo"]\n\n1. e4 e5`;
    const games = splitPgnGames(pgn);
    expect(games).toHaveLength(1);
  });
});

// ── sanSequenceToParsedMoves ──────────────────────────────────────────────────

describe("sanSequenceToParsedMoves", () => {
  it("converts basic Italian Game SAN sequence to ParsedMoves", () => {
    const moves = sanSequenceToParsedMoves(["e4", "e5", "Nf3", "Nc6", "Bc4"]);
    expect(moves).not.toBeNull();
    expect(moves!).toHaveLength(5);
    expect(moves![0].san).toBe("e4");
    expect(moves![0].uci).toBe("e2e4");
    expect(moves![0].moveNumber).toBe(1);
    expect(moves![0].ply).toBe(1);
    expect(moves![1].san).toBe("e5");
    expect(moves![1].uci).toBe("e7e5");
    expect(moves![1].moveNumber).toBe(1);
    expect(moves![1].ply).toBe(2);
    expect(moves![2].moveNumber).toBe(2);
  });

  it("generates correct FEN before/after", () => {
    const moves = sanSequenceToParsedMoves(["e4"]);
    expect(moves![0].fenBefore).toContain("w KQkq");
    expect(moves![0].fenAfter).toContain("b KQkq");
  });

  it("returns null for illegal moves", () => {
    const moves = sanSequenceToParsedMoves(["e4", "e5", "ILLEGAL"]);
    expect(moves).toBeNull();
  });

  it("handles promotion", () => {
    // Use a known promotion FEN
    const promotionFen = "8/P7/8/8/8/8/8/K1k5 w - - 0 1";
    const moves = sanSequenceToParsedMoves(["a8=Q"], promotionFen);
    expect(moves).not.toBeNull();
    expect(moves![0].uci).toBe("a7a8q");
  });
});

// ── parsePgnGame ──────────────────────────────────────────────────────────────

describe("parsePgnGame", () => {
  const simplePgn = `[Event "?"]\n[White "Dragon"]\n[ECO "B76"]\n\n1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 *`;

  it("parses a simple game", () => {
    const { game, error } = parsePgnGame(simplePgn, "white", 0);
    expect(error).toBeNull();
    expect(game).not.toBeNull();
    expect(game!.lineName).toBe("Dragon");
    expect(game!.eco).toBe("B76");
    expect(game!.mainLine.length).toBeGreaterThan(0);
    expect(game!.mainLine[0].san).toBe("e4");
  });

  it("extracts ECO from headers", () => {
    const { game } = parsePgnGame(simplePgn, "white", 0);
    expect(game!.eco).toBe("B76");
  });

  it("uses side parameter", () => {
    const { game } = parsePgnGame(simplePgn, "black", 0);
    expect(game!.side).toBe("black");
  });

  it("handles game with variations", () => {
    const pgnWithVar = `[Event "?"]\n[White "Najdorf"]\n[ECO "B95"]\n\n1. e4 c5 (1... e5 2. Nf3) 2. Nf3 *`;
    const { game, error } = parsePgnGame(pgnWithVar, "white", 0);
    expect(error).toBeNull();
    expect(game).not.toBeNull();
    // Should produce at least the main line
    expect(game!.mainLine.length).toBeGreaterThan(0);
    // Should produce multiple lines (main + variation)
    expect(game!.allLines.length).toBeGreaterThanOrEqual(1);
  });

  it("returns error for empty game", () => {
    const { game, error } = parsePgnGame("[White \"Test\"]\n\n", "white", 0);
    expect(game).toBeNull();
    expect(error).not.toBeNull();
  });

  it("handles annotations containing ] without misidentifying move text boundary", () => {
    // {[%csl Rg7]} contains ] — parsePgnGame must not use lastIndexOf("]") to find move text
    const pgnWithAnnotation = [
      `[Event "?"]`,
      `[White "Dragon"]`,
      `[ECO "B76"]`,
      ``,
      `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 {[%csl Rg7]} *`,
    ].join("\n");
    const { game, error } = parsePgnGame(pgnWithAnnotation, "white", 0);
    expect(error).toBeNull();
    expect(game).not.toBeNull();
    expect(game!.mainLine.length).toBe(10);
  });
});

// ── parsePgnFile ──────────────────────────────────────────────────────────────

describe("parsePgnFile", () => {
  it("parses multiple games", () => {
    const pgn = `[Event "?"]\n[White "Line1"]\n[ECO "C50"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 *\n\n[Event "?"]\n[White "Line2"]\n[ECO "B90"]\n\n1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 *`;
    const { games, errors } = parsePgnFile(pgn, "white");
    expect(errors).toHaveLength(0);
    expect(games).toHaveLength(2);
    expect(games[0].lineName).toBe("Line1");
    expect(games[1].lineName).toBe("Line2");
  });

  it("reports parse errors without crashing", () => {
    const pgn = `[Event "?"]\n[White "Good"]\n\n1. e4 e5 *\n\n[Event "?"]\n[White "Bad"]\n\n`;
    const { games, errors } = parsePgnFile(pgn, "white");
    expect(games).toHaveLength(1);
    expect(errors).toHaveLength(1);
  });
});
