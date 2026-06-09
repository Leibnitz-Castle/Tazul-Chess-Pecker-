# Implementation Map — Tazul Chess Platform → Next.js

**Version:** v1.0  
**Date:** 2026-06-08

---

## Route Mapping

| Claude Design Screen | Next.js Route | Components |
|---------------------|--------------|------------|
| Landing | `/` | `LandingPage`, `HeroBoard`, `FeatureCards`, `StatsBar` |
| Dashboard | `/dashboard` | `DashboardPage`, `StatsCard`, `ActivityHeatmap`, `RecentSessions`, `ActiveSets`, `WeakAreas` |
| Practice Hub | `/practice` | `PracticeHub`, `WoodpeckerSetsGrid`, `PracticeFilters` |
| Woodpecker List | `/practice/woodpecker` | `WoodpeckerList`, `TrainingItemCard`, `ItemFilters` |
| Puzzle Player | `/practice/woodpecker/[id]` | `ChessgroundBoard`, `PuzzlePlayer`, `MoveFeedbackPanel`, `MasteryDots`, `PuzzleInfo` |
| Set Complete | `/practice/woodpecker/complete` | `SessionSummary` |
| Openings | `/openings` | `ComingSoonPage` (placeholder) |
| Elite Warehouse | `/elite-warehouse` | `ComingSoonPage` (placeholder) |
| Profile | `/profile` | `ProfileHeader`, `StatsGrid`, `RecentSessions`, `RadarChart` |
| Design System | `/design-system` | `DesignSystemPage` |

---

## Component Mapping

### `design-reference/source/js/app.jsx` → Components

| Design Component | Next.js Component | Notes |
|----------------|-----------------|-------|
| `Sidebar` | `src/components/layout/AppSidebar.tsx` | Uses Next.js Link instead of go() |
| `Topbar` | `src/components/layout/TopBar.tsx` | Real user data from context |
| `MobileNav` | `src/components/layout/MobileNav.tsx` | |
| `App` (shell) | `src/components/layout/AppShell.tsx` | Wraps all inner pages |

### `design-reference/source/js/ui.jsx` → Components

| Design Component | Next.js Component | Notes |
|----------------|-----------------|-------|
| `Icon` | `src/components/ui/Icon.tsx` | Same SVG paths |
| `Button` | `src/components/ui/Button.tsx` | |
| `Card` + `CardHead` | `src/components/ui/Card.tsx` | |
| `Badge` | `src/components/ui/Badge.tsx` | |
| `Chip` | `src/components/ui/Chip.tsx` | |
| `Progress` | `src/components/ui/Progress.tsx` | |
| `Ring` | `src/components/ui/Ring.tsx` | |
| `Avatar` | `src/components/ui/Avatar.tsx` | |
| `LineChart` | `src/components/ui/LineChart.tsx` | Client component |
| `Sparkline` | `src/components/ui/Sparkline.tsx` | |
| `RadarChart` | `src/components/ui/RadarChart.tsx` | Client component |
| `Heatmap` + `MiniHeat` | `src/components/ui/Heatmap.tsx` | Client component |
| `BarRow` | `src/components/ui/BarRow.tsx` | |
| `CountUp` | `src/components/ui/CountUp.tsx` | Client component |
| `Stat` | `src/components/ui/Stat.tsx` | |

### `design-reference/source/js/chess-board.jsx` → Replaced

| Design Component | Next.js Component | Notes |
|----------------|-----------------|-------|
| `ChessBoard` (custom) | `src/components/chess/ChessgroundBoard.tsx` | Uses chessground npm package, NOT the custom board |
| `newGame` | `src/lib/chess/fen.ts` | chess.js based utilities |
| `piecesFromFen` | internal | Used by chessground |

### `design-reference/source/js/pages-landing-dash.jsx` → Pages

| Design Component | Next.js File | Notes |
|----------------|------------|-------|
| `Landing` | `src/app/page.tsx` | |
| `Dashboard` | `src/app/dashboard/page.tsx` | |
| `Logo` | `src/components/ui/Logo.tsx` | |

### `design-reference/source/js/pages-practice-create.jsx` → Pages

| Design Component | Next.js File | Notes |
|----------------|------------|-------|
| `PracticeHub` | `src/app/practice/page.tsx` | Uses real data from API |
| `SetCard` | `src/components/practice/PracticeCard.tsx` | |
| `CreateSet` | Deferred | V2 feature |

### `design-reference/source/js/pages-play.jsx` → Pages

| Design Component | Next.js File | Notes |
|----------------|------------|-------|
| `PlayPage` | `src/app/practice/woodpecker/[id]/page.tsx` | Uses TrainingItem from DB |
| `MasteryDots` | `src/components/practice/MasteryDots.tsx` | |
| `MoveFeedbackPanel` | `src/components/practice/MoveFeedbackPanel.tsx` | |

---

## CSS → Tailwind Mapping

### Token to Tailwind custom class

| CSS Token | Tailwind Class |
|-----------|---------------|
| `--bg` #161311 | `bg-bg-main` |
| `--bg-2` #14110F | `bg-bg-sidebar` |
| `--surface` #26211D | `bg-bg-card` |
| `--surface-2` #211C18 | `bg-bg-panel` |
| `--surface-3` #2F2924 | `bg-bg-elevated` |
| `--line` #3B342D | `border-border-subtle` |
| `--amber` #C8A96B | `text-amber` / `bg-amber` |
| `--text` #F2ECE3 | `text-text-main` |
| `--text-2` #C1B29F | `text-text-secondary` |
| `--text-3` #8B7E72 | `text-text-muted` |

### Key CSS patterns → Tailwind

```
.card        → bg-bg-card border border-border-subtle rounded-[14px] relative
.card-hover  → hover:border-amber/40 hover:-translate-y-0.5 transition-all
.btn-amber   → bg-amber text-[#1E1812] font-semibold hover:bg-amber-bright
.nav-item    → flex items-center gap-3 h-[42px] px-3 rounded-[10px] ...
.badge       → inline-flex items-center h-[22px] px-[9px] rounded-full text-[11.5px]
```

---

## Priority Order for MVP

### Phase 1 — Visual shell (no interactivity)
1. `AppShell` + `AppSidebar` + `TopBar`
2. `Landing` page
3. `Dashboard` (static data)
4. `Design System` page

### Phase 2 — Practice with real data
5. `Practice` hub page (real API data)
6. `ChessgroundBoard` component
7. `PuzzlePlayer` with real TrainingItem
8. `MoveFeedbackPanel`

### Phase 3 — DB + attempts
9. Prisma schema
10. Seed script
11. API routes

### Phase 4 — Placeholders
12. `/openings` placeholder
13. `/elite-warehouse` placeholder
14. `/profile` page

---

## Data Flow

```
training_items_playable.json
    → prisma seed (upsert)
    → PostgreSQL training_items table
    → GET /api/training-items (filtered list)
    → /practice page (server component)
    → TrainingItemCard list

GET /api/training-items/[id]
    → /practice/woodpecker/[id] (server component)
    → PuzzlePlayer (client component)
    → ChessgroundBoard (client component)
    → user makes move
    → compare vs solution_moves[0]
    → MoveFeedbackPanel
    → POST /api/attempts
```
