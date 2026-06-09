# Design Audit — Tazul Chess Platform

**Source:** `C:\Users\Andres\Desktop\woodpecker plantilla ui`  
**Audited:** 2026-06-08  
**Status:** Complete — all files copied to `design-reference/source/`

---

## Files Found

| File | Type | Description |
|------|------|-------------|
| `Tazul Chess Platform.html` | HTML | Entry point — loads all JSX via Babel in-browser |
| `styles.css` | CSS | Design tokens + global styles (19.7 KB) |
| `layout.css` | CSS | Responsive grid layouts + sliders (4.1 KB) |
| `openings.css` | CSS | Openings module styles (7.3 KB) |
| `warehouse.css` | CSS | Elite Warehouse module styles (6.8 KB) |
| `js/app.jsx` | React JSX | Router, Sidebar, Topbar, MobileNav, App shell |
| `js/ui.jsx` | React JSX | All UI primitives: Icon, Button, Card, Badge, Chip, Progress, Ring, Avatar, Charts, Heatmap, Stat, CountUp |
| `js/chess-board.jsx` | React JSX | Custom chess board using window.Chess (chess.js UMD) |
| `js/data.jsx` | React JSX | Static mock data: SETS, PUZZLES, USER, PERF_SERIES, etc. |
| `js/pages-landing-dash.jsx` | React JSX | Landing + Dashboard pages, Logo component |
| `js/pages-practice-create.jsx` | React JSX | PracticeHub, SetCard, CreateSet wizard, DualSlider |
| `js/pages-play.jsx` | React JSX | PlayPage (puzzle player), MasteryDots, fmtTime |
| `js/pages-misc.jsx` | React JSX | Profile, SetComplete, ComponentLibrary (design system page) |
| `js/data-openings.jsx` | React JSX | Openings module data |
| `js/openings-*.jsx` | React JSX | 5 files: Openings module pages (4 page files + shared) |
| `js/data-warehouse.jsx` | React JSX | Elite Warehouse module data |
| `js/warehouse-*.jsx` | React JSX | 5 files: Warehouse module pages + shared |

---

## Screens Detected

| Screen | Route Mapped | Description |
|--------|-------------|-------------|
| Landing | `/` | Hero with board, feature cards, stats bar |
| Dashboard | `/dashboard` | Stats grid, performance chart, active sets, streak heatmap, weak areas |
| Practice Hub | `/practice` | Set list with filters, FAB to create set |
| Play / Puzzle Player | `/practice/woodpecker/[id]` | Board + feedback panel, mastery dots, timer, puzzle info |
| Set Complete | `/practice/woodpecker/complete` | Session summary after completing a set |
| Profile | `/profile` | Stats, performance radar, recent sessions |
| Openings Module | `/openings` | Full opening tree drill interface |
| Elite Warehouse | `/elite-warehouse` | GM game database browser |
| Component Library | `/design-system` | All tokens, components, states |

---

## Components Detected

### Layout
- `AppShell` — sidebar + main + topbar + mobile nav
- `Sidebar` — 232px, sticky, nav items with active indicator
- `Topbar` — 64px, blur backdrop, streak badge, avatar
- `MobileNav` — fixed bottom bar on mobile

### Primitives
- `Button` — variants: amber, outline, ghost, danger, green; sizes: lg, sm, icon; loading state
- `Card` + `CardHead` — surface + hover lift
- `Badge` — variants: amber, green, red; dot variant
- `Chip` — filter chip, active state
- `Progress` — linear bar with animation
- `Ring` — SVG progress ring for circular stats
- `Avatar` — initials circle
- `Stat` — label + large number + optional sub

### Data Visualization
- `LineChart` — SVG area+line chart
- `Sparkline` — inline mini chart
- `RadarChart` — tactical skills radar
- `Heatmap` + `MiniHeat` — GitHub-style activity heatmap
- `BarRow` — horizontal bar with semantic color (green/warning/red)
- `CountUp` — animated number counter

### Chess
- `ChessBoard` — custom board using chess.js UMD (to be replaced with chessground)
- `MasteryDots` — 3-dot mastery indicator

### Feature
- `PracticeHub` — set list + filters
- `SetCard` — single training set card
- `CreateSet` — 5-step wizard modal
- `PlayPage` — full puzzle player
- `Landing` + `Dashboard` — main pages
- `Profile` — player profile page
- `Logo` — brand mark

---

## Color Palette Detected

