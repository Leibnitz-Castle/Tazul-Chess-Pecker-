/* ============================================================
   Tazul Chess — UI primitives, icons, charts
   ============================================================ */
const { useState, useRef, useEffect } = React;

/* ---------------- Icons (stroke, 24 viewBox) ---------------- */
const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  practice: 'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  openings: 'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5ZM18 3v16M8 7h6M8 11h6',
  warehouse: 'M3 9 12 4l9 5v11H3V9ZM7 20v-6h10v6M7 14h10',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  flame: 'M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c1 2 1 4 1 5a6 6 0 1 1-12 0c0-3 2-5 3-7 1 1 1 2 3 3 0-3-2-4 0-7Z',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  flip: 'M3 8a9 9 0 0 1 15-3l3 3M21 16a9 9 0 0 1-15 3l-3-3M21 5v4h-4M3 19v-4h4',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01',
  trophy: 'M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M10 15v4M14 15v4',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  chart: 'M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3M20 16v-7',
  chevDown: 'M6 9l6 6 6-6',
  chevRight: 'M9 6l6 6-6 6',
  star: 'M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.6 1.1-6L3.4 9.4l6-.8L12 3Z',
  link: 'M9 15l6-6M10 6l1-1a4 4 0 0 1 6 6l-1 1M14 18l-1 1a4 4 0 0 1-6-6l1-1',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z',
  lichess: 'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8M21 12a9 9 0 0 1-15 6.7L3 16M21 4v4h-4M3 20v-4h4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4-4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  puzzle: 'M9 4h6v3a2 2 0 1 0 4 0V4h1v5h-3a2 2 0 1 0 0 4h3v5h-5v-3a2 2 0 1 0-4 0v3H4v-5h3a2 2 0 1 0 0-4H4V4h5Z',
};

function Icon({ name, size = 18, fill = false, style, strokeWidth = 1.8 }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}
      fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

/* ---------------- Button ---------------- */
function Button({ variant = 'outline', size, icon, iconRight, loading, children, className = '', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', !children ? 'btn-icon' : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spinner" /> : icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} />}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 16} />}
    </button>
  );
}

/* ---------------- Card ---------------- */
function Card({ hover, pad = true, className = '', children, style, ...rest }) {
  return (
    <div className={['card', pad && 'card-pad', hover && 'card-hover', className].filter(Boolean).join(' ')} style={style} {...rest}>
      {children}
    </div>
  );
}
function CardHead({ title, icon, action }) {
  return (
    <div className="card-head">
      <div className="row gap2">
        {icon && <span style={{ color: 'var(--text-3)' }}><Icon name={icon} size={15} /></span>}
        <span className="card-title">{title}</span>
      </div>
      {action}
    </div>
  );
}

/* ---------------- Badge / Chip ---------------- */
function Badge({ variant = '', dot, children, style }) {
  return <span className={['badge', variant && `badge-${variant}`, dot && 'badge-dot'].filter(Boolean).join(' ')} style={style}>{children}</span>;
}
function Chip({ active, onClick, children }) {
  return <button className={['chip', active && 'chip-active'].filter(Boolean).join(' ')} onClick={onClick}>{children}</button>;
}

/* ---------------- Progress ---------------- */
function Progress({ value, green }) {
  return <div className="progress"><div className={['progress-bar', green && 'green'].filter(Boolean).join(' ')} style={{ width: `${Math.min(100, value * 100)}%` }} /></div>;
}

/* ---------------- Progress ring ---------------- */
function Ring({ value, size = 132, stroke = 11, children, color = 'var(--amber)' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ name = 'T', size = 36 }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>{name[0].toUpperCase()}</div>;
}

/* ---------------- Line chart (SVG) ---------------- */
function LineChart({ data, height = 120, color = 'var(--amber)' }) {
  const w = 600, pad = 6;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), height - pad - ((v - min) / range) * (height - pad * 2)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${w-pad} ${height} L${pad} ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lcg)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3.5" fill={color} />
    </svg>
  );
}

