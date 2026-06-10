/**
 * Opening Repertoire Import Script
 *
 * Reads PGN files from data/private/openings/ and imports them into the DB.
 * Run: npm run openings:import
 *
 * Flags:
 *   --reimport   Delete and re-import existing repertoires
 *   --white-only Import only white repertoire
 *   --black-only Import only black repertoire
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { importOpeningRepertoire } from "../lib/openings/repertoire-import";
import type { ImportReport } from "../lib/openings/opening-types";

const prisma = new PrismaClient();

const WHITE_PGN_PATH = join(
  process.cwd(),
  "data/private/openings/repertoire_white.pgn"
);
const BLACK_PGN_PATH = join(
  process.cwd(),
  "data/private/openings/repertoire_black.pgn"
);
const REPORT_PATH = join(
  process.cwd(),
  "data/private/openings/import-report.json"
);

const args = process.argv.slice(2);
const reimport = args.includes("--reimport");
const whiteOnly = args.includes("--white-only");
const blackOnly = args.includes("--black-only");

function log(msg: string) {
  console.log(`[openings:import] ${msg}`);
}

function formatReport(report: ImportReport): string {
  const lines = [
    `  Repertoire: ${report.repertoireName} (${report.color})`,
    `  ID:         ${report.repertoireId || "— not created"}`,
    `  PGN games:  ${report.totalGamesInPgn}`,
    `  Lines:      ${report.linesCreated} created, ${report.linesSkipped} skipped`,
    `  Nodes:      ${report.nodesCreated} created, ${report.nodesReused} reused`,
    `  ECO codes:  ${Object.keys(report.ecoDistribution).sort().join(", ") || "none"}`,
  ];
  if (report.parseErrors.length > 0) {
    lines.push(`  Errors (${report.parseErrors.length}):`);
    for (const e of report.parseErrors.slice(0, 10)) {
      lines.push(`    [${e.gameIndex}] ${e.lineName}: ${e.message}`);
    }
    if (report.parseErrors.length > 10) {
      lines.push(`    ... and ${report.parseErrors.length - 10} more`);
    }
  }
  return lines.join("\n");
}

async function main() {
  log("Starting opening repertoire import…");
  if (reimport) log("--reimport flag: existing repertoires will be deleted.");

  const reports: ImportReport[] = [];

  // ── White repertoire ──────────────────────────────────────────────────────
  if (!blackOnly) {
    if (!existsSync(WHITE_PGN_PATH)) {
      log(`ERROR: White PGN not found at ${WHITE_PGN_PATH}`);
      log("  → Export from ChessBase and place at data/private/openings/repertoire_white.pgn");
    } else {
      log("Importing White — Sicilian & e4 Repertoire…");
      const pgn = readFileSync(WHITE_PGN_PATH, "utf-8");
      try {
        const report = await importOpeningRepertoire(prisma, {
          pgn,
          color: "WHITE",
          name: "White — Sicilian & e4 Repertoire",
          sourceName: "repertoire_white.pgn",
          description:
            "1.e4 repertoire with Sicilian Najdorf, Dragon, Classical Rauzer, and other e4 lines",
          sourceType: "CHESSBASE_EXPORT",
          reimport,
        });
        reports.push(report);
        log("White import complete:");
        log(formatReport(report));
      } catch (err) {
        log(`ERROR importing white repertoire: ${(err as Error).message}`);
        console.error(err);
      }
    }
  }

  // ── Black repertoire ──────────────────────────────────────────────────────
  if (!whiteOnly) {
    if (!existsSync(BLACK_PGN_PATH)) {
      log(`ERROR: Black PGN not found at ${BLACK_PGN_PATH}`);
      log("  → Export from ChessBase and place at data/private/openings/repertoire_black.pgn");
    } else {
      log("Importing Black — Sicilian Classical & Semislav…");
      const pgn = readFileSync(BLACK_PGN_PATH, "utf-8");
      try {
        const report = await importOpeningRepertoire(prisma, {
          pgn,
          color: "BLACK",
          name: "Black — Sicilian Classical & Semislav",
          sourceName: "repertoire_black.pgn",
          description:
            "Black repertoire: Sicilian Classical (6.Bg5, 6.Bc4, 6.f3, 6.Be3), Semi-Slav, 1.d4 lines",
          sourceType: "CHESSBASE_EXPORT",
          reimport,
        });
        reports.push(report);
        log("Black import complete:");
        log(formatReport(report));
      } catch (err) {
        log(`ERROR importing black repertoire: ${(err as Error).message}`);
        console.error(err);
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalLines = reports.reduce((s, r) => s + r.linesCreated, 0);
  const totalNodes = reports.reduce((s, r) => s + r.nodesCreated, 0);
  const totalErrors = reports.reduce((s, r) => s + r.parseErrors.length, 0);
  log(`\n── Summary ────────────────────────────────────`);
  log(`  Repertoires: ${reports.length}`);
  log(`  Total lines: ${totalLines}`);
  log(`  Total nodes: ${totalNodes}`);
  log(`  Parse errors: ${totalErrors}`);
  log(`──────────────────────────────────────────────`);

  // Save report locally (ignored by git)
  writeFileSync(REPORT_PATH, JSON.stringify(reports, null, 2), "utf-8");
  log(`\nReport saved to ${REPORT_PATH}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
