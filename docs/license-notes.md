# License Notes — Tazul Chess Pecker

## Summary

This project is licensed under **GPL-3.0-or-later**.

It is **not MIT** because it depends directly on chessground and
@lichess-org/pgn-viewer, both GPL-3.0-or-later. Since those packages
are imported directly in source code that is publicly distributed on
GitHub, the GPL copyleft obligation applies to the whole project.

---

## Dependency audit (2026-06-09)

| Dependency | Version | License | Type | Notes |
|---|---|---|---|---|
| chessground | 9.2.1 | **GPL-3.0-or-later** | Direct | Board UI for puzzles (`ChessgroundBoard.tsx`) |
| @lichess-org/pgn-viewer | 2.6.0 | **GPL-3.0-or-later** | Direct | PGN viewer (`LichessPgnViewer.tsx`) |
| @lichess-org/chessground | 10.1.1 | **GPL-3.0-or-later** | Transitive | Internal dep of pgn-viewer |
| chess.js | 1.4.0 | BSD-2-Clause | Direct | Move validation — compatible with GPL |
| next | 14.2.35 | MIT | Direct | Framework — compatible with GPL |
| react / react-dom | 18.3.1 | MIT | Direct | Compatible with GPL |
| prisma / @prisma/client | 5.22.0 | Apache-2.0 | Direct | Compatible with GPL |
| tailwindcss | 3.4.19 | MIT | Direct | Compatible with GPL |
| zod | 3.25.76 | MIT | Direct | Compatible with GPL |
| zustand | 5.0.14 | MIT | Direct | Compatible with GPL |
| typescript | 5.9.3 | Apache-2.0 | Dev only | Not distributed |
| vitest | 4.1.8 | MIT | Dev only | Not distributed |

**GPL-triggering dependencies: chessground and @lichess-org/pgn-viewer.**

---

## Why not MIT?

MIT is a permissive license. GPL-3.0-or-later is a copyleft license.

When a project **directly links** (imports) a GPL-licensed library, the
GPL requires the combined work to also be distributed under a GPL-compatible
license. Since we `import { Chessground } from 'chessground'` and
`import('@lichess-org/pgn-viewer')` in our source code, those are direct
links. Publishing that source on GitHub is distribution. Therefore the
GPL copyleft applies to this repo.

Applying MIT while importing GPL dependencies would be a license
violation, even if unintentional.

---

## Implication of GPL for this project

- The source code must remain publicly available (which it is — GitHub).
- Anyone who distributes a modified version must also distribute their
  source under GPL-3.0-or-later.
- **The SaaS / network use loophole:** running this software as a private
  web service (serving users over HTTP without distributing binaries or
  source) does NOT trigger GPL distribution requirements under standard
  GPL-3. However, since this project explicitly publishes its source on
  GitHub, that loophole is moot here.
- The Woodpecker Method book data is NOT part of the software and is
  NOT covered by GPL. It must not be distributed regardless of license.

---

## What about the copied CSS?

`app/lichess-pgn-viewer.css` is a copy of the compiled CSS from
`@lichess-org/pgn-viewer`. It already carries the GPL header:

```
/* @lichess-org/pgn-viewer v2.6.0 — GPL-3.0-or-later — ... */
```

This is consistent with the project license. When upgrading the package,
re-copy the CSS from `node_modules/@lichess-org/pgn-viewer/dist/`.

---

## Correction to earlier memory

An earlier project memory file (`04-chess-board-and-pgn-viewer-decision.md`)
incorrectly labeled `chessground 9.2.1` as MIT. The actual `package.json`
in `node_modules/chessground` declares `"license": "GPL-3.0-or-later"`.
This was verified on 2026-06-09. The memory file was corrected.

---

## How to switch to MIT in the future (if desired)

To license this project under MIT, all GPL-licensed direct dependencies
must be replaced. Currently that means:

1. **Replace `chessground`** with a MIT-licensed chess board. Options:
   - [react-chessboard](https://github.com/Clariity/react-chessboard) (MIT)
   - [cm-chessboard](https://github.com/shaack/cm-chessboard) (MIT)
   - Custom SVG board built from scratch

2. **Replace `@lichess-org/pgn-viewer`** with a MIT-licensed PGN viewer or
   write a custom one. This is lower priority since the PGN viewer is only
   used in placeholder pages (Elite Warehouse, Openings) not yet in V1.

3. **Verify `@lichess-org/chessground`** (transitive) is no longer pulled in.

4. **Re-audit `node_modules`** for any remaining GPL deps before switching.

Note: replacing chessground would also require rewriting `ChessgroundBoard.tsx`,
`chessground-theme.css`, and `app/lichess-pgn-viewer.css`. It is significant
work and not recommended until V2 is stable.

---

## Dataset copyright (separate from software license)

The Woodpecker Method 1 and 2 exercise data belongs to its authors and
publisher. It is **not covered by this GPL license** and is **not included**
in this repository. The `.gitignore` excludes `data/seeds/training_items_playable.json`.

Users who want to use this app with real exercises must obtain that data
from a legally licensed source and seed it themselves following the schema
in `docs/training-items-contract.md`.
