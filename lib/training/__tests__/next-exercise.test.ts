import { describe, it, expect } from "vitest";
import { findNextExercise, findNextByIndex, remainingCount } from "../next-exercise";

const makeItem = (id: string, orderIndex: number) => ({
  id,
  trainingItemId: `item-${id}`,
  orderIndex,
});

describe("findNextExercise", () => {
  const items = [
    makeItem("a", 0),
    makeItem("b", 1),
    makeItem("c", 2),
  ];

  it("returns first item when nothing is solved", () => {
    const result = findNextExercise(items, new Set());
    expect(result.trainingItemId).toBe("item-a");
    expect(result.isComplete).toBe(false);
    expect(result.remaining).toBe(3);
  });

  it("skips solved items", () => {
    const result = findNextExercise(items, new Set(["item-a"]));
    expect(result.trainingItemId).toBe("item-b");
    expect(result.remaining).toBe(2);
  });

  it("returns complete when all solved", () => {
    const result = findNextExercise(items, new Set(["item-a", "item-b", "item-c"]));
    expect(result.isComplete).toBe(true);
    expect(result.trainingItemId).toBeNull();
    expect(result.remaining).toBe(0);
  });

  it("respects orderIndex regardless of input order", () => {
    const shuffled = [makeItem("c", 2), makeItem("a", 0), makeItem("b", 1)];
    const result = findNextExercise(shuffled, new Set());
    expect(result.trainingItemId).toBe("item-a");
  });
});

describe("findNextByIndex", () => {
  const items = [
    makeItem("x", 0),
    makeItem("y", 1),
    makeItem("z", 2),
  ];

  it("returns item at index 0", () => {
    const result = findNextByIndex(items, 0);
    expect(result?.trainingItemId).toBe("item-x");
  });

  it("returns item at index 2", () => {
    const result = findNextByIndex(items, 2);
    expect(result?.trainingItemId).toBe("item-z");
  });

  it("returns null when index >= length (cycle complete)", () => {
    const result = findNextByIndex(items, 3);
    expect(result).toBeNull();
  });
});

describe("remainingCount", () => {
  it("returns 0 when currentIndex equals total", () => {
    expect(remainingCount(5, 5)).toBe(0);
  });

  it("returns correct count mid-series", () => {
    expect(remainingCount(10, 3)).toBe(7);
  });

  it("clamps to 0, never negative", () => {
    expect(remainingCount(5, 10)).toBe(0);
  });
});
