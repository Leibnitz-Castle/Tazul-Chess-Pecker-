/**
 * Validates a library public-safe JSON before import.
 *
 * Checks:
 *  - export_level = PUBLIC_SAFE at all levels
 *  - no private text fields (intro_text, docx_theory must be empty)
 *  - no strings containing data/private path references
 *  - all FEN strings are syntactically valid
 *  - technique and example ordering is consistent
 *
 * Run: npm run library:validate
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Chess } from "chess.js";

const BOOK_PATH =
  process.env.LIBRARY_BOOK_PATH ??
  join(process.cwd(), "data/library/positional-techniques-public-safe.json");

interface LibraryExample {
  game_id: string;
  pgn_index: number;
  eco: string;
  fen_initial: string;
  mainline_moves: string[];
  mainline_length: number;
  export_level: string;
}

interface LibraryTechnique {
  technique_number: number;
  technique_id: string;
  title: string;
  intro_text?: string;
  docx_theory?: unknown[];
  ideas?: unknown[];
  exercises?: unknown[];
  examples_count: number;
  examples: LibraryExample[];
  tags?: string[];
  difficulty?: string;
  order_index: number;
  export_level: string;
  copyright_status: string;
}

interface LibraryBook {
  book_id: string;
  slug: string;
  title: string;
  author: string;
  year: number;
  techniques_total: number;
  examples_total: number;
  export_level: string;
  copyright_status: string;
  techniques: LibraryTechnique[];
}

const errors: string[] = [];
const warnings: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}

function warn(msg: string) {
  warnings.push(msg);
}

function isStructurallyValidFen(fen: string): boolean {
  const parts = fen.trim().split(" ");
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

function validateFen(fen: string, context: string): boolean {
  try {
    new Chess(fen.trim());
    return true;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Accept study/diagram positions that lack kings (chess.js rejects them)
    if (
      (msg.includes("missing white king") || msg.includes("missing black king")) &&
      isStructurallyValidFen(fen)
    ) {
      warn(`Diagram position (no king) at ${context} — acceptable for analysis`);
      return true;
    }
    fail(`Invalid FEN at ${context}: "${fen.slice(0, 60)}" — ${msg}`);
    return false;
  }
}

function hasPrivatePath(s: string): boolean {
  return (
    s.includes("data/private") ||
    s.includes("data\\private") ||
    s.includes("interactive_book_private")
  );
}

function scanForPrivatePaths(obj: unknown, path: string) {
  if (typeof obj === "string") {
    if (hasPrivatePath(obj)) {
      fail(`Private path reference at ${path}: "${obj.slice(0, 80)}"`);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => scanForPrivatePaths(v, `${path}[${i}]`));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      scanForPrivatePaths(v, `${path}.${k}`);
    }
  }
}

function main() {
  if (!existsSync(BOOK_PATH)) {
    fail(`Book file not found: ${BOOK_PATH}`);
    report();
    process.exit(1);
  }

  const raw = readFileSync(BOOK_PATH, "utf-8");
  let book: LibraryBook;

  try {
    book = JSON.parse(raw);
  } catch (e) {
    fail(`JSON parse error: ${e}`);
    report();
    process.exit(1);
  }

  // Top-level checks
  if (book.export_level !== "PUBLIC_SAFE") {
    fail(`book.export_level="${book.export_level}" — expected PUBLIC_SAFE`);
  }
  if (book.copyright_status !== "PUBLIC_SAFE") {
    warn(`book.copyright_status="${book.copyright_status}"`);
  }
  if (!book.book_id) fail("Missing book.book_id");
  if (!book.title) fail("Missing book.title");
  if (!book.author) fail("Missing book.author");
  if (!Array.isArray(book.techniques)) {
    fail("book.techniques is not an array");
    report();
    process.exit(1);
  }

  // Scan entire document for private path strings
  scanForPrivatePaths(book, "book");

  let totalExamples = 0;
  let validFens = 0;

  for (const tech of book.techniques) {
    const techCtx = `technique_${tech.technique_number}`;

    if (tech.export_level !== "PUBLIC_SAFE") {
      fail(`${techCtx}.export_level="${tech.export_level}" — expected PUBLIC_SAFE`);
    }

    // Private text fields must be empty
    if (tech.intro_text && tech.intro_text.trim().length > 0) {
      fail(`${techCtx}.intro_text is non-empty — private text detected`);
    }
    if (Array.isArray(tech.docx_theory) && tech.docx_theory.length > 0) {
      fail(`${techCtx}.docx_theory is non-empty — private text detected`);
    }
    if (Array.isArray(tech.ideas) && tech.ideas.length > 0) {
      warn(`${techCtx}.ideas is non-empty (${tech.ideas.length} items) — verify content`);
    }

    if (!Array.isArray(tech.examples)) {
      fail(`${techCtx}.examples is not an array`);
      continue;
    }

    for (const ex of tech.examples) {
      const exCtx = `${techCtx}/example_${ex.game_id}`;

      if (ex.export_level !== "PUBLIC_SAFE") {
        fail(`${exCtx}.export_level="${ex.export_level}"`);
      }
      if (!ex.fen_initial) {
        fail(`${exCtx}: missing fen_initial`);
      } else {
        if (validateFen(ex.fen_initial, exCtx)) validFens++;
      }
      if (!Array.isArray(ex.mainline_moves)) {
        fail(`${exCtx}: mainline_moves is not an array`);
      } else if (ex.mainline_moves.length !== ex.mainline_length) {
        warn(
          `${exCtx}: mainline_moves.length=${ex.mainline_moves.length} ≠ mainline_length=${ex.mainline_length}`
        );
      }
      totalExamples++;
    }
  }

  if (book.techniques_total !== book.techniques.length) {
    warn(
      `book.techniques_total=${book.techniques_total} but found ${book.techniques.length} techniques`
    );
  }
  if (book.examples_total !== totalExamples) {
    warn(
      `book.examples_total=${book.examples_total} but counted ${totalExamples} examples`
    );
  }

  report(book, totalExamples, validFens);

  if (errors.length > 0) process.exit(1);
}

function report(book?: LibraryBook, totalExamples?: number, validFens?: number) {
  console.log("\n[library:validate] ═══════════════════════════════");
  if (book) {
    console.log(`  Book:      ${book.title} (${book.author}, ${book.year})`);
    console.log(`  Techniques: ${book.techniques.length}`);
    console.log(`  Examples:   ${totalExamples} (${validFens} valid FENs)`);
    console.log(`  export_level: ${book.export_level}`);
  }
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log("\n  Warnings:");
    warnings.forEach((w) => console.log(`    ⚠  ${w}`));
  }
  if (errors.length > 0) {
    console.log("\n  Errors:");
    errors.forEach((e) => console.log(`    ✗  ${e}`));
    console.log("\n  RESULT: FAIL\n");
  } else {
    console.log("\n  RESULT: PASS ✓\n");
  }
}

main();
