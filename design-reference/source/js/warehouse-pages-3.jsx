/* ============================================================
   Elite Warehouse — Player Explorer + Opening Analytics
   ============================================================ */
const { useState: whS3, useMemo: whM3 } = React;

function CountryTag({ code, size = 13 }) {
  return <span className="mono" style={{ fontSize: size, fontWeight: 700, letterSpacing: '.04em', color: 'var(--text-2)' }}>{code}</span>;
}

/* ---------------- Player Explorer ---------------- */
function PlayerExplorer({ openGame }) {
  const [q, setQ] = whS3('');
  const [sel, setSel] = whS3(null);
  const players = window.WH_PLAYERS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const player = sel ? window.WH_PLAYERS.find(p => p.id === sel) : null;

  if (player) {
    const games = window.WH_GAMES.filter(g => g.white === player.name || g.black === player.name).slice(0, 12);
    const [w, d, l] = player.wdl;
    return (
      <div className="col" style={{ gap: 20 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={() => setSel(null)}><Icon name="arrowLeft" size={14} /> All players</button>
        {/* profile header */}
        <Card style={{ background: 'linear-gradient(120deg, rgba(200,169,107,.06), var(--surface) 60%)' }}>
          <div className="row between wrap gap4">
            <div className="row gap4" style={{ alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--surface-3)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><CountryTag code={player.country} size={17} /></div>
              <div>
                <div className="row gap3" style={{ alignItems: 'center' }}><h1 className="serif-title" style={{ fontSize: 24 }}>{player.name}</h1><Badge variant="amber">{player.title}</Badge></div>
                <div className="row gap3 wrap" style={{ marginTop: 6, color: 'var(--text-2)', fontSize: 13 }}>
                  <span>{player.country}</span><span className="t3">·</span>
                  <span>Rating <span className="amber mono tnum" style={{ fontWeight: 700 }}>{player.elo}</span></span><span className="t3">·</span>
                  <span>Peak <span className="mono tnum">{player.peak}</span></span><span className="t3">·</span>
                  <span><span className="mono tnum">{player.games.toLocaleString()}</span> games</span>
                </div>
              </div>
            </div>
          </div>
          {/* WDL */}
          <div style={{ marginTop: 20 }}>
            <div className="row between" style={{ marginBottom: 8, fontSize: 12 }}>
              <span className="green">Wins {Math.round(w * 100)}%</span><span className="t3">Draws {Math.round(d * 100)}%</span><span className="red">Losses {Math.round(l * 100)}%</span>
            </div>
            <WDLBar w={w} d={d} b={l} height={10} />
          </div>
        </Card>

        <div className="two-grid">
          {/* most played openings */}
          <Card>
            <CardHead title="Most played openings" icon="openings" />
            <div className="col" style={{ gap: 14 }}>
              {player.openings.map((o, i) => (
                <div key={i} className="row between">
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{o}</span>
                  <div className="row gap3"><div className="progress" style={{ width: 120, height: 6 }}><div className="progress-bar" style={{ width: `${85 - i * 22}%` }} /></div><span className="mono tnum t3" style={{ fontSize: 12, width: 30, textAlign: 'right' }}>{40 - i * 9}%</span></div>
                </div>
              ))}
            </div>
          </Card>
          {/* performance by opponent rating */}
          <Card>
            <CardHead title="Performance by opponent rating" icon="chart" />
            {[['2600–2650', 0.64], ['2650–2700', 0.58], ['2700–2750', 0.53], ['2750+', 0.47]].map(([band, score]) => (
              <BarRow key={band} label={band} value={score} />
            ))}
          </Card>
        </div>

        {/* games table */}
        <Card pad={false}>
          <div style={{ padding: '18px 20px 10px' }}><CardHead title={`Games · ${player.name}`} icon="warehouse" /></div>
          <div style={{ padding: '0 12px 12px' }}>
            <DataTable rowKey="id" onRow={r => openGame(r.id)} rows={games} columns={[
              { key: 'date', label: 'Date', render: r => <span className="mono tnum t3">{r.date.slice(5)}</span> },
              { key: 'opp', label: 'Opponent', render: r => <span className="nm">{r.white === player.name ? r.black : r.white}</span> },
              { key: 'col', label: 'Color', render: r => <span className="t3">{r.white === player.name ? 'White' : 'Black'}</span> },
              { key: 'result', label: 'Result', align: 'center', render: r => <ResultBadge result={r.result} /> },
              { key: 'eco', label: 'ECO', render: r => <EcoBadge eco={r.eco} /> },
              { key: 'event', label: 'Event', render: r => <span className="t2">{r.event}</span> },
            ]} />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="col" style={{ gap: 18 }}>
      <div style={{ position: 'relative', maxWidth: 420 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={16} /></span>
        <input className="input" style={{ paddingLeft: 38 }} placeholder="Search elite players…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="player-grid stagger">
        {players.map(p => (
          <Card key={p.id} hover onClick={() => setSel(p.id)}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="row gap3" style={{ alignItems: 'center' }}>
                <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}><CountryTag code={p.country} size={11} /></span>
                <Badge variant="amber" style={{ height: 20 }}>{p.title}</Badge>
              </div>
              <span className="mono tnum amber" style={{ fontWeight: 700, fontSize: 15 }}>{p.elo}</span>
            </div>
            <div className="h3" style={{ marginBottom: 4 }}>{p.name}</div>
            <div className="t3" style={{ fontSize: 12, marginBottom: 14 }}>{p.country} · <span className="mono tnum">{p.games.toLocaleString()}</span> games in DB</div>
            <div className="row gap2 wrap">{p.openings.slice(0, 2).map(o => <span key={o} className="badge" style={{ height: 20, fontSize: 10.5 }}>{o}</span>)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Opening Analytics ---------------- */
function OpeningAnalytics() {
  const [selLine, setSelLine] = whS3(null);
  const [selEco, setSelEco] = whS3('B90');
  const stats = window.WH_OPENING_STATS;
  const donutData = stats.slice(0, 6).map((s, i) => ({
    label: s.name, value: s.games,
    color: ['#C8A96B', '#6E8BAB', '#4E8A62', '#8D6E3E', '#A4795B', '#C48A41'][i],
  }));
  const top = stats.reduce((a, b) => b.games > a.games ? b : a);
  const bestWhite = stats.reduce((a, b) => b.white > a.white ? b : a);
  const decisive = stats.reduce((a, b) => (1 - b.draw) > (1 - a.draw) ? b : a);
  const theory = stats.reduce((a, b) => b.avg > a.avg ? b : a);

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* top row metrics */}
      <div className="wh-metrics-4 stagger">
        <Metric label="Most played" value={top.name.split(',')[0]} trendLabel={`${top.games.toLocaleString()} games`} />
        <Metric label="Highest white score" value={Math.round(bestWhite.white * 100 / (bestWhite.white + bestWhite.black) ) + '%'} trendLabel={bestWhite.name.split(',')[0]} />
        <Metric label="Most decisive" value={Math.round((1 - decisive.draw) * 100) + '%'} trendLabel={decisive.name.split(',')[0]} />
        <Metric label="Most theory-heavy" value={theory.avg + ' mv'} trendLabel={theory.name.split(',')[0]} />
      </div>

      <div className="two-grid" style={{ gridTemplateColumns: '0.8fr 1.2fr' }}>
        {/* donut */}
        <Card>
          <CardHead title="ECO distribution" icon="chart" />
          <div className="row gap4" style={{ alignItems: 'center' }}>
            <Donut data={donutData} />
            <div className="col" style={{ gap: 8, minWidth: 0 }}>
              {donutData.map(d => (
                <div key={d.label} className="row gap2" style={{ fontSize: 12 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span className="t2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label.split(',')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* timeline */}
        <Card>
          <CardHead title="Top openings over time · share %" icon="chart"
            action={<div className="row gap3">{window.WH_TIMELINE.series.map(s => (
              <span key={s.name} className="legend-row" onMouseEnter={() => setSelLine(s.name)} onMouseLeave={() => setSelLine(null)}>
                <span className="legend-sw" style={{ background: s.color }} />{s.name}</span>
            ))}</div>} />
          <TimelineChart {...window.WH_TIMELINE} selected={selLine} />
        </Card>
      </div>

      {/* comparison table */}
      <Card pad={false}>
        <div style={{ padding: '18px 20px 10px' }}><CardHead title="Opening performance comparison" icon="warehouse" /></div>
        <div style={{ padding: '0 12px 14px' }}>
          <DataTable rowKey="eco" selectedId={selEco} onRow={r => setSelEco(r.eco)} rows={stats} columns={[
            { key: 'eco', label: 'ECO', render: r => <EcoBadge eco={r.eco} /> },
            { key: 'name', label: 'Opening', render: r => <span className="nm">{r.name}</span> },
            { key: 'games', label: 'Games', align: 'right', render: r => <span className="mono tnum">{r.games.toLocaleString()}</span> },
            { key: 'wdl', label: 'W / D / B', w: 150, render: r => <div style={{ width: 130 }}><WDLBar w={r.white} d={r.draw} b={r.black} /></div> },
            { key: 'white', label: 'White %', align: 'right', render: r => <span className="mono tnum green">{Math.round(r.white * 100)}</span> },
            { key: 'draw', label: 'Draw %', align: 'right', render: r => <span className="mono tnum t3">{Math.round(r.draw * 100)}</span> },
            { key: 'black', label: 'Black %', align: 'right', render: r => <span className="mono tnum red">{Math.round(r.black * 100)}</span> },
            { key: 'avg', label: 'Avg mv', align: 'right', render: r => <span className="mono tnum">{r.avg}</span> },
            { key: 'trend', label: 'Trend', align: 'right', render: r => <span className="mono tnum" style={{ color: r.trend > 0 ? 'var(--green)' : 'var(--red)' }}>{r.trend > 0 ? '+' : ''}{r.trend}%</span> },
          ]} />
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { PlayerExplorer, OpeningAnalytics });
