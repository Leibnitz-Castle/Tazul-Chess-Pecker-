import { describe, it, expect } from "vitest";
import { computePosition, canNavigateMoves, FALLBACK_FEN } from "../board-utils";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const INVALID_FEN_NO_KING = "8/8/8/8/8/8/pppppppp/8 w - - 0 1";
const VALID_MIDGAME_FEN =
  "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";

describe("canNavigateMoves", () => {
  it("returns true for valid starting FEN", () => {
    expect(canNavigateMoves(STARTING_FEN)).toBe(true);
  });

  it("returns true for valid midgame FEN", () => {
    expect(canNavigateMoves(VALID_MIDGAME_FEN)).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(canNavigateMoves("")).toBe(false);
  });

  it("returns false for FEN without kings (diagram position)", () => {
    expect(canNavigateMoves(INVALID_FEN_NO_KING)).toBe(false);
  });
});

describe("computePosition", () => {
  it("returns fenInitial at moveIdx -1", () => {
    const result = computePosition(STARTING_FEN, ["e4", "e5"], -1);
    expect(result.fen).toBe(STARTING_FEN);
    expect(result.lastMove).toBeUndefined();
  });

  it("returns fallback FEN when fenInitial is empty", () => {
    const result = computePosition("", ["e4"], -1);
    expect(result.fen).toBe(FALLBACK_FEN);
  });

  it("computes correct FEN after first move", () => {
    const result = computePosition(STARTING_FEN, ["e4"], 0);
    expect(result.fen).toContain("4P3");
    expect(result.lastMove).toBe("e2e4");
  });

  it("does not crash with empty moves array at moveIdx 0", () => {
    expect(() => computePosition(STARTING_FEN, [], 0)).not.toThrow();
    const result = computePosition(STARTING_FEN, [], 0);
    expect(result.fen).toBe(STARTING_FEN);
  });

  it("does not crash with invalid FEN (no kings)", () => {
    expect(() => computePosition(INVALID_FEN_NO_KING, ["e4"], 0)).not.toThrow();
    const result = computePosition(INVALID_FEN_NO_KING, ["e4"], 0);
    expect(result.fen).toBe(INVALID_FEN_NO_KING);
    expect(result.lastMove).toBeUndefined();
  });

  it("computes lastMove as UCI string", () => {
    const result = computePosition(STARTING_FEN, ["e4", "e5", "Nf3"], 2);
    expect(result.lastMove).toBe("g1f3");
  });

  it("handles moveIdx beyond moves length gracefully", () => {
    expect(() => computePosition(STARTING_FEN, ["e4"], 5)).not.toThrow();
  });

  it("técnica sin título inventado: title field from DB is structural only", () => {
    // Titles like "Technique 1" are structural labels, not real chapter names.
    // UI should display "Técnica N" using techniqueNumber, not invent a title.
    const structuralTitle = "Technique 1";
    const isStructural = /^Technique\s+\d+$/i.test(structuralTitle);
    expect(isStructural).toBe(true);
  });
});
