/**
 * Stable, book-correct ordering for Woodpecker exercises.
 *
 * WM1 chapters are NOT alphabetical — they follow the book's logical progression.
 * WM2 chapters are numeric ranges that sort by their start number.
 */

const WM1_CHAPTER_ORDER: Record<string, number> = {
  "Introduction": 0,
  "Easy Exercises": 1,
  "Intermediate Exercises I": 2,
  "Intermediate Exercises III": 3,
  "Advanced Exercises": 4,
  "Summary Of Tactical Motifs": 5,
};

/** Extract the numeric start from "Chapter 1-50" → 1, "Chapter Epilogue" → 99999 */
function wm2ChapterSortKey(chapter: string): number {
  const m = chapter.match(/Chapter\s+(\d+)/);
  if (m) return parseInt(m[1], 10);
  if (/epilogue/i.test(chapter)) return 99999;
  return 0;
}

export interface OrderableExercise {
  id: string;
  sourceName: string;
  chapter: string | null;
  exerciseNumber: number | null;
}

/**
 * Sort exercises following the Woodpecker book order:
 * 1. WM1 chapters in the book's logical order
 * 2. WM2 chapters by numeric range start
 * 3. Within each chapter, by exerciseNumber ascending (nulls last)
 */
export function sortExercises<T extends OrderableExercise>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const isWm1A = a.sourceName === "The Woodpecker Method";
    const isWm1B = b.sourceName === "The Woodpecker Method";

    // WM1 before WM2
    if (isWm1A !== isWm1B) return isWm1A ? -1 : 1;

    const chapterA = a.chapter ?? "";
    const chapterB = b.chapter ?? "";

    // Chapter sort
    let chapterDiff: number;
    if (isWm1A) {
      const orderA = WM1_CHAPTER_ORDER[chapterA] ?? 99;
      const orderB = WM1_CHAPTER_ORDER[chapterB] ?? 99;
      chapterDiff = orderA - orderB;
    } else {
      chapterDiff = wm2ChapterSortKey(chapterA) - wm2ChapterSortKey(chapterB);
    }

    if (chapterDiff !== 0) return chapterDiff;

    // Within chapter: by exerciseNumber
    const numA = a.exerciseNumber ?? 99999;
    const numB = b.exerciseNumber ?? 99999;
    return numA - numB;
  });
}

/**
 * Filter out illustrative/non-playable chapters from WM1.
 * Introduction and Summary are position-only and have no solution_moves.
 */
export function excludeIllustrative<T extends OrderableExercise>(
  items: T[],
  includeIntroduction = false
): T[] {
  return items.filter((item) => {
    const ch = item.chapter ?? "";
    if (!includeIntroduction && ch === "Introduction") return false;
    if (ch === "Summary Of Tactical Motifs") return false;
    return true;
  });
}

/** Return the canonical display title for a series */
export function seriesTitle(sourceName: string, chapter: string | null): string {
  const book =
    sourceName === "The Woodpecker Method"
      ? "WM1"
      : sourceName === "The Woodpecker Method 2"
      ? "WM2"
      : sourceName;
  return chapter ? `${book} — ${chapter}` : book;
}
