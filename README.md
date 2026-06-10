# Tazul Chess Pecker — Pecker Chess Platform

A chess training web application built around the **Woodpecker Method**: solve the same set of tactical exercises in repeated cycles, getting faster and more accurate each time.

**Status:** MVP local — in active development.

---

## What it does

- **Training series** — create a series from any subset of exercises (full book, by chapter, by difficulty)
- **Woodpecker cycles** — each series runs in cycles; completing a cycle creates the next one automatically
- **Real metrics** — accuracy, solve time, best streak, solved/correct counts per cycle
- **Show solution** — animates the solution on the board, records the attempt as incorrect, advances to next puzzle
- **Profile** — cycle history, accuracy chart, per-series stats

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 App Router (TypeScript strict) |
| Styling | Tailwind CSS 3 + custom design tokens |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 (Docker Compose) |
| Chess board | chessground 9.2.1 (Lichess, GPL-3.0-or-later) |
| PGN viewer | @lichess-org/pgn-viewer (GPL-3.0-or-later) |
| Move validation | chess.js 1.3 |
| Validation | Zod |
| State | Zustand |
| Tests | Vitest |

---

## Local setup

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm

### Install

```bash
npm install
```

### Environment variables

```bash
cp .env.example .env
```

Edit `.env` if needed (default values match `docker-compose.yml` out of the box).

### Start the database

```bash
docker compose up -d
```

### Run migrations

```bash
npx prisma migrate dev
```

### Seed the database

The real dataset (Woodpecker Method exercises) is **not included** in this repo.  
You must provide your own PGN exports or JSON file following the contract in [docs/training-items-contract.md](docs/training-items-contract.md).

A small sample dataset is provided for local testing:

```bash
# Edit scripts/seed-training-items.ts to point to the sample file, then:
npm run db:seed
```

### Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build (also runs type check) |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed training items from JSON |
| `npm run db:studio` | Open Prisma Studio |
| `npx prisma validate` | Validate Prisma schema |

---

## Dataset

The Woodpecker Method exercise data is **proprietary** and is **not included** in this repository.

To use the app with your own data:

1. Export your PGN or create a JSON file following the schema in [docs/training-items-contract.md](docs/training-items-contract.md).
2. Place the file at `data/seeds/training_items_playable.json` (gitignored).
3. Run `npm run db:seed`.

A sample file with 8 non-proprietary exercises is available at `data/seeds/sample_training_items.json`.

---

## Project structure

```
app/                  Next.js App Router pages and API routes
components/           React components (board, practice, UI)
lib/                  Chess logic, DB utilities, training helpers
prisma/               Prisma schema and migrations
scripts/              Seed scripts
data/seeds/           Dataset files (real data gitignored)
docs/                 Architecture and contract documentation
design-reference/     UI design reference (tokens, audit, source)
types/                Shared TypeScript types
```

---

## Documentation

- [docs/woodpecker-training-flow.md](docs/woodpecker-training-flow.md) — series/cycle/attempt system
- [docs/chess-boards-and-pgn-viewers.md](docs/chess-boards-and-pgn-viewers.md) — board architecture
- [docs/training-items-contract.md](docs/training-items-contract.md) — dataset schema
- [docs/chessboard-standard.md](docs/chessboard-standard.md) — chessground usage standard
- [docs/license-notes.md](docs/license-notes.md) — license audit and rationale

---

## License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)** — see [LICENSE](LICENSE) for the full text.

It uses [chessground](https://github.com/lichess-org/chessground) and [@lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer), open-source chess UI libraries developed by [Lichess](https://lichess.org), both licensed under GPL-3.0-or-later.

The Woodpecker Method PGN/book data is **not included** in this repository. Users must provide their own legally obtained training data.
