/* ============================================================
   Elite Warehouse — analytics components
   ============================================================ */
const { useState: wS, useMemo: wM, useRef: wR, useEffect: wE } = React;

/* ---------------- Module shell (tabs) ---------------- */
const WH_TABS = [
  { id: 'hub', label: 'Hub' },
  { id: 'games', label: 'Games' },
  { id: 'players', label: 'Players' },
  { id: 'openings', label: 'Openings' },
  { id: 'stockfish', label: 'Engine' },
  { id: 'recs', label: 'Recommendations' },
  { id: 'export', label: 'Export' },
  { id: 'pipeline', label: 'Pipeline' },
];
function WarehouseShell({ tab, setTab, action, children }) {
  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between wrap gap3" style={{ marginBottom: 16, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="row gap2 wrap" style={{ alignItems: 'center', marginBottom: 8, minHeight: 30 }}>
            <span style={{ color: 'var(--amber)' }}><Icon name="warehouse" size={20} /></span>
            <h1 className="serif-title" style={{ fontSize: 24 }}>Elite Chess Data Warehouse</h1>
            <span className="badge badge-amber" style={{ height: 20, fontSize: 10.5 }}>+2600</span>
          </div>
          <p className="t2" style={{ fontSize: 13.5 }}>Analyze elite +2600 games and turn them into study material.</p>
        </div>
        {action}
      </div>
      <div className="otabs" style={{ marginBottom: 22 }}>
        {WH_TABS.map(t => <button key={t.id} className={['otab', tab === t.id && 'on'].filter(Boolean).join(' ')} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      {children}
    </div>
  );
}

/* ---------------- Metric card (compact) ---------------- */
function Metric({ label, value, trend, trendLabel, mono }) {
  const up = trend > 0, flat = trend === 0 || trend == null;
  return (
    <div className="metric">
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div className={['stat', mono && 'mono'].filter(Boolean).join(' ')} style={{ fontSize: 26, letterSpacing: '-0.02em' }}>{value}</div>
      {!flat && (
        <div className="row gap2" style={{ marginTop: 6, fontSize: 12, color: up ? 'var(--green)' : 'var(--red)' }}>
          <Icon name="arrowRight" size={12} style={{ transform: up ? 'rotate(-45deg)' : 'rotate(45deg)' }} />
          <span className="mono tnum">{up ? '+' : ''}{trend}%</span><span className="t3">{trendLabel}</span>
        </div>
      )}
      {flat && trendLabel && <div className="t3" style={{ fontSize: 12, marginTop: 6 }}>{trendLabel}</div>}
    </div>
  );
}

/* ---------------- Status badge ---------------- */
const WH_STATUS = {
  done:       { c: 'var(--green)',  bg: 'var(--green-ghost)',  label: 'Done',  icon: 'check' },
  analyzed:   { c: 'var(--green)',  bg: 'var(--green-ghost)',  label: 'Analyzed', icon: 'check' },
  processing: { c: 'var(--warning)',bg: 'var(--warning-ghost)',label: 'Processing', icon: 'refresh' },
  analyzing:  { c: 'var(--warning)',bg: 'var(--warning-ghost)',label: 'Analyzing', icon: 'refresh' },
  queued:     { c: 'var(--blue)',   bg: 'rgba(110,139,171,.14)', label: 'Queued', icon: 'clock' },
  pending:    { c: 'var(--text-3)', bg: 'var(--surface-2)',    label: 'Pending', icon: 'clock' },
  failed:     { c: 'var(--red)',    bg: 'var(--red-ghost)',    label: 'Failed', icon: 'x' },
  missing:    { c: 'var(--text-3)', bg: 'var(--surface-2)',    label: 'No metadata', icon: 'x' },
};
function StatusBadge({ status, small }) {
  const s = WH_STATUS[status] || WH_STATUS.pending;
  return (
    <span className="status-badge" style={{ color: s.c, background: s.bg, borderColor: s.c + '40', fontSize: small ? 10.5 : 11.5 }}>
      <Icon name={s.icon} size={small ? 10 : 11} /> {s.label}
    </span>
  );
}

/* ---------------- Result badge (muted) ---------------- */
function ResultBadge({ result }) {
  const w = result === '1-0', b = result === '0-1';
  const color = w ? 'var(--green)' : b ? 'var(--red)' : 'var(--text-3)';
  return <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700, color, letterSpacing: '.02em' }}>{result}</span>;
}

/* ---------------- Data table ---------------- */
function DataTable({ columns, rows, sort, setSort, selectedId, onRow, rowKey = 'id', maxHeight }) {
  const sortIcon = (key) => sort && sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  return (
    <div className="dt-wrap" style={{ maxHeight }}>
      <table className="dt">
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ width: c.w, textAlign: c.align || 'left' }}
                className={c.sortable ? 'sortable' : ''} onClick={() => c.sortable && setSort && setSort(s => ({ key: c.key, dir: s && s.key === c.key && s.dir === 'asc' ? 'desc' : 'asc' }))}>
                {c.label}<span className="t3" style={{ fontSize: 9 }}>{c.sortable ? sortIcon(c.key) : ''}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r[rowKey]} className={selectedId === r[rowKey] ? 'sel' : ''} onClick={() => onRow && onRow(r)} tabIndex={onRow ? 0 : undefined}
              onKeyDown={e => onRow && e.key === 'Enter' && onRow(r)}>
              {columns.map(c => <td key={c.key} style={{ textAlign: c.align || 'left' }}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="t3" style={{ padding: 30, textAlign: 'center', fontSize: 13 }}>No rows match the current filters.</div>}
    </div>
  );
}

