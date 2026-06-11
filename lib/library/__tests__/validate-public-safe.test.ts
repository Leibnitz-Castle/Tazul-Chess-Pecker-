import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { Chess } from "chess.js";

const BOOK_PATH = join(process.cwd(), "data/library/positional-techniques-public-safe.json");

/**
 * Structural FEN check: 6 space-delimited fields, valid board rows.
 * Looser than chess.js which rejects study/diagram positions without kings.
 */
function isStructurallyValidFen(fen: string): boolean {
  const trimmed = fen.trim();
  const parts = trimmed.split(" ");
  if (parts.length !== 6) return false;
  const rows = parts[0].split("/");
  if (rows.length !== 8) return false;
  for (const row of rows) {
    let count = 0;
    for (const ch of row) {
      if (/[1-8]/.test(ch)) count += parseInt(ch, 10);
      else if (/[pnbrqkPNBRQK]/.test(ch)) count += 1;
      else return false;
    }
    if (count !== 8) return false;
  }
  return true;
}

function isValidFen(fen: string): boolean {
  // Use chess.js for full legality, fall back to structural for study positions
  try {
    new Chess(fen.trim());
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Accept positions that are structurally valid but missing kings (analysis diagrams)
    if (msg.includes("missing white king") || msg.includes("missing black king")) {
      return isStructurallyValidFen(fen);
    }
    return false;
  }
}

describe("positional-techniques public-safe JSON", () => {
  it("file exists at data/library/", () => {
    expect(existsSync(BOOK_PATH)).toBe(true);
  });

  const raw = existsSync(BOOK_PATH) ? readFileSync(BOOK_PATH, "utf-8") : "{}";
  const book = JSON.parse(raw) as Record<string, unknown> & {
    export_level: string;
    book_id?: string;
    title?: string;
    author?: string;
    year?: number;
    examples_total?: number;
    techniques?: Array<{
      technique_number: number;
      export_level: string;
      intro_text?: string;
      docx_theory?: unknown[];
      examples?: Array<{
        game_id: string;
        export_level: string;
        fen_initial: string;
        mainline_moves: unknown;
      }>;
    }>;
  };

  it("top-level export_level is PUBLIC_SAFE", () => {
    expect(book.export_level).toBe("PUBLIC_SAFE");
  });

  it("has expected book metadata", () => {
    expect(book.book_id).toBeTruthy();
    expect(book.title).toBeTruthy();
    expect(book.author).toBeTruthy();
    expect(typeof book.year).toBe("number");
  });

  it("has at least 40 techniques", () => {
    expect(Array.isArray(book.techniques)).toBe(true);
    expect(book.techniques!.length).toBeGreaterThanOrEqual(40);
  });

  it("all techniques have PUBLIC_SAFE export_level", () => {
    const violations = book.techniques
      ?.filter((t: { export_level: string }) => t.export_level !== "PUBLIC_SAFE")
      .map((t: { technique_number: number }) => t.technique_number);
    expect(violations).toHaveLength(0);
  });

  it("no technique has non-empty intro_text (private text guard)", () => {
    const leaks = book.techniques?.filter(
      (t: { intro_text?: string }) => t.intro_text && t.intro_text.trim().length > 0
    );
    expect(leaks).toHaveLength(0);
  });

  it("no technique has non-empty docx_theory (private text guard)", () => {
    const leaks = book.techniques?.filter(
      (t: { docx_theory?: unknown[] }) => Array.isArray(t.docx_theory) && t.docx_theory.length > 0
    );
    expect(leaks).toHaveLength(0);
  });

  it("all examples have PUBLIC_SAFE export_level", () => {
    const violations: string[] = [];
    for (const tech of book.techniques ?? []) {
      for (const ex of tech.examples ?? []) {
        if (ex.export_level !== "PUBLIC_SAFE") {
          violations.push(`${tech.technique_number}/${ex.game_id}`);
        }
      }
    }
    expect(violations).toHaveLength(0);
  });

  it("all fen_initial strings are valid FENs", () => {
    const invalid: string[] = [];
    for (const tech of book.techniques ?? []) {
      for (const ex of tech.examples ?? []) {
        if (!isValidFen(ex.fen_initial)) {
          invalid.push(`${tech.technique_number}/${ex.game_id}: "${ex.fen_initial?.slice(0, 40)}"`);
        }
      }
    }
    expect(invalid).toHaveLength(0);
  });

  it("no strings contain data/private path references", () => {
    const jsonText = JSON.stringify(book);
    expect(jsonText).not.toContain("data/private");
    expect(jsonText).not.toContain("data\\private");
    expect(jsonText).not.toContain("interactive_book_private");
  });

  it("examples_total matches actual count", () => {
    let total = 0;
    for (const tech of book.techniques ?? []) total += tech.examples?.length ?? 0;
    expect(book.examples_total).toBe(total);
  });

  it("technique numbers are 1-indexed and unique", () => {
    const nums: number[] = (book.techniques ?? []).map(
      (t: { technique_number: number }) => t.technique_number
    );
    const unique = new Set(nums);
    expect(unique.size).toBe(nums.length);
    expect(Math.min(...nums)).toBeGreaterThanOrEqual(1);
  });

  it("each example has fen_initial and mainline_moves", () => {
    const missing: string[] = [];
    for (const tech of book.techniques ?? []) {
      for (const ex of tech.examples ?? []) {
        if (!ex.fen_initial || !Array.isArray(ex.mainline_moves)) {
          missing.push(`${tech.technique_number}/${ex.game_id}`);
        }
      }
    }
    expect(missing).toHaveLength(0);
  });
});
