/* ============================================================
   Elite Warehouse — Stockfish · Recommendations · Export · Pipeline
   ============================================================ */
const { useState: whS4, useEffect: whE4, useRef: whR4, useMemo: whM4 } = React;

/* ---------------- Stockfish Analysis Panel ---------------- */
function StockfishPanel() {
  const [sel, setSel] = whS4('sf-1');
  const [depth, setDepth] = whS4(99);
  const [running, setRunning] = whS4(false);
  const [liveDepth, setLiveDepth] = whS4(40);
  const item = window.WH_SF_QUEUE.find(q => q.id === sel) || window.WH_SF_QUEUE[0];
  const timer = whR4(null);

  whE4(() => () => clearInterval(timer.current), []);
  const run = () => {
    setRunning(true); setLiveDepth(20);
    timer.current = setInterval(() => setLiveDepth(d => { if (d >= depth) { clearInterval(timer.current); setRunning(false); return depth; } return d + 3; }), 180);
  };

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="wh-metrics-4 stagger">
        <Metric label="Pending positions" value="3,481" mono trendLabel="in queue" />
        <Metric label="Analyzing now" value="2" mono trendLabel="workers busy" />
        <Metric label="Completed today" value="1,204" mono trend={12} trendLabel="vs yesterday" />
        <Metric label="Avg depth time" value="4.2s" mono trendLabel="per position" />
      </div>

      <div className="wh-viewer">
        {/* queue list */}
        <Card pad={false}>
          <div style={{ padding: '16px 18px 8px' }}><CardHead title="Analysis queue" icon="bolt" /></div>
          <div style={{ padding: '0 10px 10px' }}>
            {window.WH_SF_QUEUE.map(q => (
              <div key={q.id} className={['tree-row', sel === q.id && 'sel'].filter(Boolean).join(' ')} style={{ borderRadius: 8 }} onClick={() => setSel(q.id)} tabIndex={0}>
                <span className="worker-dot" style={{ background: WH_STATUS[q.status].c }} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row between"><span className="mono nm" style={{ fontSize: 12.5 }}>{q.game}</span><StatusBadge status={q.status} small /></div>
                  <div className="mono t3" style={{ fontSize: 10.5, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.fen.slice(0, 30)}…</div>
                  {q.status === 'analyzing' && <div className="progress" style={{ height: 4, marginTop: 6 }}><div className="progress-bar" style={{ width: `${q.progress * 100}%` }} /></div>}
                </div>
                <span className="mono tnum" style={{ fontSize: 12, color: q.eval.startsWith('-') ? 'var(--red)' : q.eval === '—' ? 'var(--text-3)' : 'var(--green)' }}>{q.eval}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* position analysis */}
        <div className="col" style={{ gap: 16 }}>
          <Card>
            <div className="row gap4">
              <div style={{ width: 180, flexShrink: 0 }}><ChessBoard fen={item.fen} interactive={false} showCoords={false} /></div>
              <div className="grow col" style={{ gap: 10, minWidth: 0 }}>
                <div className="eyebrow">Position · {item.game}</div>
                <div className="mono t3" style={{ fontSize: 10.5, wordBreak: 'break-all', background: '#120F0D', padding: '8px 10px', borderRadius: 6 }}>{item.fen}</div>
                <div className="row between">
                  <div><div className="eyebrow">Current eval</div><div className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>{running ? '+0.…' : item.eval}</div></div>
                  <div><div className="eyebrow">Depth</div><div className="mono tnum" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{running ? liveDepth : (item.status === 'done' || item.status === 'analyzing' ? item.depth : 0)}</div></div>
                </div>
              </div>
            </div>
            {running && <div style={{ marginTop: 14 }}><div className="row between" style={{ marginBottom: 6 }}><span className="t3" style={{ fontSize: 12 }}>Searching…</span><span className="mono tnum t3" style={{ fontSize: 12 }}>depth {liveDepth}/{depth}</span></div><Progress value={liveDepth / depth} /></div>}
          </Card>

          {/* settings */}
          <Card style={{ background: 'var(--surface-2)' }}>
            <div className="row between" style={{ marginBottom: 14 }}><span className="eyebrow">Analysis settings</span>
              <span className="status-badge" style={{ color: 'var(--warning)', background: 'var(--warning-ghost)', borderColor: 'rgba(196,138,65,.4)' }}><Icon name="bolt" size={11} fill /> CPU intensive</span>
            </div>
            <div className="row between" style={{ marginBottom: 8 }}><span className="t2" style={{ fontSize: 13 }}>Target depth</span><span className="mono amber tnum" style={{ fontWeight: 700 }}>{depth}</span></div>
            <input type="range" className="range" min="20" max="99" value={depth} onChange={e => setDepth(+e.target.value)} style={{ width: '100%' }} />
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)', background: '#120F0D', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7, marginTop: 14 }}>
              <span className="t3">best</span> Bd2 <span className="green">+0.42</span><br /><span className="t3">pv</span> Bd2 Rfc8 Rac1 Qb7 a4 bxa4
            </div>
            <div className="row gap2" style={{ marginTop: 14 }}>
              <Button size="sm" variant="amber" icon="bolt" loading={running} onClick={run} className="grow">{running ? 'Analyzing…' : 'Run analysis'}</Button>
              <Button size="sm" variant="outline" icon="layers">Batch all queued</Button>
            </div>
          </Card>

          {/* completed feed */}
          <Card pad={false}>
            <div style={{ padding: '14px 18px 6px' }}><CardHead title="Completed analyses" icon="check" /></div>
            <div style={{ padding: '0 10px 10px' }}>
              {window.WH_SF_DONE.map((d, i) => (
                <div key={i} className="row between" style={{ padding: '10px 8px', borderTop: '1px solid var(--line-soft)' }}>
                  <span className="mono t2" style={{ fontSize: 12 }}>{d.fen}</span>
                  <div className="row gap3"><span className="mono tnum t3" style={{ fontSize: 11 }}>d{d.depth} · {d.time}</span><span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700, color: d.eval.startsWith('−') ? 'var(--red)' : 'var(--green)' }}>{d.eval}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Study Recommendations ---------------- */
const REC_SEV = { trend: { c: 'var(--blue)', label: 'Elite trend' }, weak: { c: 'var(--red)', label: 'Underprepared' }, new: { c: 'var(--warning)', label: 'New in TWIC' } };
function Recommendations({ openGame, go }) {
  return (
    <div className="col" style={{ gap: 20 }}>
      <p className="t2" style={{ fontSize: 14, maxWidth: 620 }}>Based on your repertoire, imported elite games, and weak positions. Evidence-driven — every card links to the games it came from.</p>
      <div className="rec-grid stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {window.WH_RECS.map(r => (
          <div key={r.id} className="rec-card">
            <div style={{ width: 88 }}><ChessBoard fen={r.fen} interactive={false} showCoords={false} /></div>
            <div className="col" style={{ gap: 10, minWidth: 0 }}>
              <div className="row between gap2">
                <span className="status-badge" style={{ color: REC_SEV[r.severity].c, background: REC_SEV[r.severity].c + '1f', borderColor: REC_SEV[r.severity].c + '50' }}>{REC_SEV[r.severity].label}</span>
                <EcoBadge eco={r.eco} />
              </div>
              <div style={{ fontWeight: 650, fontSize: 14.5, lineHeight: 1.3 }}>{r.title}</div>
              <p className="t2" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{r.reason}</p>
              <div className="row gap3 wrap" style={{ fontSize: 11.5 }}>
                <span className="t3"><span className="mono tnum amber">{r.games}</span> elite games</span>
                <span className="t3">Top: {r.players.join(', ')}</span>
              </div>
              <div className="row gap2 wrap">
                <Button size="sm" variant="amber" onClick={() => go('games')}>View games</Button>
                <Button size="sm" variant="outline">Practice</Button>
                <Button size="sm" variant="ghost" icon="plus">Add to set</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* trending positions */}
      <Card>
        <CardHead title="Trending positions · last TWIC archive" icon="chart" />
        <DataTable rowKey="eco" rows={window.WH_TRENDS} columns={[
          { key: 'eco', label: 'ECO', render: r => <EcoBadge eco={r.eco} /> },
          { key: 'name', label: 'Line', render: r => <span className="nm">{r.name}</span> },
          { key: 'games', label: 'Appearances', align: 'right', render: r => <span className="mono tnum">{r.games}</span> },
          { key: 'spark', label: 'Frequency', w: 120, render: r => <Sparkline data={[3, 5, 4, 7, 6, 9, 8, Math.round(r.games / 40)]} w={100} h={22} color={r.trend > 0 ? 'var(--green)' : 'var(--red)'} /> },
          { key: 'trend', label: 'Trend', align: 'right', render: r => <span className="mono tnum" style={{ color: r.trend > 0 ? 'var(--green)' : 'var(--red)' }}>{r.trend > 0 ? '+' : ''}{r.trend}%</span> },
          { key: 'seen', label: 'Last seen', align: 'right', render: () => <span className="t3">2h ago</span> },
        ]} />
      </Card>
    </div>
  );
}

/* ---------------- Export Panel ---------------- */
function ExportPanel() {
  const [fmt, setFmt] = whS4('csv');
  const [scope, setScope] = whS4('filtered');
  const [fields, setFields] = whS4({ date: true, players: true, ratings: true, result: true, eco: true, opening: true, event: true, moves: true, fen: false, eval: false });
  const formats = [['csv', 'CSV', 'Spreadsheet-ready'], ['pgn', 'PGN', 'Standard game notation'], ['json', 'JSON', 'Structured data'], ['pbi', 'Power BI CSV', 'BI-optimized columns']];
  const scopes = [['all', 'All games', '248,910'], ['filtered', 'Current filtered view', '1,284'], ['eco', 'By ECO family', '—'], ['player', 'By player', '—']];
  const recentExports = [
    { file: 'candidates_2024.csv', fmt: 'CSV', rows: 91, date: '1h ago' },
    { file: 'najdorf_elite.pgn', fmt: 'PGN', rows: 2104, date: 'Yesterday' },
    { file: 'opening_stats.csv', fmt: 'Power BI', rows: 48, date: '2 days ago' },
  ];

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="two-grid">
        <Card>
          <CardHead title="Format" icon="upload" />
          <div className="source-grid">
            {formats.map(([id, name, desc]) => (
              <button key={id} className="card" style={{ padding: 14, textAlign: 'left', borderColor: fmt === id ? 'var(--amber)' : undefined, background: fmt === id ? 'var(--amber-ghost)' : undefined }} onClick={() => setFmt(id)}>
                <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: fmt === id ? 'var(--amber)' : 'var(--text)' }}>{name}</div>
                <div className="t3" style={{ fontSize: 11.5, marginTop: 3 }}>{desc}</div>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Scope" icon="filter" />
          <div className="col" style={{ gap: 8 }}>
            {scopes.map(([id, name, count]) => (
              <button key={id} className="row between" style={{ padding: '12px 14px', borderRadius: 9, border: `1px solid ${scope === id ? 'var(--amber)' : 'var(--line)'}`, background: scope === id ? 'var(--amber-ghost)' : 'var(--surface-2)' }} onClick={() => setScope(id)}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</span><span className="mono tnum t3" style={{ fontSize: 12 }}>{count}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title="Fields" icon="layers" />
        <div className="row gap2 wrap">
          {Object.keys(fields).map(f => (
            <button key={f} className={['chip', fields[f] && 'chip-active'].filter(Boolean).join(' ')} onClick={() => setFields(s => ({ ...s, [f]: !s[f] }))} style={{ textTransform: 'capitalize' }}>
              {fields[f] && <Icon name="check" size={12} />}{f}
            </button>
          ))}
        </div>
      </Card>

      <Card pad={false}>
        <div style={{ padding: '18px 20px 10px' }} className="row between">
          <CardHead title="Preview" icon="warehouse" />
          <Button size="sm" variant="amber" icon="upload">Export {formats.find(f => f[0] === fmt)[1]}</Button>
        </div>
        <div style={{ padding: '0 12px 12px' }}>
          <DataTable rowKey="id" rows={window.WH_GAMES.slice(0, 5)} columns={[
            ...(fields.date ? [{ key: 'date', label: 'Date', render: r => <span className="mono tnum t3">{r.date}</span> }] : []),
            ...(fields.players ? [{ key: 'white', label: 'White', render: r => <span className="nm">{r.white}</span> }, { key: 'black', label: 'Black', render: r => <span className="nm">{r.black}</span> }] : []),
            ...(fields.ratings ? [{ key: 'whiteElo', label: 'WElo', align: 'right', render: r => <span className="mono tnum">{r.whiteElo}</span> }] : []),
            ...(fields.result ? [{ key: 'result', label: 'Res', align: 'center', render: r => <ResultBadge result={r.result} /> }] : []),
            ...(fields.eco ? [{ key: 'eco', label: 'ECO', render: r => <EcoBadge eco={r.eco} /> }] : []),
            ...(fields.opening ? [{ key: 'opening', label: 'Opening', render: r => <span className="t2">{r.opening}</span> }] : []),
            ...(fields.moves ? [{ key: 'moveCount', label: 'Mv', align: 'right', render: r => <span className="mono tnum t3">{r.moveCount}</span> }] : []),
          ]} />
        </div>
      </Card>

      <Card pad={false}>
        <div style={{ padding: '18px 20px 10px' }}><CardHead title="Recent exports" icon="clock" /></div>
        <div style={{ padding: '0 12px 12px' }}>
          <DataTable rowKey="file" rows={recentExports} columns={[
            { key: 'file', label: 'File', render: r => <span className="mono nm">{r.file}</span> },
            { key: 'fmt', label: 'Format', render: r => <span className="badge" style={{ height: 20 }}>{r.fmt}</span> },
            { key: 'rows', label: 'Rows', align: 'right', render: r => <span className="mono tnum">{r.rows.toLocaleString()}</span> },
            { key: 'date', label: 'When', align: 'right', render: r => <span className="t3">{r.date}</span> },
            { key: 'dl', label: '', align: 'right', render: () => <button className="t3"><Icon name="upload" size={15} style={{ transform: 'rotate(180deg)' }} /></button> },
          ]} />
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Pipeline Status ---------------- */
function PipelineStatus() {
  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="wh-metrics stagger">
        <Metric label="Queue depth" value="3,481" mono trendLabel="positions" />
        <Metric label="Active workers" value="3 / 5" mono />
        <Metric label="Throughput" value="240/min" mono trend={6} trendLabel="positions" />
        <Metric label="Failed jobs" value="6" mono trendLabel="last 24h" />
        <Metric label="Last import" value="2h ago" trendLabel="831 games" />
      </div>

      <div className="two-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* workers */}
        <Card>
          <CardHead title="Worker status" icon="bolt" />
          <div className="col" style={{ gap: 8 }}>
            {window.WH_WORKERS.map(w => (
              <div key={w.id} className="worker-row">
                <span className="worker-dot" style={{ background: w.status === 'busy' ? 'var(--green)' : 'var(--text-3)' }} />
                <div className="grow"><div className="row between"><span className="mono nm" style={{ fontSize: 13 }}>{w.name}</span><span className="mono t3" style={{ fontSize: 11 }}>{w.task}</span></div>
                  <div className="progress" style={{ height: 4, marginTop: 6 }}><div className="progress-bar" style={{ width: `${w.load * 100}%`, background: w.load > 0.9 ? 'var(--warning)' : 'var(--amber)' }} /></div></div>
                <span className="mono tnum t2" style={{ fontSize: 12, width: 34, textAlign: 'right' }}>{Math.round(w.load * 100)}%</span>
              </div>
            ))}
          </div>
          <hr className="divider" style={{ margin: '16px 0 14px' }} />
          <div className="eyebrow" style={{ marginBottom: 12 }}>Database stats</div>
          <div className="four-grid" style={{ gap: 12 }}>
            {window.WH_DB_STATS.map(([k, v]) => <div key={k}><div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{v}</div><div className="eyebrow">{k}</div></div>)}
          </div>
        </Card>

        {/* log */}
        <Card pad={false}>
          <div style={{ padding: '18px 20px 10px' }} className="row between"><CardHead title="Recent tasks & errors" icon="warehouse" /><span className="status-badge" style={{ color: 'var(--green)', background: 'var(--green-ghost)', borderColor: 'rgba(78,138,98,.4)' }}><span className="worker-dot" style={{ background: 'var(--green)' }} /> Healthy</span></div>
          <div style={{ padding: '0 16px 16px' }}><LogPanel lines={window.WH_LOG} height={300} /></div>
        </Card>
      </div>

      {/* recent errors */}
      <Card pad={false}>
        <div style={{ padding: '18px 20px 10px' }}><CardHead title="Failed jobs" icon="x" /></div>
        <div style={{ padding: '0 12px 12px' }}>
          <DataTable rowKey="id" rows={[
            { id: 'j-91', job: 'stockfish · g-2419 d99', error: 'Worker timeout at depth 91', time: '14:23:02', action: 'Re-queued' },
            { id: 'j-88', job: 'import · norway_blitz.pgn', error: 'Malformed PGN at game 142', time: '2 days ago', action: 'Needs review' },
            { id: 'j-84', job: 'normalize · player names', error: 'Ambiguous: "Carlsen, M" vs "Carlsen, Magnus"', time: '2 days ago', action: 'Resolved' },
          ]} columns={[
            { key: 'job', label: 'Job', render: r => <span className="mono nm" style={{ fontSize: 12 }}>{r.job}</span> },
            { key: 'error', label: 'Error', render: r => <span style={{ color: 'var(--red)' }}>{r.error}</span> },
            { key: 'time', label: 'When', render: r => <span className="mono t3">{r.time}</span> },
            { key: 'action', label: 'Status', align: 'right', render: r => <span className="t2">{r.action}</span> },
          ]} />
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { StockfishPanel, Recommendations, ExportPanel, PipelineStatus });
