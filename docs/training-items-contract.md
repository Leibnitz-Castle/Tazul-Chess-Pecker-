# Training Items — Data Contract v0.1

**Dataset:** Woodpecker Method 1 + 2  
**Version:** v0.1 (2026-06-08)  
**Status:** Production-ready for web seed

---

## What is a `training_item`?

A `training_item` is one chess exercise extracted from a Woodpecker Method PGN file.  
Each item contains:
- The starting position (FEN)
- Who is to move
- The complete solution line (UCI moves and SAN notation)
- Metadata: source book, chapter, difficulty, exercise number, tags

---

## Fields

### Required (always present)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier |
| `fen` | string | Starting position in FEN notation. Always valid (verified by python-chess). |
| `side_to_move` | `"w"` or `"b"` | Derived from FEN. `"w"` = White to move, `"b"` = Black to move. |
| `item_type` | string | Always `"calculation"` in V1. |
| `tags` | array of strings | Always `["woodpecker", "book"]` in V1. |
| `source_name` | string | `"The Woodpecker Method"` or `"The Woodpecker Method 2"` |
| `source_author` | string | `"Axel Smith & Hans Tikkanen"` or `"Axel Smith"` |
| `source_year` | integer | `2018` (WM1) or `2022` (WM2) |

### Optional — present for playable items

| Field | Type | Description |
|-------|------|-------------|
| `solution_moves` | array of strings | UCI moves: `["e2e4", "d7d5", ...]`. Empty array `[]` for position-only items. |
| `solution_san` | string | Space-separated SAN: `"e4 d5 ..."`. `null` for position-only items. |
| `chapter` | string | Chapter name. See chapter list below. |
| `exercise_number` | integer | Sequential within chapter (WM1) or from `[Site "Game N"]` (WM2). |
| `difficulty` | string or null | `"easy"` / `"intermediate"` / `"advanced"`. `null` for WM2 and some WM1 chapters. |
| `theme` | string or null | Tactical motif. Always `null` in V1 — requires Stockfish analysis. |
| `source_page` | integer or null | Book page number. Always `null` — not available in PGN files. |

---

## Playable vs Position-Only

The dataset is split into two categories:

| Category | Count | Condition |
|----------|------:|-----------|
| **Playable** | 2 179 | `solution_moves` is a non-empty array |
| **Position-only** | 356 | `solution_moves` is `[]` or `null` |
| **Total** | 2 535 | — |

**The web app should use only playable items for training.**

SQL filter:
```sql
WHERE solution_moves IS NOT NULL AND solution_moves != '[]'
```

Position-only items come exclusively from WM2. The PGN does not encode the solution for those positions.

---

## solution_moves format

`solution_moves` is a JSON array of UCI strings representing the **complete mainline solution** from the starting position.

```json
["e2e4", "d7d5", "e4d5"]
```

- Each string is a 4 or 5 character UCI move: source square + target square + promotion piece (if any).
- Castling: `"e1g1"` = O-O (White kingside), `"e1c1"` = O-O-O, `"e8g8"` = O-O (Black kingside).
- Promotion example: `"e7e8q"` = promote to Queen.
- The array includes **both sides' moves** (not just the player's moves).
- Index 0 is always the player's first move.

**Replay a solution in Python:**
```python
import chess, json

board = chess.Board(item["fen"])
for uci in item["solution_moves"]:
    board.push(chess.Move.from_uci(uci))
```

---

## solution_san format

`solution_san` is a space-separated string of SAN notation moves, same order as `solution_moves`.

```
"e4 d5 exd5"
```

Useful for display purposes. Derived directly from the mainline PGN.

---

## Chapter list

### The Woodpecker Method (WM1)

| Chapter | Difficulty | Exercises |
|---------|:----------:|----------:|
| Easy Exercises | easy | 222 |
| Intermediate Exercises I | intermediate | 509 |
| Intermediate Exercises III | intermediate | 254 |
| Advanced Exercises | advanced | 144 |
| Introduction | — | 3 |
| Summary Of Tactical Motifs | — | 13 |

> **Recommendation:** Exclude `Introduction` and `Summary Of Tactical Motifs` for training mode — they are illustrative positions, not standard exercises.

