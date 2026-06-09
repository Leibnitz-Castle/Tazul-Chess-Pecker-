/* ============================================================
   Tazul Chess — Practice Hub (set list) + Create Set wizard
   ============================================================ */
const { useState: uS2 } = React;

function statusBadge(s) {
  if (s.status === 'completed') return <Badge variant="green" dot>Completed</Badge>;
  if (s.status === 'due') return <Badge variant="amber" dot>Due today</Badge>;
  return <Badge dot>Active</Badge>;
}

function SetCard({ s, go }) {
  return (
    <Card hover onClick={() => go('play', { setName: s.name })}>
      <div className="row between" style={{ marginBottom: 14 }}>
        {statusBadge(s)}
        <Badge variant="amber"><Icon name="bolt" size={11} fill />{s.ratingRange[0]}–{s.ratingRange[1]}</Badge>
      </div>
      <div className="h3" style={{ marginBottom: 6 }}>{s.name}</div>
      <div className="row gap2 wrap" style={{ marginBottom: 18 }}>
        {s.themes.map(t => <span key={t} className="t3" style={{ fontSize: 12 }}>#{t}</span>)}
      </div>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="mono tnum t2" style={{ fontSize: 12.5 }}>{s.done}/{s.total} solved</span>
        <span className="mono tnum amber" style={{ fontSize: 12.5 }}>{Math.round(s.done / s.total * 100)}%</span>
      </div>
      <Progress value={s.done / s.total} green={s.status === 'completed'} />
      <hr className="divider" style={{ margin: '16px 0 14px' }} />
      <div className="row between">
        <span className="row gap2 t3" style={{ fontSize: 12 }}><Icon name="refresh" size={13} /> Cycle {s.cycle}</span>
        <span className="row gap2 t3" style={{ fontSize: 12 }}><Icon name="clock" size={13} /> {s.due}</span>
        {s.accuracy != null && <span className="row gap2 t3" style={{ fontSize: 12 }}><Icon name="target" size={13} /> {Math.round(s.accuracy * 100)}%</span>}
      </div>
    </Card>
  );
}

function PracticeHub({ go, openCreate }) {
  const [status, setStatus] = uS2('all');
  const [theme, setTheme] = uS2('All themes');
  const [empty, setEmpty] = uS2(false);
  const sets = window.SETS.filter(s => status === 'all' || s.status === status)
    .filter(s => theme === 'All themes' || s.themes.includes(theme));

  return (
    <div className="page page-wide fade-in">
      <div className="row between wrap gap3" style={{ marginBottom: 22 }}>
        <div>
          <h1 className="h1">Practice Hub</h1>
          <p className="t2" style={{ fontSize: 14, marginTop: 4 }}>Your spaced-repetition training sets.</p>
        </div>
        <div className="seg">
          <button className={empty ? '' : 'on'} onClick={() => setEmpty(false)}>Sets</button>
          <button className={empty ? 'on' : ''} onClick={() => setEmpty(true)}>Empty state</button>
        </div>
      </div>

      {/* filter bar */}
      {!empty && (
        <div className="row between wrap gap3" style={{ marginBottom: 20 }}>
          <div className="seg">
            {[['all', 'All'], ['active', 'Active'], ['due', 'Due'], ['completed', 'Completed']].map(([k, l]) => (
              <button key={k} className={status === k ? 'on' : ''} onClick={() => setStatus(k)}>{l}</button>
            ))}
          </div>
          <div className="row gap3">
            <div className="row gap2" style={{ position: 'relative' }}>
              <select className="input" style={{ height: 36, width: 160, appearance: 'none', paddingRight: 32 }} value={theme} onChange={e => setTheme(e.target.value)}>
                {['All themes', ...window.THEMES].map(t => <option key={t}>{t}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, color: 'var(--text-3)', pointerEvents: 'none' }}><Icon name="chevDown" size={15} /></span>
            </div>
            <Button variant="outline" size="sm" icon="filter">Rating</Button>
          </div>
        </div>
      )}

      {empty ? (
        <Card style={{ padding: '64px 32px', textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
          <div style={{ width: 120, margin: '0 auto 24px', opacity: .9 }}>
            <ChessBoard fen="8/8/8/3N4/8/8/8/8 w - - 0 1" interactive={false} showCoords={false} />
          </div>
          <div className="h2" style={{ marginBottom: 8 }}>No sets yet</div>
          <p className="t2" style={{ fontSize: 14, marginBottom: 24, maxWidth: 320, marginInline: 'auto' }}>
            Create your first training set and start drilling the patterns that matter to your game.
          </p>
          <Button variant="amber" icon="plus" onClick={openCreate}>Create your first set</Button>
        </Card>
      ) : (
        <div className="set-grid stagger">
          {sets.map(s => <SetCard key={s.id} s={s} go={go} />)}
        </div>
      )}

      <button className="fab" onClick={openCreate}><Icon name="plus" size={18} /> Create Set</button>
    </div>
  );
}

/* ---------------- Create Set wizard ---------------- */
const SOURCES = [
  { id: 'lichess', icon: 'lichess', title: 'Lichess Puzzles', body: 'Pull from 2.3M rated puzzles, filtered by theme & rating.' },
  { id: 'pgn', icon: 'upload', title: 'Import PGN', body: 'Upload your own games — we extract the tactical moments.' },
  { id: 'elite', icon: 'warehouse', title: 'From Elite Positions', body: 'Mined from 500k games by 2400+ players.' },
];

function CreateSet({ onClose, go }) {
  const [step, setStep] = uS2(0);
  const [source, setSource] = uS2('lichess');
  const [themes, setThemes] = uS2(['Fork']);
  const [range, setRange] = uS2([1200, 1600]);
  const [size, setSize] = uS2(60);
  const [name, setName] = uS2('');
  const [creating, setCreating] = uS2(false);

  const steps = ['Source', 'Themes', 'Rating', 'Size & name', 'Confirm'];
  const toggleTheme = t => setThemes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => step === 0 ? onClose() : setStep(s => s - 1);
  const create = () => { setCreating(true); setTimeout(() => go('setcomplete'), 1200); };

  const canNext = step === 1 ? themes.length > 0 : true;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(6,6,8,.82)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20 }} onClick={onClose}>
      <Card style={{ width: 'min(680px, 100%)', maxHeight: '90vh', overflow: 'auto', padding: 0 }} className="fade-up" onClick={e => e.stopPropagation()}>
        {/* header w/ progress */}
        <div style={{ padding: '22px 26px 0' }}>
          <div className="row between" style={{ marginBottom: 18 }}>
            <div className="row gap3"><Icon name="plus" size={18} className="amber" /><span className="h3">Create Training Set</span></div>
            <button className="t3" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div className="row gap2" style={{ marginBottom: 8 }}>
            {steps.map((_, i) => (
              <div key={i} className="grow" style={{ height: 4, borderRadius: 999, background: i <= step ? 'var(--amber)' : 'var(--surface-2)', transition: 'background .3s' }} />
            ))}
          </div>
          <div className="row between" style={{ marginBottom: 4 }}>
            <span className="eyebrow">Step {step + 1} of 5</span>
            <span className="eyebrow amber">{steps[step]}</span>
          </div>
        </div>

        <div style={{ padding: '18px 26px 26px', minHeight: 280 }}>
          {step === 0 && (
            <div className="col gap3 fade-in">
              <div className="field-label">Where should the puzzles come from?</div>
              {SOURCES.map(s => (
                <button key={s.id} onClick={() => setSource(s.id)} className="card" style={{ padding: 16, textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center', borderColor: source === s.id ? 'var(--amber)' : undefined, background: source === s.id ? 'var(--amber-ghost)' : undefined }}>
                  <span style={{ width: 40, height: 40, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: source === s.id ? 'var(--amber)' : 'var(--text-2)', flexShrink: 0 }}><Icon name={s.icon} size={19} /></span>
                  <div className="grow"><div style={{ fontWeight: 650, fontSize: 14.5 }}>{s.title}</div><div className="t3" style={{ fontSize: 12.5 }}>{s.body}</div></div>
                  <span style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${source === s.id ? 'var(--amber)' : 'var(--line)'}`, display: 'grid', placeItems: 'center' }}>
                    {source === s.id && <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--amber)' }} />}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <div className="field-label">Select tactical themes <span className="t3">({themes.length} selected)</span></div>
              <div className="row gap2 wrap">
                {window.THEMES.map(t => <Chip key={t} active={themes.includes(t)} onClick={() => toggleTheme(t)}>{t}</Chip>)}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="field-label">Rating range</div>
              <div className="row between" style={{ marginBottom: 20 }}>
                <div><div className="stat amber" style={{ fontSize: 28 }} >{range[0]}</div><div className="eyebrow">min</div></div>
                <div className="t3">—</div>
                <div className="text-right"><div className="stat amber" style={{ fontSize: 28 }}>{range[1]}</div><div className="eyebrow">max</div></div>
              </div>
              <DualSlider min={400} max={3000} step={50} value={range} onChange={setRange} />
              <div className="row between" style={{ marginTop: 8 }}><span className="t3 mono" style={{ fontSize: 11 }}>400</span><span className="t3 mono" style={{ fontSize: 11 }}>3000</span></div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in col" style={{ gap: 22 }}>
              <div>
                <div className="field-label">Set size <span className="amber mono">{size} puzzles</span></div>
                <input type="range" min="10" max="500" step="10" value={size} onChange={e => setSize(+e.target.value)} className="range" style={{ width: '100%' }} />
                <div className="row between"><span className="t3 mono" style={{ fontSize: 11 }}>10</span><span className="t3 mono" style={{ fontSize: 11 }}>500</span></div>
              </div>
              <div>
                <label className="field-label">Set name</label>
                <input className="input" placeholder="e.g. Knight Forks — Core" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in">
              <div className="field-label">Review your set</div>
              <Card style={{ background: 'var(--bg-2)' }}>
                {[['Name', name || 'Untitled set'], ['Source', SOURCES.find(s => s.id === source).title],
                  ['Themes', themes.join(', ')], ['Rating', `${range[0]}–${range[1]}`], ['Size', `${size} puzzles`]].map(([k, v]) => (
                  <div key={k} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <span className="t3" style={{ fontSize: 13 }}>{k}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="row between" style={{ padding: '16px 26px', borderTop: '1px solid var(--line-soft)' }}>
          <Button variant="ghost" icon="arrowLeft" onClick={back}>{step === 0 ? 'Cancel' : 'Back'}</Button>
          {step < 4
            ? <Button variant="amber" iconRight="arrowRight" onClick={next} disabled={!canNext}>Continue</Button>
            : <Button variant="amber" icon={creating ? undefined : 'check'} loading={creating} onClick={create}>Create set</Button>}
        </div>
      </Card>
    </div>
  );
}

/* dual-thumb slider */
function DualSlider({ min, max, step, value, onChange }) {
  const pct = v => ((v - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 28 }}>
      <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 5, borderRadius: 999, background: 'var(--surface-2)' }} />
      <div style={{ position: 'absolute', top: 12, height: 5, borderRadius: 999, background: 'linear-gradient(90deg,var(--amber),var(--amber-bright))', left: pct(value[0]) + '%', right: (100 - pct(value[1])) + '%' }} />
      <input type="range" min={min} max={max} step={step} value={value[0]} onChange={e => onChange([Math.min(+e.target.value, value[1] - step), value[1]])} className="range range-overlay" />
      <input type="range" min={min} max={max} step={step} value={value[1]} onChange={e => onChange([value[0], Math.max(+e.target.value, value[0] + step)])} className="range range-overlay" />
    </div>
  );
}

Object.assign(window, { PracticeHub, CreateSet, SetCard });