/* ---------------- Sparkline ---------------- */
function Sparkline({ data, w = 80, h = 24, color = 'var(--green)' }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h - ((v-min)/range)*h}`).join(' ');
  return <svg width={w} height={h} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ---------------- Radar chart ---------------- */
function RadarChart({ data, size = 240 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 34, n = data.length;
  const pt = (i, r) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = data.map((d, i) => pt(i, R * d.value).join(',')).join(' ');
  return (
    <svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((g, i) => (
        <polygon key={i} points={data.map((_, j) => pt(j, R * g).join(',')).join(' ')} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />; })}
      <polygon points={poly} fill="rgba(245,158,11,0.18)" stroke="var(--amber)" strokeWidth="2" />
      {data.map((d, i) => { const [x, y] = pt(i, R * d.value); return <circle key={i} cx={x} cy={y} r="3" fill="var(--amber)" />; })}
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 16);
        return <text key={i} x={x} y={y} fill="var(--text-2)" fontSize="11" fontWeight="600" textAnchor="middle" dominantBaseline="middle">{d.axis}</text>;
      })}
    </svg>
  );
}

/* ---------------- Heatmap ---------------- */
const HEAT_LABELS = ['No activity', '1–3 puzzles', '4–9 puzzles', '10–19 puzzles', '20+ puzzles'];
function Heatmap({ weeks }) {
  let gi = 0;
  return (
    <div className="heat heat-reveal">
      {weeks.map((days, w) => (
        <div key={w} style={{ display: 'grid', gridTemplateRows: 'repeat(7,1fr)', gap: 3 }}>
          {days.map((lvl, d) => {
            const i = gi++;
            return <div key={d} className={`heat-cell ${lvl ? 'l' + lvl : ''}`} style={{ '--i': i }} title={HEAT_LABELS[lvl]} />;
          })}
        </div>
      ))}
    </div>
  );
}
function MiniHeat({ cells }) {
  return (
    <div className="heat-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
      {cells.map((lvl, i) => <div key={i} className={`heat-cell ${lvl ? 'l' + lvl : ''}`} title={HEAT_LABELS[lvl]} style={{ '--i': i, width: '100%', aspectRatio: '1', height: 'auto' }} />)}
    </div>
  );
}

/* ---------------- Bar chart (horizontal, semantic) ---------------- */
function BarRow({ label, value }) {
  const tier = value >= 0.8 ? 'strong' : value >= 0.7 ? 'medium' : 'weak';
  const color = tier === 'strong' ? 'var(--green)' : tier === 'medium' ? 'var(--warning)' : 'var(--red)';
  return (
    <div className="row gap3" style={{ marginBottom: 13 }}>
      <span className="t2" style={{ width: 96, fontSize: 13 }}>{label}</span>
      <div className="grow"><div className="progress" style={{ height: 6 }}>
        <div className="bar-anim" style={{ height: '100%', width: `${value * 100}%`, background: color, borderRadius: 999 }} />
      </div></div>
      <span className="mono tnum" style={{ width: 38, textAlign: 'right', fontSize: 12.5, color }}>{Math.round(value * 100)}%</span>
    </div>
  );
}

/* ---------------- Count-up ---------------- */
function useCountUp(target, dur = 950) {
  const [v, setV] = useState(typeof target === 'number' ? 0 : target);
  useEffect(() => {
    if (typeof target !== 'number') { setV(target); return; }
    // If the tab is hidden, rAF is paused — just show the final value.
    if (typeof document !== 'undefined' && document.hidden) { setV(target); return; }
    let raf, start = null;
    const safety = setTimeout(() => setV(target), dur + 400); // guarantee final value even if rAF throttled
    const ease = p => 1 - Math.pow(1 - p, 3);
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setV(target); clearTimeout(safety); }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [target]);
  return v;
}
function CountUp({ value, format }) {
  const v = useCountUp(value);
  if (typeof v !== 'number') return v;
  return format ? format(v) : Math.round(v).toLocaleString();
}

/* ---------------- Confetti ---------------- */
function Confetti({ run }) {
  if (!run) return null;
  const colors = ['#C8A96B', '#D6B77A', '#4E8A62', '#F2ECE3', '#8D6E3E'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100, delay = Math.random() * 0.25, dur = 0.9 + Math.random() * 0.7;
        const c = colors[i % colors.length];
        return <span key={i} className="confetti-piece" style={{
          left: left + '%', background: c, borderRadius: i % 3 ? '2px' : '999px',
          animation: `confettiFall ${dur}s ${delay}s ease-in forwards`,
        }} />;
      })}
    </div>
  );
}

/* ---------------- Stat ---------------- */
function Stat({ label, value, sub, accent, primary, icon }) {
  return (
    <Card style={primary ? { background: 'linear-gradient(150deg, rgba(200,169,107,.07), var(--surface))', borderColor: 'rgba(200,169,107,.28)' } : undefined}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="eyebrow" style={primary ? { color: 'var(--amber)' } : undefined}>{label}</div>
        {icon && <span style={{ color: primary ? 'var(--amber)' : 'var(--text-3)' }}><Icon name={icon} size={primary ? 17 : 15} /></span>}
      </div>
      <div className="stat" style={{ fontSize: primary ? 40 : 30, marginTop: primary ? 12 : 10, color: (accent || primary) ? 'var(--amber)' : 'var(--text)' }}>{value}</div>
      {sub && <div className="t3" style={{ fontSize: 12.5, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

Object.assign(window, {
  Icon, Button, Card, CardHead, Badge, Chip, Progress, Ring, Avatar,
  LineChart, Sparkline, RadarChart, Heatmap, MiniHeat, BarRow, Confetti, Stat, CountUp,
});