All tokens confirmed in `styles.css` `:root`:

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#161311` | App background |
| `--bg-2` | `#14110F` | Sidebar / rails |
| `--surface` | `#26211D` | Card background |
| `--surface-2` | `#211C18` | Panels / inputs |
| `--surface-3` | `#2F2924` | Elevated / hover |
| `--line` | `#3B342D` | Hairline border |
| `--amber` | `#C8A96B` | Accent primary |
| `--amber-bright` | `#D6B77A` | Accent hover |
| `--amber-dim` | `#8D6E3E` | Accent deep |
| `--green` | `#4E8A62` | Success |
| `--red` | `#A44D45` | Error |
| `--warning` | `#C48A41` | Warning |
| `--blue` | `#6E8BAB` | Info |
| `--text` | `#F2ECE3` | Primary text |
| `--text-2` | `#C1B29F` | Secondary text |
| `--text-3` | `#8B7E72` | Muted text |
| `--sq-light` | `#D7C1A0` | Board light squares |
| `--sq-dark` | `#8A6A45` | Board dark squares |

---

## Typography

| Token | Value |
|-------|-------|
| `--font` | Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |
| `--mono` | JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace |
| Display | 56px / 1.02 / weight 800 |
| h1 | 30px / 1.1 / weight 700 |
| h2 | 22px / 1.15 / weight 700 |
| h3 | 17px / 1.2 / weight 700 |
| Eyebrow | 11px / weight 600 / uppercase / 0.14em spacing |
| Stat | tabular-nums / weight 750 |

---

## Layout Patterns

- Sidebar: `232px` sticky, hidden on mobile
- Topbar: `64px`, `backdrop-filter: blur(12px)`, bg `rgba(22,19,17,.82)`, `z-index: 30`
- Page max-width: `1280px` (wide: `1480px`), centered with `padding: 28px`
- Grid layouts:
  - Dashboard: `3-column`, `2-column` at 1100px, `1-column` at 640px
  - Practice: `auto-fill minmax(304px, 1fr)`
  - Play: `1.3fr 1fr` board + panel

---

## Animation Patterns

| Animation | Duration | Description |
|-----------|---------|-------------|
| `cardIn` | 500ms cubic | translateY(12px) scale(0.985) → normal — card entrance |
| `fadeIn` | 220ms ease | translateY(5px) → normal |
| `fadeUp` | 380ms cubic | translateY(12px) → normal |
| `barFill` | 700ms cubic | scaleX(0) → scaleX(1) — bar entrance |
| `heatIn` | 400ms cubic stagger | scale(0.35) → 1 — heatmap cells |
| `pulse-correct` | 550ms | scale(1.012) + green glow |
| `glow-wrong` | 500ms | red border glow |
| `board-shake` | 400ms | translateX shake |
| `shimmer` | 1.4s infinite | skeleton loading gradient |
| Sidebar nav hover | 140ms | color + background |
| Card hover | 160ms | translateY(-3px) + amber border |
| Confetti | 0.9-1.6s | falling pieces on correct |

---

## Observations

1. **Chess board**: The design uses a **custom React board** built on chess.js UMD. We will replace this with `chessground` (Lichess library) while preserving the color scheme.
2. **Fonts**: Uses Google Fonts (Inter + JetBrains Mono + Lora). Must be loaded in Next.js `layout.tsx`.
3. **Mock data**: All data in `js/data.jsx` is static/demo. Our implementation will use the real Woodpecker dataset.
4. **Openings module**: Has extensive UI (4 page files). MVP will show a placeholder.
5. **Elite Warehouse**: Has extensive UI (4 page files). MVP will show a placeholder.
6. **Design System page**: `/design-system` — valuable as a development reference, implement as a visual catalog.
7. **Confetti**: Used in the design on correct puzzles. We will use a subtle version consistent with the motion guidelines.
8. **No auth UI**: The design shows "Login with Lichess" on landing but the inner app doesn't implement real auth. We defer auth to a later phase.

---

## What can be implemented directly

- All CSS tokens → Tailwind config + CSS variables in globals.css
- App shell layout (sidebar + topbar) → AppShell.tsx
- All UI primitives → `/components/ui/`
- Landing page → `/` 
- Dashboard → `/dashboard`
- Practice Hub → `/practice`
- Puzzle Player → `/practice/woodpecker/[id]`
- Profile → `/profile`
- Design System page → `/design-system`

## What needs translation to React components

- The chess board (custom JSX) → `ChessgroundBoard.tsx` using chessground npm package
- Static data → real API calls to PostgreSQL via Prisma
- Hash-based routing → Next.js App Router pages
- window globals (USER, SETS, PUZZLES) → API calls + React state/Zustand
- CSS classes → Tailwind classes + cn() utility
