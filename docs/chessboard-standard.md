# Chessboard Standard — Pecker Chess Platform

## Regla del proyecto

La librería oficial para renderizar tableros de ajedrez es **chessground**.

- chessground es la librería open source usada por Lichess (lichess.org).
- No se permite `react-chessboard`.
- No se permiten tableros manuales (divs con grid, tablas HTML, SVG casero, imágenes estáticas).
- Toda pantalla que necesite mostrar o interactuar con un tablero debe usar:

```typescript
import { ChessgroundBoard } from '@/components/chess/ChessgroundBoard'
```

---

## Componente central

**Archivo:** `components/chess/ChessgroundBoard.tsx`

```typescript
import { ChessgroundBoard } from '@/components/chess/ChessgroundBoard'
```

### Props

```typescript
interface ChessgroundBoardProps {
  fen: string                              // posición en FEN
  orientation?: 'white' | 'black'         // perspectiva del tablero
  viewOnly?: boolean                       // sin interacción
  disabled?: boolean                       // alias de viewOnly
  check?: boolean                          // override check highlight (auto por defecto)
  lastMove?: string | null                 // UCI de la última jugada, e.g. "e2e4"
  className?: string
  feedback?: 'correct' | 'wrong' | null   // estado visual de feedback
  shake?: boolean                          // animación de error
  onMove?: (move: BoardMove) => void       // callback cuando el usuario mueve
}
```

### Tipo `BoardMove`

```typescript
type BoardMove = {
  from: string       // casilla origen, e.g. "e2"
  to: string         // casilla destino, e.g. "e4"
  uci: string        // move completo UCI, e.g. "e2e4" o "e7e8q"
  san?: string       // notación algebraica, e.g. "e4"
  fenBefore: string  // FEN antes de la jugada
  fenAfter: string   // FEN después de la jugada
  legal: boolean     // siempre true (chess.js valida antes de emitir)
  promotion?: string // pieza de promoción si aplica
}
```

---

## Ejemplos de uso

### Tablero solo lectura

```tsx
<ChessgroundBoard
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  viewOnly
/>
```

### Tablero interactivo

```tsx
function MyBoard() {
  const [fen, setFen] = useState(STARTING_FEN)
  const [lastMove, setLastMove] = useState<string | null>(null)

  function handleMove(move: BoardMove) {
    setFen(move.fenAfter)
    setLastMove(move.uci)
  }

  return (
    <ChessgroundBoard
      fen={fen}
      onMove={handleMove}
      lastMove={lastMove}
    />
  )
}
```

### Tablero con orientación negra

```tsx
<ChessgroundBoard
  fen={someFen}
  orientation="black"
  viewOnly
/>
```

### Tablero en PuzzlePlayer

```tsx
<ChessgroundBoard
  fen={fen}
  orientation={orientation}
  onMove={solved ? undefined : handleMove}
  lastMove={lastMove}
  viewOnly={solved}
  feedback={feedback === 'idle' ? null : feedback}
  shake={shake}
/>
```

---

## Tema visual

**Archivo:** `components/chess/chessground-theme.css`

| Token | Color |
|-------|-------|
| Light square | `#D7C1A0` |
| Dark square | `#8A6A45` |
| Last move | `rgba(200, 169, 107, .35)` |
| Correct state | `animate-pulse-correct` (Tailwind) |
| Wrong state | `animate-glow-wrong` (Tailwind) |

---

## Helpers de ajedrez

### `lib/chess/fen.ts`
```typescript
isValidFen(fen: string): boolean
getSideToMoveFromFen(fen: string): 'w' | 'b'
fenToOrientation(side: 'w' | 'b'): 'white' | 'black'
```

### `lib/chess/uci.ts`
```typescript
normalizeUciMove(uci: string): string
parseUciMove(uci: string): { from, to, promotion? }
applyUciMove(fen: string, uci: string): string | null
```

### `lib/chess/move-validation.ts`
```typescript
validateMove(fen: string, from: string, to: string): boolean
applyMove(fen: string, uci: string): string | null
isMoveCorrect(userUci: string, expectedUci: string): boolean
```

---

## Tipos compartidos

**Archivo:** `types/chess.ts`
```typescript
BoardOrientation = 'white' | 'black'
Square           = 'a1' | 'b2' | ... (literal union)
UciMove          = `${Square}${Square}` | `${Square}${Square}${PromotionPiece}`
BoardMove        = { from, to, uci, san?, fenBefore, fenAfter, legal, promotion? }
```

---

## Pantallas con tablero

| Ruta | Componente | Tipo |
|------|------------|------|
| `/` | `HeroBoardDisplay` → `ChessgroundBoard` | `viewOnly`, posición Ruy López |
| `/(app)/practice/woodpecker/[id]` | `PuzzlePlayer` → `ChessgroundBoard` | Interactivo, Woodpecker Method |
| `/(app)/design-system` | `ChessBoardShowcase` → `ChessgroundBoard` | Showcase: viewOnly, interactivo, variantes |

---

## Tests

```bash
npm test          # vitest run (una vez)
npm run test:watch  # vitest en modo watch
```

Tests en `lib/chess/__tests__/chess-helpers.test.ts`.
Cubre: `isValidFen`, `getSideToMoveFromFen`, `fenToOrientation`, `normalizeUciMove`, `parseUciMove`,
`applyUciMove`, `validateMove`, `applyMove`, `isMoveCorrect`, lógica de comparación de PuzzlePlayer.

---

## Verificación visual

1. `npm run dev` → abrir http://localhost:3001
2. **Landing** `/` — hero board con piezas reales, Ruy López
3. **Practice** `/(app)/practice/woodpecker/[id]` — tablero interactivo, mover pieza correcta → feedback verde
4. **Design System** `/(app)/design-system` — sección "Chessground Board" con 6 variantes
5. En DevTools, inspeccionar `cg-container` / `cg-board` / `piece` — confirmar que son elementos de chessground
