import { describe, it, expect } from "vitest";
import { sortExercises, excludeIllustrative, seriesTitle } from "../series-order";

const makeItem = (
  id: string,
  sourceName: string,
  chapter: string | null,
  exerciseNumber: number | null
) => ({ id, sourceName, chapter, exerciseNumber });

describe("sortExercises — WM1", () => {
  it("sorts WM1 chapters in book order, not alphabetical", () => {
    const items = [
      makeItem("d", "The Woodpecker Method", "Advanced Exercises", 1),
      makeItem("c", "The Woodpecker Method", "Intermediate Exercises III", 1),
      makeItem("b", "The Woodpecker Method", "Intermediate Exercises I", 1),
      makeItem("a", "The Woodpecker Method", "Easy Exercises", 1),
    ];
    const sorted = sortExercises(items);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("sorts by exerciseNumber within a chapter", () => {
    const items = [
      makeItem("c", "The Woodpecker Method", "Easy Exercises", 30),
      makeItem("a", "The Woodpecker Method", "Easy Exercises", 1),
      makeItem("b", "The Woodpecker Method", "Easy Exercises", 15),
    ];
    const sorted = sortExercises(items);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("puts null exerciseNumber at the end within a chapter", () => {
    const items = [
      makeItem("null", "The Woodpecker Method", "Easy Exercises", null),
      makeItem("first", "The Woodpecker Method", "Easy Exercises", 1),
    ];
    const sorted = sortExercises(items);
    expect(sorted[0].id).toBe("first");
    expect(sorted[1].id).toBe("null");
  });

  it("Introduction comes before Easy Exercises", () => {
    const items = [
      makeItem("easy", "The Woodpecker Method", "Easy Exercises", 1),
      makeItem("intro", "The Woodpecker Method", "Introduction", 1),
    ];
    const sorted = sortExercises(items);
    expect(sorted[0].id).toBe("intro");
  });
});

describe("sortExercises — WM2", () => {
  it("sorts WM2 chapters by numeric range start", () => {
    const items = [
      makeItem("c", "The Woodpecker Method 2", "Chapter 101-150", 101),
      makeItem("a", "The Woodpecker Method 2", "Chapter 1-50", 1),
      makeItem("b", "The Woodpecker Method 2", "Chapter 51-100", 51),
    ];
    const sorted = sortExercises(items);
    expect(sorted.map((x) => x.id)).toEqual(["a", "b", "c"]);
  });

  it("puts Epilogue last", () => {
    const items = [
      makeItem("ep", "The Woodpecker Method 2", "Chapter Epilogue", null),
      makeItem("first", "The Woodpecker Method 2", "Chapter 1-50", 1),
    ];
    const sorted = sortExercises(items);
    expect(sorted[0].id).toBe("first");
    expect(sorted[1].id).toBe("ep");
  });
});

describe("sortExercises — WM1 before WM2", () => {
  it("places WM1 items before WM2 items", () => {
    const items = [
      makeItem("wm2", "The Woodpecker Method 2", "Chapter 1-50", 1),
      makeItem("wm1", "The Woodpecker Method", "Easy Exercises", 1),
    ];
    const sorted = sortExercises(items);
    expect(sorted[0].id).toBe("wm1");
  });
});

describe("excludeIllustrative", () => {
  const items = [
    makeItem("intro", "The Woodpecker Method", "Introduction", 1),
    makeItem("easy", "The Woodpecker Method", "Easy Exercises", 1),
    makeItem("summary", "The Woodpecker Method", "Summary Of Tactical Motifs", 1),
  ];

  it("excludes Introduction and Summary by default", () => {
    const filtered = excludeIllustrative(items);
    expect(filtered.map((x) => x.id)).toEqual(["easy"]);
  });

  it("includes Introduction when flag is set", () => {
    const filtered = excludeIllustrative(items, true);
    expect(filtered.map((x) => x.id)).toEqual(["intro", "easy"]);
  });
});

describe("seriesTitle", () => {
  it("formats WM1 chapter title", () => {
    expect(seriesTitle("The Woodpecker Method", "Easy Exercises")).toBe(
      "WM1 — Easy Exercises"
    );
  });

  it("formats WM2 without chapter", () => {
    expect(seriesTitle("The Woodpecker Method 2", null)).toBe("WM2");
  });
});
