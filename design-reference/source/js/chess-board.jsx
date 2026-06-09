/* ============================================================
   Tazul Chess — playable ChessBoard (uses window.Chess / chess.js)
   Controlled by `fen` prop. Calls onUserMove({from,to,promotion,san,fen}).
   ============================================================ */
const { useState: useStateCB, useRef: useRefCB, useEffect: useEffectCB, useMemo } = React;

const FILES = ['a','b','c','d','e','f','g','h'];

// glyphs (solid set, recolored per side)
const GLYPH = { k:'\u265A', q:'\u265B', r:'\u265C', b:'\u265D', n:'\u265E', p:'\u265F' };

function newGame(fen) {
  try { return new window.Chess(fen); } catch (e) { return null; }
}

// piece map from fen: { e4: {type:'n', color:'w'} }
function piecesFromFen(fen) {
  const g = newGame(fen); if (!g) return {};
  const out = {}; const b = g.board();
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const sq = b[r][f]; if (sq) out[FILES[f] + (8 - r)] = { type: sq.type, color: sq.color };
  }
  return out;
}

// display row/col -> algebraic square, honoring orientation
function sqAt(row, col, white) {
  return white ? FILES[col] + (8 - row) : FILES[7 - col] + (row + 1);
}
// algebraic -> {row,col} in display space
function rcOf(sq, white) {
  const f = FILES.indexOf(sq[0]), r = parseInt(sq[1], 10);
  return white ? { row: 8 - r, col: f } : { row: r - 1, col: 7 - f };
}
// center as percentage of board
function centerPct(sq, white) { const { row, col } = rcOf(sq, white); return { x: (col + 0.5) * 12.5, y: (row + 0.5) * 12.5 }; }

function PieceGlyph({ type, color }) {
  const isWhite = color === 'w';
  return (
    <span className="piece-glyph" style={{
      display: 'grid', placeItems: 'center', fontSize: '88%', lineHeight: 1,
      color: isWhite ? '#F4EEE2' : '#1E1A16',
      WebkitTextStroke: isWhite ? '1.4px #6B5A40' : '1.1px #C8B89C',
      textShadow: isWhite ? '0 1.5px 1px rgba(0,0,0,.32)' : '0 1.5px 1px rgba(0,0,0,.36)',
    }}>{GLYPH[type]}</span>
  );
}