/* ---------------- Log panel ---------------- */
const LOG_LVL = { info: 'var(--blue)', warn: 'var(--warning)', error: 'var(--red)' };
function LogPanel({ lines, height = 240 }) {
  return (
    <div className="log-panel" style={{ height }}>
      {lines.map((l, i) => (
        <div key={i} className="log-row">
          <span className="log-time">{l.t}</span>
          <span className="log-lvl" style={{ color: LOG_LVL[l.lvl] }}>{l.lvl.toUpperCase().padEnd(5)}</span>
          <span className="log-msg">{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Eval bar (vertical) ---------------- */
function EvalBar({ cp, height }) {
  // cp in pawns; clamp to ±5 → 0..100 white share
  const clamped = Math.max(-5, Math.min(5, cp));
  const whitePct = 50 + clamped * 10;
  return (
    <div className="eval-bar" style={{ height }}>
      <div className="eval-white" style={{ height: `${whitePct}%` }} />
      <span className="eval-num" style={{ color: cp >= 0 ? '#1E1A16' : '#F2ECE3', bottom: cp >= 0 ? 4 : 'auto', top: cp >= 0 ? 'auto' : 4 }}>
        {cp >= 0 ? '+' : ''}{cp.toFixed(1)}
      </span>
    </div>
  );
}

/* ---------------- Horizontal stacked bar (W/D/B) ---------------- */
function WDLBar({ w, d, b, height = 8 }) {
  return (
    <div className="row" style={{ height, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${w * 100}%`, background: 'var(--green)' }} title={`White ${Math.round(w*100)}%`} />
      <div style={{ width: `${d * 100}%`, background: 'var(--text-3)' }} title={`Draw ${Math.round(d*100)}%`} />
      <div style={{ width: `${b * 100}%`, background: 'var(--red)' }} title={`Black ${Math.round(b*100)}%`} />
    </div>
  );
}

/* ---------------- Donut (ECO distribution) ---------------- */
function Donut({ data, size = 180, thickness = 22 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {data.map((d, i) => {
          const frac = d.value / total, len = frac * c;
          const el = <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len; return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div className="col center"><div className="stat" style={{ fontSize: 22 }}>{total.toLocaleString()}</div><div className="eyebrow">games</div></div>
      </div>
    </div>
  );
}

/* ---------------- Multi-line timeline chart ---------------- */
function TimelineChart({ labels, series, height = 200, selected }) {
  const w = 640, padL = 28, padB = 22, padT = 10;
  const all = series.flatMap(s => s.data); const max = Math.max(...all) * 1.15, min = 0;
  const x = i => padL + (i / (labels.length - 1)) * (w - padL - 8);
  const y = v => padT + (1 - (v - min) / (max - min)) * (height - padT - padB);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
      {[0, 0.5, 1].map((g, i) => { const yy = padT + g * (height - padT - padB); return <line key={i} x1={padL} y1={yy} x2={w - 8} y2={yy} stroke="var(--line-soft)" strokeWidth="1" />; })}
      {labels.map((l, i) => <text key={i} x={x(i)} y={height - 6} fill="var(--text-3)" fontSize="9.5" textAnchor="middle" className="mono">{l}</text>)}
      {series.map((s, si) => {
        const dim = selected && selected !== s.name;
        const path = s.data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
        return <g key={si} opacity={dim ? 0.25 : 1}>
          <path d={path} fill="none" stroke={s.color} strokeWidth={selected === s.name ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(s.data.length - 1)} cy={y(s.data[s.data.length - 1])} r="3" fill={s.color} />
        </g>;
      })}
    </svg>
  );
}

/* ---------------- Filter chip ---------------- */
function FilterChip({ label, onClear }) {
  return (
    <span className="filter-chip">
      {label}
      <button onClick={onClear} aria-label={`Clear ${label}`}><Icon name="x" size={12} /></button>
    </span>
  );
}

/* ---------------- Move-quality dot ---------------- */
const QUALITY = {
  best: { c: 'var(--green)', label: 'Best', sym: '!' },
  inaccuracy: { c: 'var(--warning)', label: 'Inaccuracy', sym: '?!' },
  mistake: { c: '#C76B3F', label: 'Mistake', sym: '?' },
  blunder: { c: 'var(--red)', label: 'Blunder', sym: '??' },
};

Object.assign(window, {
  WarehouseShell, WH_TABS, Metric, StatusBadge, WH_STATUS, ResultBadge, DataTable,
  LogPanel, EvalBar, WDLBar, Donut, TimelineChart, FilterChip, QUALITY,
});
