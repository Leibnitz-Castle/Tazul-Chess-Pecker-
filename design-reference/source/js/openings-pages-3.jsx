/* ============================================================
   Aperturas Pecker — Opening Tree · Weaknesses · ECO Explorer
   ============================================================ */
const { useState: opS3, useRef: opR3, useMemo: opM3 } = React;

/* ---------------- Opening Tree ---------------- */
// curated e4 tree; x = depth column (0..5), y = vertical slot
const TREE_NODES = [
  { id: 'root', path: [], label: 'start', x: 0, y: 3, status: null, root: true },
  { id: 'e4', path: ['e4'], label: '1.e4', x: 1, y: 3, status: 'mastered', main: true },
  // open games
  { id: 'e5', path: ['e4','e5'], label: '...e5', x: 2, y: 1.4, status: 'mastered', main: true },
  { id: 'nf3', path: ['e4','e5','Nf3','Nc6'], label: 'Nf3 Nc6', x: 3, y: 1.4, status: 'mastered', main: true },
  { id: 'italian', path: ['e4','e5','Nf3','Nc6','Bc4'], label: 'Bc4', eco: 'C50', x: 4, y: 0.4, status: 'mastered', main: true },
  { id: 'ruy', path: ['e4','e5','Nf3','Nc6','Bb5'], label: 'Bb5', eco: 'C65', x: 4, y: 1.5, status: 'weak' },
  { id: 'scotch', path: ['e4','e5','Nf3','Nc6','d4'], label: 'd4', eco: 'C45', x: 4, y: 2.5, status: 'learning' },
  // sicilian
  { id: 'c5', path: ['e4','c5'], label: '...c5', x: 2, y: 3.5, status: 'learning', main: true },
  { id: 'najdorf', path: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6'], label: 'Najdorf', eco: 'B90', x: 4, y: 3.6, status: 'learning' },
  // french / caro
  { id: 'e6', path: ['e4','e6'], label: '...e6', eco: 'C11', x: 2, y: 4.8, status: 'learning' },
  { id: 'c6', path: ['e4','c6'], label: '...c6', eco: 'B12', x: 2, y: 5.8, status: 'mastered' },
];
const TREE_EDGES = [
  ['root','e4'], ['e4','e5'], ['e5','nf3'], ['nf3','italian'], ['nf3','ruy'], ['nf3','scotch'],
  ['e4','c5'], ['c5','najdorf'], ['e4','e6'], ['e4','c6'],
];
const edgeColor = (s) => s === 'mastered' ? 'rgba(78,138,98,.55)' : s === 'weak' ? 'rgba(164,77,69,.5)' : s === 'learning' ? 'rgba(196,138,65,.5)' : 'var(--line)';

function OpeningTree() {
  const [sel, setSel] = opS3('e4');
  const [tip, setTip] = opS3(null);
  const [zoom, setZoom] = opS3(1);
  const wrapRef = opR3(null);
  const node = TREE_NODES.find(n => n.id === sel);
  const fen = node ? fenAtPly(node.path, node.path.length) : new window.Chess().fen();
  const lastMv = node && node.path.length ? lastMoveAtPly(node.path, node.path.length) : null;

  const colW = 16, rowH = 14; // percentage units
  const pos = (n) => ({ left: 8 + n.x * colW + '%', top: 8 + n.y * rowH + '%' });
  const center = (n) => ({ cx: 8 + n.x * colW, cy: 8 + n.y * rowH });

  return (
    <div className="viewer-grid">
      <div className="col" style={{ gap: 12 }}>
        <div className="tree-canvas" ref={wrapRef}>
          {/* zoom controls */}
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5 }} className="row gap2">
            <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(1.4, z + 0.15))} aria-label="Zoom in"><Icon name="plus" size={14} /></Button>
            <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.7, z - 0.15))} aria-label="Zoom out"><span style={{ fontWeight: 800 }}>−</span></Button>
          </div>
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '8% 50%', transition: 'transform .22s cubic-bezier(.2,.7,.2,1)' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {TREE_EDGES.map(([a, b], i) => {
                const na = TREE_NODES.find(n => n.id === a), nb = TREE_NODES.find(n => n.id === b);
                const ca = center(na), cb = center(nb);
                const midX = (ca.cx + cb.cx) / 2;
                return <path key={i} d={`M ${ca.cx}% ${ca.cy}% C ${midX}% ${ca.cy}%, ${midX}% ${cb.cy}%, ${cb.cx}% ${cb.cy}%`}
                  fill="none" stroke={edgeColor(nb.status)} strokeWidth={nb.main ? 2.4 : 1.6} />;
              })}
            </svg>
            {TREE_NODES.map(n => (
              <button key={n.id} className={['tnode', sel === n.id && 'sel'].filter(Boolean).join(' ')} style={pos(n)}
                onClick={() => setSel(n.id)}
                onMouseEnter={e => { const r = wrapRef.current.getBoundingClientRect(); setTip({ n, x: e.clientX, y: e.clientY }); }}
                onMouseMove={e => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                onMouseLeave={() => setTip(null)}>
                <div className="tnode-dot" style={{ width: n.root ? 30 : 40, height: n.root ? 30 : 40, borderColor: n.status ? edgeColor(n.status).replace(/[\d.]+\)$/, '0.8)') : undefined }}>
                  {n.root ? '\u265E' : n.label.replace(/^\.\.\./, '').replace(/^1\./, '')}
                </div>
                {n.eco && <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)' }}><EcoBadge eco={n.eco} /></span>}
              </button>
            ))}
          </div>
          {tip && (
            <div className="ctip" style={{ left: tip.x + 14, top: tip.y + 14 }}>
              <div className="row gap2" style={{ marginBottom: 4 }}>{tip.n.eco && <EcoBadge eco={tip.n.eco} />}<span style={{ fontWeight: 700, fontSize: 12.5 }}>{tip.n.label}</span></div>
              <div className="t3" style={{ fontSize: 11 }}>Move {Math.ceil(tip.n.path.length / 2) || 0} · {tip.n.status ? STATUS_META[tip.n.status].label : 'Start'}</div>
              {tip.n.status && <div className="row gap2" style={{ marginTop: 4, alignItems: 'center' }}><StatusDot status={tip.n.status} size={7} /><span className="mono t2" style={{ fontSize: 11 }}>practiced recently</span></div>}
            </div>
          )}
        </div>
        {/* legend */}
        <div className="row gap4 wrap" style={{ padding: '4px 2px' }}>
          {[['mastered', 'Mastered line'], ['learning', 'Learning'], ['weak', 'Weak'], [null, 'Main line']].map(([s, l], i) => (
            <span key={i} className="row gap2" style={{ fontSize: 12, color: 'var(--text-2)' }}>
              <span style={{ width: 16, height: 3, borderRadius: 999, background: s ? edgeColor(s) : 'var(--text-2)' }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* board + node detail */}
      <div className="col" style={{ gap: 16 }}>
        <Card>
          <ChessBoard fen={fen} interactive={false} lastMove={lastMv} showCoords />
        </Card>
        <Card>
          <div className="row gap2 wrap" style={{ alignItems: 'center', marginBottom: 8 }}>
            {node.eco && <EcoBadge eco={node.eco} />}
            <span className="h3">{node.root ? 'Starting position' : node.label}</span>
          </div>
          <div className="mono t3" style={{ fontSize: 12, marginBottom: 14 }}>{node.path.length ? node.path.join(' ') : '—'}</div>
          <Button size="sm" variant="outline" icon="plus" className="btn-block">Add variation from here</Button>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Weaknesses Dashboard ---------------- */
function OpeningWeaknesses({ openPractice }) {
  const weak = window.WEAK_LINES;
  return (
    <div className="col" style={{ gap: 22 }}>
      {/* charts row */}
      <div className="two-grid">
        <Card>
          <CardHead title="Mastery by opening family" icon="chart" />
          {window.FAMILY_MASTERY.map(f => <BarRow key={f.family} label={f.family} value={f.acc} />)}
        </Card>
        <Card>
          <CardHead title="Lines due for review" icon="clock" />
          <div className="col center" style={{ gap: 6, padding: '6px 0 14px' }}>
            <Ring value={weak.length / window.ALL_LINES.length} size={132} color="var(--warning)">
              <div className="col center"><div className="stat" style={{ fontSize: 30 }}>{weak.length}</div><div className="t3" style={{ fontSize: 11 }}>of {window.ALL_LINES.length} lines</div></div>
            </Ring>
            <div className="t3" style={{ fontSize: 12.5 }}>Below 70% mastery</div>
          </div>
        </Card>
      </div>

      {/* practice activity heatmap */}
      <Card style={{ overflowX: 'auto' }}>
        <CardHead title="Practice activity · last 12 months" icon="flame"
          action={<div className="row gap2" style={{ fontSize: 11 }}><span className="t3">Less</span>{[0,1,2,3,4].map(l => <span key={l} className={`heat-cell ${l ? 'l' + l : ''}`} />)}<span className="t3">More</span></div>} />
        <Heatmap weeks={window.ACTIVITY} />
      </Card>

      {/* weakest positions */}
      <Card pad={false}>
        <div style={{ padding: '22px 24px 6px' }}><CardHead title="Weakest positions" icon="target" /></div>
        <div>
          {weak.map(l => (
            <div key={l.id} className="row between wrap gap3" style={{ padding: '14px 24px', borderTop: '1px solid var(--line-soft)' }}>
              <div className="row gap4" style={{ minWidth: 0 }}>
                <div style={{ width: 56, flexShrink: 0 }}><ChessBoard fen={fenAtPly(l.moves, l.moves.length)} interactive={false} showCoords={false} /></div>
                <div style={{ minWidth: 0 }}>
                  <div className="row gap2" style={{ alignItems: 'center', marginBottom: 4 }}><StatusDot status={l.status} /><EcoBadge eco={l.eco} /><span style={{ fontSize: 14, fontWeight: 650 }}>{l.name}</span></div>
                  <div className="t3" style={{ fontSize: 12 }}>{l.failures} failures · last failed {l.lastFailed}</div>
                </div>
              </div>
              <div className="row gap3">
                <div className="text-right"><div className="mono tnum" style={{ fontSize: 16, fontWeight: 700, color: STATUS_META[l.status].color }}>{Math.round(l.mastery * 100)}%</div><div className="eyebrow">mastery</div></div>
                <div className="row gap2">
                  <Button size="sm" variant="amber" onClick={() => openPractice(l.id)}>Practice</Button>
                  <Button size="sm" variant="outline">Notes</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- ECO Explorer ---------------- */
function EcoExplorer({ openModel }) {
  const [group, setGroup] = opS3('all');
  const [q, setQ] = opS3('');
  const [sel, setSel] = opS3('B90');
  const entries = window.ECO_ENTRIES
    .filter(e => group === 'all' || e.group === group)
    .filter(e => (e.eco + e.name + e.moves).toLowerCase().includes(q.toLowerCase()));
  const selEntry = window.ECO_ENTRIES.find(e => e.eco === sel);
  const relatedLines = window.ALL_LINES.filter(l => l.eco === sel);
  const selFen = opM3(() => {
    const g = new window.Chess();
    const sans = (selEntry?.moves || '').replace(/\d+\./g, '').trim().split(/\s+/).filter(Boolean);
    sans.forEach(s => { try { g.move(s); } catch (e) {} });
    return g.fen();
  }, [sel]);

  return (
    <div className="overview-grid">
      {/* list */}
      <Card pad={false} style={{ position: 'sticky', top: 80 }}>
        <div style={{ padding: '14px 14px 10px' }}>
          <div className="row gap2" style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={15} /></span>
            <input className="input" style={{ height: 38, paddingLeft: 34, fontSize: 13 }} placeholder="ECO, name, or moves…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="seg" style={{ width: '100%', justifyContent: 'space-between' }}>
            {['all','A','B','C','D','E'].map(g => <button key={g} className={group === g ? 'on' : ''} style={{ flex: 1, padding: 0 }} onClick={() => setGroup(g)}>{g === 'all' ? 'All' : g}</button>)}
          </div>
        </div>
        <hr className="divider" />
        <div style={{ padding: 8, maxHeight: 480, overflowY: 'auto' }}>
          {entries.map(e => (
            <div key={e.eco} className={['eco-row', sel === e.eco && 'sel'].filter(Boolean).join(' ')} onClick={() => setSel(e.eco)} tabIndex={0} onKeyDown={ev => ev.key === 'Enter' && setSel(e.eco)}>
              <EcoBadge eco={e.eco} group={e.group} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                <div className="mono t3" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.moves}</div>
              </div>
              {e.inRep && <span title="In your repertoire" style={{ color: 'var(--green)' }}><Icon name="check" size={15} /></span>}
            </div>
          ))}
          {entries.length === 0 && <div className="t3" style={{ padding: 20, textAlign: 'center', fontSize: 13 }}>No ECO codes match.</div>}
        </div>
      </Card>

      {/* detail */}
      <div className="col" style={{ gap: 20 }}>
        <Card>
          <div className="row between wrap gap3" style={{ marginBottom: 16 }}>
            <div className="row gap3" style={{ alignItems: 'center' }}>
              <EcoBadge eco={selEntry.eco} group={selEntry.group} />
              <div><div className="h3">{selEntry.name}</div><div className="t3" style={{ fontSize: 12 }}>{window.ECO_GROUPS[selEntry.group].label}</div></div>
            </div>
            {selEntry.inRep ? <Badge variant="green" dot>In repertoire</Badge> : <Badge dot>Not in repertoire</Badge>}
          </div>
          <div className="viewer-grid">
            <div style={{ maxWidth: 320 }}><ChessBoard fen={selFen} interactive={false} showCoords /></div>
            <div className="col" style={{ gap: 14 }}>
              <div><div className="eyebrow" style={{ marginBottom: 6 }}>Main moves</div><div className="mono" style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{selEntry.moves}</div></div>
              <div><div className="eyebrow" style={{ marginBottom: 6 }}>Related lines</div>
                {relatedLines.length ? relatedLines.map(l => (
                  <div key={l.id} className="row gap2" style={{ padding: '6px 0' }}><StatusDot status={l.status} /><span style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</span></div>
                )) : <div className="t3" style={{ fontSize: 12.5 }}>No lines in your repertoire yet.</div>}
              </div>
              <div className="row gap2">
                <Button size="sm" variant="amber" icon="bolt">Practice this</Button>
                <Button size="sm" variant="outline" icon="openings" onClick={openModel}>Model games</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { OpeningTree, OpeningWeaknesses, EcoExplorer });
