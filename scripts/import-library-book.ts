/**
 * Dynamic Library — Book Import Script
 *
 * Reads a PUBLIC_SAFE book JSON and upserts:
 *   LibraryBook → LibraryTechnique → LibraryExample
 *
 * Safety gate: aborts if export_level ≠ PUBLIC_SAFE at any level.
 * NEVER imports private text fields (intro_text, docx_theory).
 *
 * Run: npm run library:import
 * Flags:
 *   --dry-run   Parse and validate without writing to DB
 *   --reimport  Delete existing book record before importing
 */

import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const BOOK_PATH =
  process.env.LIBRARY_BOOK_PATH ??
  join(process.cwd(), "data/library/positional-techniques-public-safe.json");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const REIMPORT = args.includes("--reimport");

function log(msg: string) {
  console.log(`[library:import] ${msg}`);
}

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
  generated?: string;
  techniques: LibraryTechnique[];
}

function assertPublicSafe(level: string, context: string) {
  if (level !== "PUBLIC_SAFE") {
    throw new Error(
      `SECURITY: export_level="${level}" at ${context} — aborting import. Only PUBLIC_SAFE data is allowed.`
    );
  }
}

function assertNoPrivateText(tech: LibraryTechnique) {
  if (tech.intro_text && tech.intro_text.trim().length > 0) {
    throw new Error(
      `SECURITY: technique_${tech.technique_number}.intro_text is non-empty — private text detected`
    );
  }
  if (Array.isArray(tech.docx_theory) && tech.docx_theory.length > 0) {
    throw new Error(
      `SECURITY: technique_${tech.technique_number}.docx_theory is non-empty — private text detected`
    );
  }
}

async function main() {
  if (!existsSync(BOOK_PATH)) {
    throw new Error(`Book file not found: ${BOOK_PATH}`);
  }

  log(`Reading: ${BOOK_PATH}`);
  const raw = readFileSync(BOOK_PATH, "utf-8");
  const book: LibraryBook = JSON.parse(raw);

  // Security gates
  assertPublicSafe(book.export_level, "book");
  assertPublicSafe(book.copyright_status, "book.copyright_status");
  for (const tech of book.techniques) {
    assertPublicSafe(tech.export_level, `technique_${tech.technique_number}`);
    assertNoPrivateText(tech);
    for (const ex of tech.examples) {
      assertPublicSafe(ex.export_level, `technique_${tech.technique_number}/example_${ex.game_id}`);
    }
  }

  log(`Validated: "${book.title}" — ${book.techniques.length} techniques, examples to be counted`);

  if (DRY_RUN) {
    log("--dry-run: skipping DB writes");
    let totalExamples = 0;
    for (const tech of book.techniques) totalExamples += tech.examples.length;
    log(`Would import: 1 book, ${book.techniques.length} techniques, ${totalExamples} examples`);
    return;
  }

  // Optional: wipe existing book before reimport
  if (REIMPORT) {
    const existing = await prisma.libraryBook.findUnique({ where: { bookId: book.book_id } });
    if (existing) {
      log(`--reimport: deleting existing book "${existing.title}" (${existing.id})`);
      await prisma.libraryBook.delete({ where: { id: existing.id } });
    }
  }

  // Upsert LibraryBook
  const generatedAt = book.generated ? new Date(book.generated) : null;

  const bookRecord = await prisma.libraryBook.upsert({
    where: { bookId: book.book_id },
    update: {
      slug: book.slug,
      title: book.title,
      author: book.author,
      year: book.year,
      techniquesTotal: book.techniques_total,
      examplesTotal: book.examples_total,
      exportLevel: book.export_level,
      generatedAt,
    },
    create: {
      bookId: book.book_id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      year: book.year,
      techniquesTotal: book.techniques_total,
      examplesTotal: book.examples_total,
      exportLevel: book.export_level,
      generatedAt,
    },
  });

  log(`Book upserted: id=${bookRecord.id}`);

  let techniquesCreated = 0;
  let techniquesUpdated = 0;
  let examplesCreated = 0;
  let examplesUpdated = 0;

  for (const tech of book.techniques) {
    // Upsert LibraryTechnique
    const existing = await prisma.libraryTechnique.findUnique({
      where: { bookId_techniqueNumber: { bookId: bookRecord.id, techniqueNumber: tech.technique_number } },
    });

    const techData = {
      techniqueId: tech.technique_id,
      title: tech.title,
      examplesCount: tech.examples_count,
      tags: tech.tags ?? [],
      difficulty: tech.difficulty ?? null,
      orderIndex: tech.order_index,
      exportLevel: tech.export_level,
    };

    let techRecord: { id: string };

    if (existing) {
      techRecord = await prisma.libraryTechnique.update({
        where: { id: existing.id },
        data: techData,
      });
      techniquesUpdated++;
    } else {
      techRecord = await prisma.libraryTechnique.create({
        data: {
          bookId: bookRecord.id,
          techniqueNumber: tech.technique_number,
          ...techData,
        },
      });
      techniquesCreated++;
    }

    // Upsert LibraryExample records for this technique
    for (let i = 0; i < tech.examples.length; i++) {
      const ex = tech.examples[i];
      const existingEx = await prisma.libraryExample.findFirst({
        where: { techniqueId: techRecord.id, gameId: ex.game_id },
      });

      const exData = {
        pgnIndex: ex.pgn_index,
        eco: ex.eco || null,
        fenInitial: ex.fen_initial,
        mainlineMoves: ex.mainline_moves,
        mainlineLength: ex.mainline_length,
        orderIndex: i,
        exportLevel: ex.export_level,
      };

      if (existingEx) {
        await prisma.libraryExample.update({ where: { id: existingEx.id }, data: exData });
        examplesUpdated++;
      } else {
        await prisma.libraryExample.create({
          data: {
            techniqueId: techRecord.id,
            gameId: ex.game_id,
            ...exData,
          },
        });
        examplesCreated++;
      }
    }

    if (tech.technique_number % 10 === 0) {
      log(`  …technique ${tech.technique_number}/${book.techniques_total}`);
    }
  }

  log(`\nImport complete:`);
  log(`  Techniques: ${techniquesCreated} created, ${techniquesUpdated} updated`);
  log(`  Examples:   ${examplesCreated} created, ${examplesUpdated} updated`);
  log(`  Total:      ${techniquesCreated + techniquesUpdated} techniques, ${examplesCreated + examplesUpdated} examples`);
}

main()
  .catch((e) => {
    console.error(`[library:import] ERROR: ${e.message}`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
