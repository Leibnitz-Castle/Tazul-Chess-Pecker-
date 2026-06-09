/* ============================================================
   Elite Warehouse — Hub + Games Browser
   ============================================================ */
const { useState: whS1, useMemo: whM1 } = React;

/* ---------------- Hub ---------------- */
function WarehouseHub({ go, openGame }) {
  const s = window.WH_STATS;
  const importCols = [
    { key: 'file', label: 'File', render: r => <span className="mono nm">{r.file}</span> },
    { key: 'source', label: 'Source', render: r => <span className="badge" style={{ height: 20 }}>{r.source}</span> },
    { key: 'games', label: 'Games', align: 'right', render: r => <span className="mono tnum">{r.games.toLocaleString()}</span> },
    { key: 'kept', label: 'Kept +2600', align: 'right', render: r => <span className="mono tnum amber">{r.kept.toLocaleString()}</span> },
    { key: 'size', label: 'Size', align: 'right', render: r => <span className="mono tnum t3">{r.size}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'date', label: 'When', align: 'right', render: r => <span className="t3">{r.date}</span> },
  ];
  return (
    <div className="col" style={{ gap: 20 }}>
      {/* stats bar */}
      <div className="wh-metrics stagger">
        <Metric label="Total games" value={(s.totalGames / 1000).toFixed(1) + 'k'} mono trend={5} trendLabel="this week" />
        <Metric label="Elite players" value={s.totalPlayers.toLocaleString()} mono />
        <Metric label="Positions" value={(s.totalPositions / 1e6).toFixed(2) + 'M'} mono />
        <Metric label="Analyzed" value={Math.round(s.analyzedPct * 100) + '%'} mono trend={3} trendLabel="vs last week" />
        <Metric label="Last import" value={s.lastImport} trendLabel="twic1574.pgn" />
      </div>

      {/* quick actions */}
      <div className="row gap2 wrap">
        <Button variant="amber" icon="upload" onClick={() => go('import')}>Import PGN</Button>
        <Button variant="outline" icon="warehouse" onClick={() => go('games')}>Browse Games</Button>
        <Button variant="outline" icon="chart" onClick={() => go('openings')}>View Analytics</Button>
        <Button variant="outline" icon="star" onClick={() => go('recs')}>Recommendations</Button>
      </div>

      <div className="two-grid">
        {/* recent imports */}
        <Card pad={false} style={{ gridColumn: 'span 1' }}>
          <div style={{ padding: '18px 20px 12px' }}><CardHead title="Recent imports" icon="upload" action={<Button size="sm" variant="ghost" onClick={() => go('pipeline')}>Pipeline</Button>} /></div>
          <div style={{ padding: '0 12px 12px' }}><DataTable columns={importCols} rows={window.WH_IMPORTS} rowKey="id" /></div>
        </Card>

        {/* data quality */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardHead title="Data quality" icon="target" />
          <div className="col" style={{ gap: 14 }}>
            {window.WH_QUALITY.map(q => (
              <div key={q.label} className="row gap3">
                <span className="t2" style={{ width: 150, fontSize: 13 }}>{q.label}</span>
                <div className="grow"><div className="progress" style={{ height: 6 }}><div className="bar-anim" style={{ height: '100%', width: `${q.value * 100}%`, background: q.value >= 0.9 ? 'var(--green)' : q.value >= 0.7 ? 'var(--amber)' : 'var(--warning)', borderRadius: 999 }} /></div></div>
                <span className="mono tnum" style={{ width: 38, textAlign: 'right', fontSize: 12.5, color: 'var(--text)' }}>{Math.round(q.value * 100)}%</span>
              </div>
            ))}
          </div>
          <hr className="divider" style={{ margin: '18px 0 14px' }} />
          <div className="row between">
            <div><div className="eyebrow">Pending analysis</div><div className="stat" style={{ fontSize: 22, marginTop: 4 }}>3,481 <span className="t3" style={{ fontSize: 13 }}>positions</span></div></div>
            <Button size="sm" variant="outline" icon="bolt" onClick={() => go('stockfish')}>Engine queue</Button>
          </div>
        </Card>
      </div>

      {/* elite trends */}
      <Card pad={false}>
        <div style={{ padding: '18px 20px 12px' }}><CardHead title="Recent elite trends" icon="chart" action={<Button size="sm" variant="ghost" onClick={() => go('openings')}>All openings</Button>} /></div>
        <div style={{ padding: '0 12px 14px' }}>
          <DataTable rowKey="eco" rows={window.WH_TRENDS} columns={[
            { key: 'eco', label: 'ECO', render: r => <EcoBadge eco={r.eco} /> },
            { key: 'name', label: 'Opening', render: r => <span className="nm">{r.name}</span> },
            { key: 'games', label: 'Games', align: 'right', render: r => <span className="mono tnum">{r.games}</span> },
            { key: 'whiteScore', label: 'White score', align: 'right', render: r => <span className="mono tnum">{Math.round(r.whiteScore * 100)}%</span> },
            { key: 'trend', label: 'Trend (Q)', align: 'right', render: r => <span className="mono tnum" style={{ color: r.trend > 0 ? 'var(--green)' : 'var(--red)' }}>{r.trend > 0 ? '+' : ''}{r.trend}%</span> },
          ]} />
        </div>
      </Card>

      {/* coverage heatmap */}
      <Card style={{ overflowX: 'auto' }}>
        <CardHead title="Data coverage · imports per week (12 mo)" icon="flame"
          action={<div className="row gap2" style={{ fontSize: 11 }}><span className="t3">Less</span>{[0,1,2,3,4].map(l => <span key={l} className={`heat-cell ${l ? 'l' + l : ''}`} />)}<span className="t3">More</span></div>} />
        <Heatmap weeks={window.ACTIVITY} />
      </Card>
    </div>
  );
}

/* ---------------- Games Browser ---------------- */
function GamesBrowser({ openGame }) {
  const [collapsed, setCollapsed] = whS1(false);
  const [sort, setSort] = whS1({ key: 'date', dir: 'desc' });
  const [page, setPage] = whS1(0);
  const [sel, setSel] = whS1(null);
  const [q, setQ] = whS1('');
  const [minElo, setMinElo] = whS1(2600);
  const [results, setResults] = whS1({ '1-0': true, '0-1': true, '½-½': true });
  const [ecoFam, setEcoFam] = whS1('all');
  const [analyzedOnly, setAnalyzedOnly] = whS1(false);

  const PER = 50;
  const filtered = whM1(() => {
    let rows = window.WH_GAMES.filter(g =>
      (g.white + g.black).toLowerCase().includes(q.toLowerCase()) &&
      Math.max(g.whiteElo, g.blackElo) >= minElo &&
      results[g.result] &&
      (ecoFam === 'all' || g.eco[0] === ecoFam) &&
      (!analyzedOnly || g.analysis === 'analyzed')
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      return (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir;
    });
    return rows;
  }, [q, minElo, results, ecoFam, analyzedOnly, sort]);

  const pageRows = filtered.slice(page * PER, page * PER + PER);
  const activeChips = [];
  if (q) activeChips.push({ label: `“${q}”`, clear: () => setQ('') });
  if (minElo > 2600) activeChips.push({ label: `≥ ${minElo}`, clear: () => setMinElo(2600) });
  if (ecoFam !== 'all') activeChips.push({ label: `ECO ${ecoFam}`, clear: () => setEcoFam('all') });
  if (analyzedOnly) activeChips.push({ label: 'Analyzed only', clear: () => setAnalyzedOnly(false) });
  Object.keys(results).filter(k => !results[k]).forEach(k => activeChips.push({ label: `no ${k}`, clear: () => setResults(r => ({ ...r, [k]: true })) }));

  const cols = [
    { key: 'date', label: 'Date', sortable: true, w: 92, render: r => <span className="mono tnum t3">{r.date.slice(5)}</span> },
    { key: 'white', label: 'White', sortable: true, render: r => <span className="nm">{r.white}</span> },
    { key: 'whiteElo', label: 'WElo', align: 'right', sortable: true, w: 56, render: r => <span className="mono tnum">{r.whiteElo}</span> },
    { key: 'black', label: 'Black', sortable: true, render: r => <span className="nm">{r.black}</span> },
    { key: 'blackElo', label: 'BElo', align: 'right', sortable: true, w: 56, render: r => <span className="mono tnum">{r.blackElo}</span> },
    { key: 'result', label: 'Res', align: 'center', w: 56, render: r => <ResultBadge result={r.result} /> },
    { key: 'eco', label: 'ECO', sortable: true, w: 60, render: r => <EcoBadge eco={r.eco} /> },
    { key: 'opening', label: 'Opening', render: r => <span style={{ color: 'var(--text-2)' }}>{r.opening}</span> },
    { key: 'moveCount', label: 'Mv', align: 'right', sortable: true, w: 48, render: r => <span className="mono tnum t3">{r.moveCount}</span> },
    { key: 'analysis', label: 'Analysis', w: 110, render: r => <StatusBadge status={r.analysis} small /> },
  ];

  return (
    <div className={['wh-layout', collapsed && 'collapsed'].filter(Boolean).join(' ')}>
      {/* filter panel */}
      {!collapsed && (
        <div className="filter-panel fade-in">
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="filter-label" style={{ margin: 0 }}>Filters</span>
            <button className="t3" onClick={() => setCollapsed(true)} aria-label="Collapse"><Icon name="prev" size={16} /></button>
          </div>
          <div className="filter-group">
            <div className="filter-label">Player</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={14} /></span>
              <input className="input" style={{ height: 34, paddingLeft: 32, fontSize: 12.5 }} placeholder="Search name…" value={q} onChange={e => { setQ(e.target.value); setPage(0); }} />
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Min rating · {minElo}</div>
            <input type="range" className="range" min="2600" max="2850" step="10" value={minElo} onChange={e => { setMinElo(+e.target.value); setPage(0); }} style={{ width: '100%' }} />
          </div>
          <div className="filter-group">
            <div className="filter-label">Result</div>
            {[['1-0', 'White wins'], ['0-1', 'Black wins'], ['½-½', 'Draw']].map(([k, l]) => (
              <label key={k} className="mini-check" onClick={() => { setResults(r => ({ ...r, [k]: !r[k] })); setPage(0); }}>
                <span className={['cbox', results[k] && 'on'].filter(Boolean).join(' ')}>{results[k] && <Icon name="check" size={11} strokeWidth={3} />}</span>{l}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <div className="filter-label">ECO family</div>
            <div className="seg" style={{ width: '100%' }}>{['all','A','B','C','D','E'].map(g => <button key={g} className={ecoFam === g ? 'on' : ''} style={{ flex: 1, padding: 0 }} onClick={() => { setEcoFam(g); setPage(0); }}>{g === 'all' ? 'All' : g}</button>)}</div>
          </div>
          <div className="filter-group">
            <label className="mini-check" onClick={() => { setAnalyzedOnly(a => !a); setPage(0); }}>
              <span className={['cbox', analyzedOnly && 'on'].filter(Boolean).join(' ')}>{analyzedOnly && <Icon name="check" size={11} strokeWidth={3} />}</span>Has Stockfish analysis
            </label>
          </div>
        </div>
      )}

      {/* table area */}
      <div className="col" style={{ gap: 12, minWidth: 0 }}>
        <div className="row between wrap gap2">
          <div className="row gap2 wrap" style={{ alignItems: 'center' }}>
            {collapsed && <Button size="sm" variant="outline" icon="filter" onClick={() => setCollapsed(false)}>Filters</Button>}
            <span className="t2" style={{ fontSize: 13 }}><span className="mono tnum amber" style={{ fontWeight: 700 }}>{filtered.length.toLocaleString()}</span> games</span>
            {activeChips.map((c, i) => <FilterChip key={i} label={c.label} onClear={c.clear} />)}
            {activeChips.length > 0 && <button className="t3" style={{ fontSize: 12, fontWeight: 600 }} onClick={() => { setQ(''); setMinElo(2600); setEcoFam('all'); setAnalyzedOnly(false); setResults({ '1-0': true, '0-1': true, '½-½': true }); }}>Clear all</button>}
          </div>
          <Button size="sm" variant="outline" icon="upload">Export view</Button>
        </div>

        <DataTable columns={cols} rows={pageRows} sort={sort} setSort={setSort} selectedId={sel}
          onRow={r => { setSel(r.id); openGame(r.id); }} maxHeight={620} />

        <div className="dt-foot">
          <span className="t3" style={{ fontSize: 12.5 }}>Showing {filtered.length ? page * PER + 1 : 0}–{Math.min((page + 1) * PER, filtered.length)} of {filtered.length.toLocaleString()}</span>
          <div className="row gap2">
            <Button size="sm" variant="outline" icon="prev" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</Button>
            <span className="mono tnum t2" style={{ fontSize: 12.5, alignSelf: 'center' }}>{page + 1} / {Math.max(1, Math.ceil(filtered.length / PER))}</span>
            <Button size="sm" variant="outline" iconRight="next" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PER >= filtered.length}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WarehouseHub, GamesBrowser });
