# Development Setup

## Requirements

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Docker Desktop | latest |
| Git | 2.40+ |

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env if needed — defaults match docker-compose.yml

# 3. Start PostgreSQL via Docker
docker compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Seed with sample data
#    (real dataset not included — see docs/training-items-contract.md)
npm run db:seed

# 6. Start dev server
npm run dev
```

Open http://localhost:3000.

## Dev user

MVP uses a hardcoded `devUserId = "dev-user-001"` in all training API routes.  
No authentication is required to use the app locally.

## Database

PostgreSQL 16 runs in Docker on port **5433** (not 5432) to avoid conflicts with any existing local PostgreSQL installation.

```bash
# Check DB is running
docker compose ps

# Open Prisma Studio (GUI)
npm run db:studio

# Re-run migrations after schema changes
npx prisma migrate dev --name describe_your_change

# Validate schema
npx prisma validate
```

## Testing

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch
```

Tests use Vitest. No database connection required — unit tests mock DB interactions.

## Type checking

```bash
# Full type check (same as CI)
npx tsc --noEmit

# Or via build (also runs type check)
npm run build
```

## Linting

```bash
npm run lint
```

## Resetting the database

```bash
# Drop and recreate (destroys all data)
docker compose down -v
docker compose up -d
npx prisma migrate dev
npm run db:seed
```

## Known dev-only quirks

- **ChunkLoadError on `/profile`** when navigating via client-side link from `/practice`:  
  Navigate directly to `http://localhost:3000/profile` instead. This is a Next.js dev-mode lazy compilation issue, not a code bug.
