/**
 * Import real technique titles into LibraryTechnique.title
 *
 * Reads data/library/public-safe/positional-technique-titles.json
 * Updates only the `title` field on matching LibraryTechnique records.
 *
 * Safety rules:
 *   - Only processes entries with exportLevel = "PUBLIC_SAFE"
 *   - Rejects titles with more than 10 words (not a short title)
 *   - Never touches examples, FEN, or private fields
 *   - Dry-run by default — pass --apply to write to DB
 *
 * Run: npm run library:import-titles
 * Run (apply): npm run library:import-titles -- --apply
 */

import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const TITLES_PATH =
  process.env.TITLES_PATH ??
  join(process.cwd(), "data/library/public-safe/positional-technique-titles.json");

const BOOK_ID_SLUG = "positional-techniques";

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");

const MAX_TITLE_WORDS = 10;

function log(msg: string) {
  console.log(`[library:import-titles] ${msg}`);
}

interface TitleEntry {
  techniqueNumber: number;
  title: string | null;
  source: string;
  exportLevel: string;
  wordCount: number | null;
  notes?: string;
}

function validateTitle(entry: TitleEntry): string | null {
  if (!entry.title) return null;

  const wordCount = entry.title.trim().split(/\s+/).length;
  if (wordCount > MAX_TITLE_WORDS) {
    throw new Error(
      `SECURITY: technique ${entry.techniqueNumber} title is ${wordCount} words — exceeds max ${MAX_TITLE_WORDS}. ` +
      `Title: "${entry.title}"`
    );
  }

  if (entry.title.includes("/") || entry.title.includes("\\") || entry.title.includes("..")) {
    throw new Error(
      `SECURITY: technique ${entry.techniqueNumber} title contains path-like characters. ` +
      `Title: "${entry.title}"`
    );
  }

  if (entry.title.trim().length > 80) {
    throw new Error(
      `SECURITY: technique ${entry.techniqueNumber} title is too long (${entry.title.length} chars). ` +
      `Max 80 chars.`
    );
  }

  return entry.title.trim();
}

async function main() {
  if (!existsSync(TITLES_PATH)) {
    throw new Error(`Titles file not found: ${TITLES_PATH}`);
  }

  log(`Reading: ${TITLES_PATH}`);
  const raw = readFileSync(TITLES_PATH, "utf-8");
  const entries: TitleEntry[] = JSON.parse(raw);

  log(`Loaded ${entries.length} title entries`);

  if (!APPLY) {
    log("DRY-RUN mode (no --apply flag). No DB writes will occur.");
    log("Add --apply flag to commit changes.");
  }

  // Find the book
  const book = await prisma.libraryBook.findUnique({
    where: { slug: BOOK_ID_SLUG },
    include: { techniques: { select: { id: true, techniqueNumber: true, title: true } } },
  });

  if (!book) {
    throw new Error(`Book not found in DB: slug="${BOOK_ID_SLUG}"`);
  }

  log(`Found book: "${book.title}" (${book.techniques.length} techniques)`);

  const techniqueMap = new Map(book.techniques.map((t) => [t.techniqueNumber, t]));

  let updated = 0;
  let skippedPending = 0;
  let skippedNoChange = 0;
  let notFound = 0;

  const report: Array<{ techniqueNumber: number; action: string; oldTitle: string; newTitle: string }> = [];

  for (const entry of entries) {
    if (entry.exportLevel !== "PUBLIC_SAFE") {
      skippedPending++;
      continue;
    }

    const validTitle = validateTitle(entry);
    if (!validTitle) {
      skippedPending++;
      continue;
    }

    const existing = techniqueMap.get(entry.techniqueNumber);
    if (!existing) {
      log(`  WARNING: technique ${entry.techniqueNumber} not found in DB`);
      notFound++;
      continue;
    }

    if (existing.title === validTitle) {
      skippedNoChange++;
      continue;
    }

    report.push({
      techniqueNumber: entry.techniqueNumber,
      action: APPLY ? "UPDATED" : "WOULD UPDATE",
      oldTitle: existing.title,
      newTitle: validTitle,
    });

    if (APPLY) {
      await prisma.libraryTechnique.update({
        where: { id: existing.id },
        data: { title: validTitle },
      });
      updated++;
    }
  }

  log(`\nReport:`);
  for (const r of report) {
    log(`  T${String(r.techniqueNumber).padStart(2, "0")}: ${r.action}`);
    log(`    "${r.oldTitle}" → "${r.newTitle}"`);
  }

  log(`\nSummary:`);
  log(`  ${APPLY ? "Updated" : "Would update"}: ${APPLY ? updated : report.length}`);
  log(`  Skipped (pending/null): ${skippedPending}`);
  log(`  Skipped (no change): ${skippedNoChange}`);
  log(`  Not found in DB: ${notFound}`);

  if (!APPLY) {
    log(`\nRun with --apply to apply the changes.`);
  }
}

main()
  .catch((e) => {
    console.error(`[library:import-titles] ERROR: ${e.message}`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
