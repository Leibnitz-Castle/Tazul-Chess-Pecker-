# Chess Boards & PGN Viewers — Pecker Chess Platform

**Decisión adoptada:** Opción C — Híbrida  
**Fecha:** 2026-06-08

---

## Reglas absolutas

1. No usar `react-chessboard`.
2. No crear tableros manuales (divs, tablas, SVG casero, emojis, texto).
3. No usar piezas que no sean las del set CBurnett oficial de chessground.
4. No copiar código del repo Chesspecker.

---

## Mapa de componentes

| Caso de uso | Componente | Librería | Cuándo usar |
|---|---|---|---|
| Puzzle interactivo | `ChessgroundBoard` | `chessground ^9.2.1` (MIT) | `/practice/woodpecker/[id]` y cualquier tablero con `onMove` callback |
| Visor PGN completo | `LichessPgnViewer` | `@lichess-org/pgn-viewer ^2.6.0` (GPL-3.0) | Partidas completas, repertorio, elite warehouse, openings |
| Hero / decorativo | `ChessgroundBoard viewOnly` | `chessground` | Landing page, thumbnails |

---

## `ChessgroundBoard` — tablero interactivo

**Archivo:** [components/chess/ChessgroundBoard.tsx](../components/chess/ChessgroundBoard.tsx)

```tsx
import { ChessgroundBoard } from '@/components/chess/ChessgroundBoard'

// Interactivo
<ChessgroundBoard
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  orientation="white"
  onMove={(move) => { /* BoardMove */ }}
  lastMove="e2e4"
  feedback="correct"  // 'correct' | 'wrong' | null
  shake={false}
/>

// Solo lectura
<ChessgroundBoard fen={fen} viewOnly />
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `fen` | `string` | — | Posición en FEN |
| `orientation` | `'white' \| 'black'` | `'white'` | Perspectiva del tablero |
| `viewOnly` | `boolean` | `false` | Desactiva interacción |
| `onMove` | `(move: BoardMove) => void` | — | Callback al mover |
| `lastMove` | `string \| null` | `null` | UCI de la última jugada (highlight) |
| `feedback` | `'correct' \| 'wrong' \| null` | `null` | Estado visual de feedback |
| `shake` | `boolean` | `false` | Animación de error |

### CSS

- Scoped bajo `.puzzle-board` para no interferir con `@lichess-org/pgn-viewer`.
- Tema: casillas `#D7C1A0` / `#8A6A45`, piezas CBurnett embebidas como base64 SVG.
- Archivo: [components/chess/chessground-theme.css](../components/chess/chessground-theme.css)

---

## `LichessPgnViewer` — visor PGN completo

**Archivo:** [components/chess/LichessPgnViewer.tsx](../components/chess/LichessPgnViewer.tsx)

```tsx
import { LichessPgnViewer } from '@/components/chess/LichessPgnViewer'

// Partida con lista de movimientos a la derecha
<LichessPgnViewer
  pgn={`[SetUp "1"]
[FEN "rnb3kr/ppp4p/3b3B/3Pp2n/2BP4/3K1Rp1/PPP3q1/RN1Q4 w - - 0 1"]

1. Rf8+ Bxf8 2. d6+ Be6 3. Bxe6#`}
  orientation="white"
  showMoves="right"
  showControls
/>

// Sólo tablero, sin lista de movimientos
<LichessPgnViewer
  pgn="1. e4 e5 2. Nf3 Nc6 3. Bb5"
  showMoves={false}
  showControls
/>

// Navegar directamente al final
<LichessPgnViewer pgn={pgn} initialPly="last" />
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `pgn` | `string` | — | PGN completo (con o sin headers) |
| `fen` | `string` | — | FEN inicial (se añade como header al PGN) |
| `orientation` | `'white' \| 'black'` | viewer default | Perspectiva |
| `initialPly` | `number \| 'last'` | `0` | Posición inicial de navegación |
| `showMoves` | `false \| 'right' \| 'bottom' \| 'auto'` | `'right'` | Lista de movimientos |
| `showControls` | `boolean` | `true` | Botones prev/next/menu |
| `className` | `string` | — | Clase extra para el contenedor |

### Notas técnicas

- Client Component — solo funciona en el navegador (dynamic import interno para evitar SSR crash).
- CSS del viewer cargado globalmente en `app/globals.css` vía `@import`.
- Ningún método `destroy()` en la API — limpieza vía `el.innerHTML = ''`.
- Árbol de variantes, anotaciones y navegación por teclado incluidos.

---

## Licencia `@lichess-org/pgn-viewer`

**GPL-3.0-or-later**

**Análisis para este proyecto:**
- GPL-3.0 requiere publicar código fuente cuando se *distribuye* el software.
- Un SaaS web (usuarios acceden por navegador) **no es distribución** bajo GPL-3.0 — es el "SaaS loophole".
- AGPL-3.0 habría cerrado ese loophole, pero Lichess usa GPL-3.0.
- El README de Lichess interpreta que sí se debe publicar código al usar en web — posición de los autores, no estrictamente del texto legal GPL.
- **Conclusión práctica:** para este MVP privado, el riesgo legal es muy bajo. Si el proyecto se vuelve comercial y de código cerrado, evaluar alternativas (Opción B).

---

## Flujo de puzzles multi-jugada

Los ejercicios del Woodpecker Method tienen 1 a N jugadas en `solution_moves`:

```
["f3f8", "d6f8", "d5d6", "c8e6", "c4e6"]
 ^user    ^opp    ^user    ^opp    ^user
 idx 0   idx 1   idx 2   idx 3   idx 4
```

- Índices pares (0, 2, 4…): jugada del usuario — tablero interactivo.
- Índices impares (1, 3, 5…): respuesta del oponente — la app la juega automáticamente a los 700ms.
- Tras un movimiento incorrecto, el tablero revierte al **último checkpoint** (posición tras la última respuesta del oponente), no necesariamente al FEN inicial.

---

## Páginas con tableros

| Ruta | Componente | Tipo |
|---|---|---|
| `/` | `HeroBoardDisplay` → `ChessgroundBoard` | viewOnly, posición Ruy López |
| `/(app)/practice/woodpecker/[id]` | `PuzzlePlayer` → `ChessgroundBoard` | Interactivo, multi-move |
| `/(app)/design-system` | `ChessBoardShowcase` | Showcase chessground |
| `/(app)/design-system` | `LichessPgnViewer` | Showcase PGN viewer |
| `/(app)/elite-warehouse` (futuro) | `LichessPgnViewer` | Visor de partidas |
| `/(app)/openings` (futuro) | `LichessPgnViewer` | Visor de repertorio |