function ChessBoard({ fen, orientation = 'white', interactive = true, onUserMove,
                      lastMove, feedback, showCoords = true, shake }) {
  const white = orientation === 'white';
  const boardRef = useRefCB(null);
  const [sel, setSel] = useStateCB(null);          // selected square (click mode)
  const [legal, setLegal] = useStateCB([]);        // legal target squares for sel
  const [drag, setDrag] = useStateCB(null);        // { from, x, y, type, color }
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);

  useEffectCB(() => { setSel(null); setLegal([]); }, [fen]);

  const legalFor = (from) => {
    const g = newGame(fen); if (!g) return [];
    try { return g.moves({ square: from, verbose: true }).map(m => m.to); } catch (e) { return []; }
  };

  const tryMove = (from, to) => {
    if (from === to) return;
    const g = newGame(fen); if (!g) return;
    const p = pieces[from];
    let promotion = undefined;
    if (p && p.type === 'p' && (to[1] === '8' || to[1] === '1')) promotion = 'q';
    let mv;
    try { mv = g.move({ from, to, promotion }); } catch (e) { mv = null; }
    if (!mv) { setSel(null); setLegal([]); return; }            // illegal -> ignore
    onUserMove && onUserMove({ from, to, promotion, san: mv.san, uci: from + to + (promotion || ''), fen: g.fen() });
    setSel(null); setLegal([]);
  };

  const squareFromEvent = (e) => {
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    const col = Math.min(7, Math.max(0, Math.floor(x * 8))), row = Math.min(7, Math.max(0, Math.floor(y * 8)));
    return sqAt(row, col, white);
  };

  const onPointerDown = (e, sq) => {
    if (!interactive) return;
    const p = pieces[sq]; if (!p) { setSel(null); setLegal([]); return; }
    e.preventDefault();
    // click-to-move: if something selected and this is a legal target handled by square handler
    setSel(sq); setLegal(legalFor(sq));
    setDrag({ from: sq, x: e.clientX, y: e.clientY, type: p.type, color: p.color });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };
  const onPointerMove = (e) => setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : d);
  const onPointerUp = (e) => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    setDrag(d => {
      if (d) { const to = squareFromEvent(e); if (to && to !== d.from) tryMove(d.from, to); }
      return null;
    });
  };

  const onSquareClick = (sq) => {
    if (!interactive) return;
    if (sel && sel !== sq && legal.includes(sq)) { tryMove(sel, sq); return; }
    const p = pieces[sq];
    if (p) { setSel(sq); setLegal(legalFor(sq)); } else { setSel(null); setLegal([]); }
  };

  // floating dragged piece position
  let floatStyle = null;
  if (drag && boardRef.current) {
    const rect = boardRef.current.getBoundingClientRect(); const cell = rect.width / 8;
    floatStyle = { position: 'fixed', left: drag.x - cell / 2, top: drag.y - cell / 2, width: cell, height: cell, zIndex: 200, pointerEvents: 'none' };
  }

  const arrowColor = feedback === 'correct' ? 'var(--green)' : feedback === 'wrong' ? 'var(--red)' : 'var(--amber)';

  return (
    <div className="board-wrap" style={{ filter: drag ? 'none' : undefined }}>
      <div ref={boardRef} className={['board', drag && 'dragging', shake && 'board-shake'].filter(Boolean).join(' ')}>
        {Array.from({ length: 64 }).map((_, idx) => {
          const row = Math.floor(idx / 8), col = idx % 8;
          const sq = sqAt(row, col, white);
          const isLight = (row + col) % 2 === 0;
          const p = pieces[sq];
          const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
          const fbTarget = feedback && lastMove && lastMove.to === sq;
          const cls = ['sq', isLight ? 'light' : 'dark',
            sel === sq && 'sel',
            legal.includes(sq) && (p ? 'hint occ' : 'hint'),
            isLast && !feedback && 'lastmove',
            fbTarget && feedback === 'correct' && 'correct',
            fbTarget && feedback === 'wrong' && 'wrong'].filter(Boolean).join(' ');
          const showFile = showCoords && (white ? row === 7 : row === 7);
          const showRank = showCoords && (col === 0);
          return (
            <div key={sq} className={cls} onClick={() => onSquareClick(sq)} onPointerDown={(e) => onPointerDown(e, sq)}>
              {showRank && <span className="coord rank">{sq[1]}</span>}
              {showFile && <span className="coord file">{sq[0]}</span>}
              {p && !(drag && drag.from === sq) && (
                <div className="piece" style={{ cursor: interactive ? 'grab' : 'default' }}>
                  <PieceGlyph type={p.type} color={p.color} />
                </div>
              )}
            </div>
          );
        })}

        {/* last-move arrow */}
        {lastMove && lastMove.from && lastMove.to && (() => {
          const a = centerPct(lastMove.from, white), b = centerPct(lastMove.to, white);
          const ang = Math.atan2(b.y - a.y, b.x - a.x);
          const shorten = 5.2;
          const bx = b.x - Math.cos(ang) * shorten, by = b.y - Math.sin(ang) * shorten;
          const mid = 'ah-' + (lastMove.from + lastMove.to);
          return (
            <svg className="arrows" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker id={mid} markerWidth="2.6" markerHeight="2.6" refX="1.6" refY="1.3" orient="auto">
                  <path d="M0 0 L2.6 1.3 L0 2.6 L0.7 1.3 z" fill={arrowColor} />
                </marker>
              </defs>
              <line x1={a.x} y1={a.y} x2={bx} y2={by} stroke={arrowColor} strokeWidth="1.5"
                strokeLinecap="round" markerEnd={`url(#${mid})`} opacity="0.9" />
            </svg>
          );
        })()}
      </div>

      {drag && floatStyle && (
        <div style={floatStyle}>
          <div className="piece dragging" style={{ position: 'static', width: '100%', height: '100%' }}>
            <PieceGlyph type={drag.type} color={drag.color} />
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ChessBoard, newGame, piecesFromFen, centerPct, FILES });