### The Woodpecker Method 2 (WM2)

Chapters: `Chapter 1-50`, `Chapter 51-100`, `Chapter 101-150`, …, `Chapter Epilogue`.  
Exercise numbers come directly from `[Site "Game N"]` in the PGN.  
All WM2 items have `difficulty = null`.

---

## Filtering guide for the web app

```sql
-- All playable exercises (recommended starting point)
SELECT * FROM training_items_playable;

-- Only Easy exercises
SELECT * FROM training_items_playable WHERE difficulty = 'easy';

-- Intermediate + Advanced from WM1
SELECT * FROM training_items_playable
WHERE source_name = 'The Woodpecker Method'
  AND difficulty IN ('intermediate', 'advanced');

-- White to move only
SELECT * FROM training_items_playable WHERE side_to_move = 'w';

-- WM2 exercises with a solution
SELECT * FROM training_items_playable
WHERE source_name = 'The Woodpecker Method 2';

-- Exclude illustrative positions (recommended for training)
SELECT * FROM training_items_playable
WHERE chapter NOT IN ('Introduction', 'Summary Of Tactical Motifs');
```

---

## Example: playable exercise (JSON)

```json
{
  "id": "3a7f1c2d-...",
  "fen": "rnb3kr/ppp4p/3b3B/3Pp2n/2BP4/3K1Rp1/PPP3q1/RN1Q4 w - - 0 1",
  "side_to_move": "w",
  "solution_moves": ["f3f8", "d6f8", "d5d6", "c8e6", "c4e6"],
  "solution_san": "Rf8+ Bxf8 d6+ Be6 Bxe6#",
  "source_name": "The Woodpecker Method",
  "source_author": "Axel Smith & Hans Tikkanen",
  "source_year": 2018,
  "chapter": "Easy Exercises",
  "exercise_number": 2,
  "difficulty": "easy",
  "theme": null,
  "tags": ["woodpecker", "book"],
  "item_type": "calculation",
  "created_at": "2026-06-08 11:32:41.123456+00"
}
```

## Example: position-only exercise (JSON)

```json
{
  "id": "9b2e4f7a-...",
  "fen": "b3rbk1/3q1pp1/2np1n1p/1p2p3/4P3/1BP4P/1P3PPN/2BQRNK1 w - - 0 21",
  "side_to_move": "w",
  "solution_moves": [],
  "solution_san": null,
  "source_name": "The Woodpecker Method 2",
  "source_author": "Axel Smith",
  "source_year": 2022,
  "chapter": "Chapter 451-500",
  "exercise_number": 1,
  "difficulty": null,
  "theme": null,
  "tags": ["woodpecker", "book"],
  "item_type": "calculation",
  "created_at": "2026-06-08 11:32:41.123456+00"
}
```

---

## Stable export files

The web app can consume these files directly:

| File | Content | Size |
|------|---------|-----:|
| `data/exports/training_items_playable.json` | 2 179 playable exercises | ~1.5 MB |
| `data/exports/training_items_playable.csv` | same, CSV format | ~720 KB |
| `data/exports/training_items_position_only.json` | 356 position-only exercises | ~195 KB |

These are stable filenames (no timestamp). Regenerate with:
```bash
python scripts/export_playable_items.py
```

---

## Recommendations for web seed

1. **Import `training_items_playable.json`** as the initial exercise seed.
2. **Keep `source_name`, `chapter`, `exercise_number`** to preserve Woodpecker ordering.
3. **Implement Woodpecker repetition tracking** at the application layer — the dataset provides static exercises; repetition state is a user-side concern.
4. **Do not import position-only items** in the initial release. Keep them for a future "explore mode".
5. **`difficulty` is null for WM2** — do not rely on this field for WM2 filtering; use `chapter` instead.
6. **`exercise_number` in WM1** is sequential within each chapter (not the printed book number). It is consistent across runs.

---

## Validation status

| Check | Result |
|-------|--------|
| 0 import errors | PASS |
| All 2 179 FENs parseable by python-chess | PASS |
| 200 random solution replays on board | PASS |
| Overall | **PASS** |

Full report: [`data/processed/dataset_validation_report.md`](../data/processed/dataset_validation_report.md)
