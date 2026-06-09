/* ============================================================
   Aperturas Pecker — shared helpers & components
   ============================================================ */
const { useState: oS, useEffect: oE, useMemo: oM, useRef: oR } = React;

/* ---- position helpers: SAN array -> FEN at ply ---- */
function fenAtPly(moves, ply) {
  const g = new window.Chess();
  for (let i = 0; i < ply && i < moves.length; i++) {
    try { g.move(moves[i]); } catch (e) { break; }
  }
  return g.fen();
}
// last move {from,to} at given ply (the move that produced position `ply`)
function lastMoveAtPly(moves, ply) {
  if (ply <= 0) return null;
  const g = new window.Chess();
  let last = null;
  for (let i = 0; i < ply && i < moves.length; i++) {
    try { last = g.move(moves[i]); } catch (e) { break; }
  }
  return last ? { from: last.from, to: last.to } : null;
}
// group SAN into move pairs for display: [{n, w, b}]
function toMovePairs(moves) {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ n: i / 2 + 1, w: moves[i], b: moves[i + 1] || null, wi: i, bi: i + 1 });
  }
  return pairs;
}

const STATUS_META = {
  mastered: { color: 'var(--green)', label: 'Mastered' },
  learning: { color: 'var(--warning)', label: 'Learning' },
  weak:     { color: 'var(--red)', label: 'Weak' },
};
function StatusDot({ status, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: 999, background: STATUS_META[status].color, flexShrink: 0, display: 'inline-block' }} />;
}

/* ---- ECO badge: database-label style (rectangular, mono) ---- */
function EcoBadge({ eco, group }) {
  const g = group || (eco ? eco[0] : null);
  const color = (window.ECO_GROUPS[g] || {}).color || 'var(--text-2)';
  return (
    <span className="mono" style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '.02em', padding: '2px 7px', borderRadius: 4,
      background: 'var(--surface-2)', border: `1px solid ${color}55`, color,
    }}>{eco}</span>
  );
}

/* ---- mastery ring (small) ---- */
function MasteryRing({ value, size = 30, stroke = 3.5, status }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const color = status ? STATUS_META[status].color : 'var(--amber)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - value)} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)' }} />
    </svg>
  );
}

/* ---- module sub-shell: page header + tabs ---- */
const OPEN_TABS = [
  { id: 'dashboard', label: 'My Repertoires' },
  { id: 'practice', label: 'Practice' },
  { id: 'tree', label: 'Opening Tree' },
  { id: 'weak', label: 'Weaknesses' },
  { id: 'eco', label: 'ECO Explorer' },
  { id: 'import', label: 'Import PGN' },
];

function OpeningsShell({ tab, setTab, children, action, title = 'Aperturas Pecker', subtitle = 'Build, test, and refine your opening repertoire.' }) {
  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between wrap gap3" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="serif-title">{title}</h1>
          <p className="t2" style={{ fontSize: 14, marginTop: 4 }}>{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="otabs" style={{ marginBottom: 24 }}>
        {OPEN_TABS.map(t => (
          <button key={t.id} className={['otab', tab === t.id && 'on'].filter(Boolean).join(' ')} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {children}
    </div>
  );
}

/* ---- board + move-list viewer (reused across pages) ---- */
function LineViewer({ line, ply, setPly, compact }) {
  const moves = line.moves;
  const fen = oM(() => fenAtPly(moves, ply), [line.id, ply]);
  const lastMove = oM(() => lastMoveAtPly(moves, ply), [line.id, ply]);
  const orientation = line.side === 'black' ? 'black' : 'white';
  const pairs = toMovePairs(moves);

  return (
    <div className="viewer-grid">
      <div className="col" style={{ gap: 14 }}>
        <ChessBoard fen={fen} orientation={orientation} interactive={false} lastMove={lastMove} showCoords />
        <div className="row between">
          <div className="row gap2">
            <Button size="sm" variant="outline" icon="prev" onClick={() => setPly(0)} aria-label="Start" disabled={ply === 0} />
            <Button size="sm" variant="outline" onClick={() => setPly(Math.max(0, ply - 1))} aria-label="Back" disabled={ply === 0}><Icon name="chevDown" size={15} style={{ transform: 'rotate(90deg)' }} /></Button>
            <Button size="sm" variant="outline" onClick={() => setPly(Math.min(moves.length, ply + 1))} aria-label="Forward" disabled={ply === moves.length}><Icon name="chevDown" size={15} style={{ transform: 'rotate(-90deg)' }} /></Button>
            <Button size="sm" variant="outline" icon="next" onClick={() => setPly(moves.length)} aria-label="End" disabled={ply === moves.length} />
          </div>
          <span className="mono tnum t3" style={{ fontSize: 12.5 }}>ply {ply}/{moves.length}</span>
        </div>
      </div>

      <div className="col" style={{ gap: 12, minWidth: 0 }}>
        <div className="row gap2 wrap" style={{ alignItems: 'center' }}>
          <EcoBadge eco={line.eco} />
          <span className="h3">{line.name}</span>
        </div>
        {/* PGN move list */}
        <div className="pgn-list">
          {pairs.map(p => (
            <div key={p.n} className="pgn-row">
              <span className="pgn-num mono">{p.n}.</span>
              <button className={['pgn-mv mono', ply === p.wi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.wi + 1)}>{p.w}</button>
              {p.b
                ? <button className={['pgn-mv mono', ply === p.bi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.bi + 1)}>{p.b}</button>
                : <span />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- study notes tabs (Notes / Plan / Common Error / Model Game) ---- */
function StudyTabs({ line }) {
  const [t, setT] = oS('notes');
  const tabs = [['notes', 'Notes'], ['plan', 'Typical Plan'], ['error', 'Common Error'], ['model', 'Model Game']];
  const body = { notes: line.note, plan: line.plan, error: line.error,
    model: 'Kasparov — Topalov, Wijk aan Zee 1999 illustrates the attacking themes of this structure.' };
  return (
    <Card pad={false}>
      <div className="subtabs">
        {tabs.map(([k, l]) => <button key={k} className={['subtab', t === k && 'on'].filter(Boolean).join(' ')} onClick={() => setT(k)}>{l}</button>)}
      </div>
      <div className="study-body fade-in" key={t}>
        {t === 'error'
          ? <div className="row gap3"><span style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }}><Icon name="x" size={15} /></span><p className="t2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{body[t]}</p></div>
          : <p className="t2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>{body[t]}</p>}
      </div>
    </Card>
  );
}

Object.assign(window, {
  fenAtPly, lastMoveAtPly, toMovePairs, StatusDot, STATUS_META,
  EcoBadge, MasteryRing, OpeningsShell, OPEN_TABS, LineViewer, StudyTabs,
});
