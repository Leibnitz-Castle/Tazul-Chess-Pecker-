# Opening Repertoire Import Guide

## Overview

The Pecker Chess Platform supports importing chess opening repertoires from PGN files exported by ChessBase. This guide covers how to export from ChessBase and run the importer.

---

## Prerequisites

- Node.js 18+
- PostgreSQL running with a valid `.env` connection string
- PGN files placed in `data/private/openings/` (this directory is gitignored)

---

## Exporting from ChessBase

1. Open your database in ChessBase.
2. Select the games you want to export (e.g., all White repertoire games).
3. Go to **File → Export → Games as PGN**.
4. Under **Format**, choose **PGN (standard)**.
5. Enable **Annotations** (to include `[%cal]` and `[%csl]` arrow/square markings — these are automatically stripped by the importer).
6. Save to:
   - White repertoire: `data/private/openings/repertoire_white.pgn`
   - Black repertoire: `data/private/openings/repertoire_black.pgn`

> **Important**: ChessBase exports include extended headers (`[PlyCount ...]`, `[EventDate ...]`, `[SourceVersionDate ...]`) and embedded graphical annotations (`{[%cal Yd1f3]}`). The importer handles all of these automatically.

### ChessBase-specific PGN quirks handled

| Quirk | How the importer handles it |
|---|---|
| BOM (`﻿`) at file start | Stripped before parsing |
| `[%cal ...]` / `[%csl ...]` arrows spanning two lines | Not treated as game headers |
| Curly-brace comments `{...}` containing `[` or `]` | Stripped before chess.js validation |
| NAG symbols (`$1`, `$2`, etc.) | Stripped |
| Spanish piece names in line titles (`Ag5`, `Ac4`) | OK — only the *moves* matter, not the `[White "..."]` header label |

---

## Running the Import

### First-time import

```bash
npm run openings:import
```

This is idempotent: if a repertoire with the same name already exists, it is skipped.

### Force reimport (delete and recreate)

```bash
npm run openings:reimport
```

### Import only one side

```bash
npm run openings:import -- --white-only
npm run openings:import -- --black-only
```

---

## File Locations

| File | Purpose |
|---|---|
| `data/private/openings/repertoire_white.pgn` | White repertoire PGN — **not committed** |
| `data/private/openings/repertoire_black.pgn` | Black repertoire PGN — **not committed** |
| `data/private/openings/import-report.json` | Last import summary — **not committed** |
| `scripts/import-openings.ts` | Import script |
| `lib/openings/pgn-parser.ts` | PGN parsing logic |
| `lib/openings/tree-builder.ts` | Node deduplication and tree building |
| `lib/openings/repertoire-import.ts` | Prisma insertion logic |

---

## Import Report

After each run, a JSON report is saved to `data/private/openings/import-report.json`:

```json
{
  "white": {
    "repertoireId": "...",
    "totalGamesInPgn": 27,
    "linesCreated": 400,
    "linesSkipped": 0,
    "nodesCreated": 3162,
    "nodesReused": 6176,
    "ecoCodes": ["B95", "B76", ...],
    "errors": []
  },
  "black": { ... }
}
```

### Understanding the counters

- **linesCreated**: PGN lines (main lines + variations) successfully imported.
- **linesSkipped**: Lines that failed chess.js validation — check `errors` array.
- **nodesCreated**: Unique board positions (move nodes) inserted.
- **nodesReused**: Nodes shared across multiple lines (transpositions/common openings).

---

## Troubleshooting

### "No moves parsed"
The game has no move text. This can happen if ChessBase exports a game with only headers and no moves (e.g., a transposition marker game).

### "Failed to parse main line moves"
Chess.js could not play a move in the sequence. Likely causes:
- A move is truly illegal in context (rare in ChessBase exports)
- An annotation was not fully stripped (check for unclosed `{` braces)
- Ambiguous move notation without disambiguation (e.g., `Nb1d2` should be `Nbd2`)

### Games count is lower than expected
The importer uses ChessBase's `[White "..."]` header to identify games. Each PGN block with a `[White "..."]` header counts as one game. Variations within a game expand into multiple *lines*.

---

## Privacy Rules

**Never commit these to git:**
- `data/private/` (entire directory)
- `*.pgn` files
- `*.cbh`, `*.cbv`, `*.cba`, `*.cbb`, `*.cbc`, `*.cbe`, `*.cbg`, `*.cbj`, `*.cbl`, `*.cbm`, `*.cbp`, `*.cbs`, `*.cbt`, `*.cbtt` (ChessBase database files)
- `*.docx` private training documents
- `memory/` directory
- `.env`

These are covered by the project `.gitignore`.
