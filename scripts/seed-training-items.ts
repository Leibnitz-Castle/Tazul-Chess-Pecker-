import { PrismaClient } from "@prisma/client";
import { Chess } from "chess.js";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface RawItem {
  id: string;
  fen: string;
  side_to_move: string;
  solution_moves: string[];
  solution_san: string | null;
  source_name: string;
  source_author: string;
  source_year: number;
  chapter: string | null;
  exercise_number: number | null;
  difficulty: string | null;
  theme: string | null;
  tags: string[];
  item_type: string;
  created_at: string;
}

function isValidFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const dataPath = join(process.cwd(), "data", "seeds", "training_items_playable.json");

  console.log(`Reading dataset from: ${dataPath}`);
  const raw = readFileSync(dataPath, "utf-8");
  const items: RawItem[] = JSON.parse(raw);

  console.log(`Total items in file: ${items.length}`);

  // Validate and filter
  let invalid = 0;
  let skipped = 0;
  const playable = items.filter((item) => {
    if (!item.solution_moves || item.solution_moves.length === 0) {
      skipped++;
      return false;
    }
    if (!isValidFen(item.fen)) {
      console.warn(`  INVALID FEN: ${item.id} — ${item.fen}`);
      invalid++;
      return false;
    }
    return true;
  });

  console.log(`Playable items (non-empty solution): ${playable.length}`);
  console.log(`Skipped (no solution): ${skipped}`);
  console.log(`Invalid FEN: ${invalid}`);
  console.log("\nImporting to PostgreSQL (upsert)...");

  let imported = 0;
  let errors = 0;
  const BATCH = 100;

  for (let i = 0; i < playable.length; i += BATCH) {
    const batch = playable.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (item) => {
        try {
          await prisma.trainingItem.upsert({
            where: { id: item.id },
            update: {
              fen: item.fen,
              sideToMove: item.side_to_move,
              solutionMoves: item.solution_moves,
              solutionSan: item.solution_san,
              sourceName: item.source_name,
              sourceAuthor: item.source_author,
              sourceYear: item.source_year,
              chapter: item.chapter,
              exerciseNumber: item.exercise_number,
              difficulty: item.difficulty,
              theme: item.theme,
              tags: item.tags,
              itemType: item.item_type,
            },
            create: {
              id: item.id,
              fen: item.fen,
              sideToMove: item.side_to_move,
              solutionMoves: item.solution_moves,
              solutionSan: item.solution_san,
              sourceName: item.source_name,
              sourceAuthor: item.source_author,
              sourceYear: item.source_year,
              chapter: item.chapter,
              exerciseNumber: item.exercise_number,
              difficulty: item.difficulty,
              theme: item.theme,
              tags: item.tags,
              itemType: item.item_type,
            },
          });
          imported++;
        } catch (err) {
          console.error(`  ERROR on ${item.id}:`, err);
          errors++;
        }
      })
    );

    if ((i / BATCH) % 5 === 0) {
      process.stdout.write(`  ${imported}/${playable.length} imported...\r`);
    }
  }

  console.log(`\n\nSeed complete:`);
  console.log(`  Imported/updated: ${imported}`);
  console.log(`  Errors:           ${errors}`);

  const total = await prisma.trainingItem.count();
  console.log(`  Total in DB:      ${total}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
