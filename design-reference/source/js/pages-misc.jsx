/* ============================================================
   Tazul Chess — Set Complete · Profile · Component Library
   ============================================================ */
const { useState: uS4, useEffect: uE4 } = React;

/* ---------------- Set Complete ---------------- */
function SetComplete({ go }) {
  const [confetti, setConfetti] = uS4(true);
  uE4(() => { const t = setTimeout(() => setConfetti(false), 2600); return () => clearTimeout(t); }, []);
  return (
    <div className="page fade-in" style={{ maxWidth: 920, position: 'relative' }}>
      <Confetti run={confetti} />
      <div className="col center" style={{ textAlign: 'center', margin: '20px 0 30px' }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--amber-ghost)', color: 'var(--amber)', display: 'grid', placeItems: 'center', marginBottom: 18, boxShadow: '0 0 40px rgba(245,158,11,.3)' }}>
          <Icon name="trophy" size={32} />
        </span>
        <div className="eyebrow amber">Knight Forks — Core · Cycle 2</div>
        <h1 className="display" style={{ fontSize: 44, marginTop: 8 }}>Set Complete!</h1>
        <p className="t2" style={{ fontSize: 15, marginTop: 8 }}>Strong session. Your next review is scheduled.</p>
      </div>

      <div className="three-grid stagger" style={{ marginBottom: 22 }}>
        <Stat label="Time taken" value="14:22" sub="avg 16s / puzzle" icon="clock" />
        <Stat label="Correct" value="83%" sub="66 of 80" primary icon="target" />
        <Stat label="Mastered" value="71" sub="of 80 puzzles" icon="trophy" />
      </div>

      <div className="two-grid" style={{ marginBottom: 26 }}>
        <Card>
          <CardHead title="Performance by theme" icon="chart" />
          <div className="row center"><RadarChart data={window.RADAR} size={250} /></div>
        </Card>
        <Card className="col" style={{ justifyContent: 'space-between' }}>
          <div>
            <CardHead title="Next review" icon="refresh" />
            <div className="stat amber" style={{ fontSize: 30 }}>in 4 days</div>
            <div className="t3" style={{ fontSize: 12.5, marginTop: 4 }}>Jun 11 · spaced-repetition schedule</div>
            <hr className="divider" style={{ margin: '18px 0' }} />
            <div className="col" style={{ gap: 12 }}>
              {[['First try', '58 / 80'], ['Retries', '8'], ['Solution shown', '6'], ['Rating gain', '+24']].map(([k, v]) => (
                <div key={k} className="row between"><span className="t3" style={{ fontSize: 13 }}>{k}</span><span className="mono tnum" style={{ fontSize: 13, fontWeight: 600 }}>{v}</span></div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="row gap3 wrap">
        <Button variant="amber" icon="target" onClick={() => go('play')}>Practice weak puzzles</Button>
        <Button variant="outline" icon="refresh" onClick={() => go('play')}>Start next cycle</Button>
        <Button variant="ghost" icon="home" onClick={() => go('dashboard')}>Back to dashboard</Button>
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function Profile({ go }) {
  const u = window.USER;
  return (
    <div className="page page-wide fade-in">
      {/* header */}
      <Card style={{ marginBottom: 22, padding: 26, background: 'linear-gradient(120deg, rgba(200,169,107,.06), var(--surface) 60%)', borderColor: 'rgba(200,169,107,.16)' }}>
        <div className="row between wrap gap4">
          <div className="row gap4" style={{ alignItems: 'center' }}>
            <Avatar name={u.display} size={74} />
            <div className="col" style={{ gap: 8 }}>
              <div className="row gap3" style={{ alignItems: 'center' }}>
                <h1 className="h1">{u.display}</h1>
                <Badge variant="amber">{u.title}</Badge>
                <span className="streak-badge" style={{ height: 24 }}><Icon name="flame" size={12} fill />{u.streak}d</span>
              </div>
              <div className="row gap3 wrap" style={{ alignItems: 'center', color: 'var(--text-2)' }}>
                <span className="row gap2" style={{ fontSize: 13 }}><Icon name="lichess" size={14} /> {u.lichess}</span>
                <span className="t3">·</span>
                <span style={{ fontSize: 13 }}>Lichess rating <span className="amber mono" style={{ fontWeight: 700 }}>{u.rating}</span></span>
                <span className="t3">·</span>
                <span style={{ fontSize: 13 }}>Puzzle ELO <span className="amber mono" style={{ fontWeight: 700 }}>{u.puzzleElo}</span></span>
              </div>
            </div>
          </div>
          <Button variant="ghost" icon="settings" onClick={() => go('library')}>Settings</Button>
        </div>
      </Card>

      {/* stat grid */}
      <div className="four-grid stagger" style={{ marginBottom: 22 }}>
        <Stat label="Puzzle ELO" value={<CountUp value={u.puzzleElo} />} primary icon="bolt" sub="+107 this month" />
        <Stat label="Total solved" value={(u.totalSolved / 1000).toFixed(1) + 'k'} icon="puzzle" sub={u.totalSolved.toLocaleString()} />
        <Stat label="Longest streak" value={u.longest + 'd'} icon="flame" />
        <Stat label="Best accuracy" value={Math.round(u.bestAccuracy * 100) + '%'} icon="target" />
      </div>

      {/* activity heatmap */}
      <Card style={{ marginBottom: 22, overflowX: 'auto' }}>
        <CardHead title="Activity · last 12 months" icon="flame"
          action={<div className="row gap2" style={{ fontSize: 11 }}><span className="t3">Less</span>
            {[0, 1, 2, 3, 4].map(l => <span key={l} className={`heat-cell ${l ? 'l' + l : ''}`} />)}<span className="t3">More</span></div>} />
        <Heatmap weeks={window.ACTIVITY} />
      </Card>

      <div className="two-grid">
        {/* progress by theme */}
        <Card>
          <CardHead title="Accuracy by theme" icon="chart" />
          {window.THEME_ACCURACY.map(t => <BarRow key={t.theme} label={t.theme} value={t.acc} danger={t.acc < 0.7} />)}
        </Card>

        {/* recent sessions */}
        <Card pad={false}>
          <div style={{ padding: '24px 24px 8px' }}><CardHead title="Recent sessions" icon="clock" /></div>
          <div>
            {window.RECENT_SESSIONS.map((s, i) => (
              <div key={i} className="row between" style={{ padding: '14px 24px', borderTop: '1px solid var(--line-soft)' }}>
                <div className="row gap3">
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: s.delta >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.set}</div>
                    <div className="t3" style={{ fontSize: 12 }}>{s.date} · {s.solved} solved · {Math.round(s.acc * 100)}%</div>
                  </div>
                </div>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700, color: s.delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {s.delta >= 0 ? '+' : ''}{s.delta}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Component Library / Design tokens ---------------- */
function Swatch({ name, varName, hex }) {
  return (
    <div className="col" style={{ gap: 6 }}>
      <div style={{ height: 56, borderRadius: 10, background: hex, border: '1px solid var(--line)' }} />
      <div style={{ fontSize: 12, fontWeight: 600 }}>{name}</div>
      <div className="mono t3" style={{ fontSize: 10.5 }}>{hex}</div>
    </div>
  );
}
function LibSection({ title, anno, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div className="row gap3" style={{ marginBottom: 16, alignItems: 'center' }}>
        <h2 className="h2">{title}</h2>
        {anno && <span className="anno"><Icon name="bolt" size={11} fill /> {anno}</span>}
      </div>
      {children}
    </div>
  );
}

function ComponentLibrary() {
  const [loading, setLoading] = uS4(false);
  return (
    <div className="page page-wide fade-in">
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Design system</div>
        <h1 className="h1" style={{ marginTop: 6 }}>Component Library</h1>
        <p className="t2" style={{ fontSize: 14, marginTop: 4 }}>Tokens & primitives powering the Tazul platform. Dark mode only.</p>
      </div>

      <LibSection title="Color tokens" anno="CSS variables">
        <Card>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Surfaces</div>
          <div className="swatch-grid" style={{ marginBottom: 24 }}>
            <Swatch name="bg" hex="#161311" /><Swatch name="bg-2" hex="#14110F" /><Swatch name="surface" hex="#26211D" />
            <Swatch name="surface-2" hex="#211C18" /><Swatch name="surface-3" hex="#2F2924" /><Swatch name="line" hex="#3B342D" />
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Brand & semantic</div>
          <div className="swatch-grid" style={{ marginBottom: 24 }}>
            <Swatch name="accent" hex="#C8A96B" /><Swatch name="accent-hover" hex="#D6B77A" /><Swatch name="success" hex="#4E8A62" />
            <Swatch name="error" hex="#A44D45" /><Swatch name="text" hex="#F2ECE3" /><Swatch name="text-2" hex="#C1B29F" />
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Board</div>
          <div className="swatch-grid">
            <Swatch name="square light" hex="#D7C1A0" /><Swatch name="square dark" hex="#8A6A45" />
          </div>
        </Card>
      </LibSection>

      <LibSection title="Typography" anno="Inter + JetBrains Mono">
        <Card className="col" style={{ gap: 14 }}>
          <div className="display" style={{ fontSize: 40 }}>Display 800</div>
          <div className="h1">Heading 1 — tight tracking</div>
          <div className="h2">Heading 2</div>
          <div className="h3">Heading 3</div>
          <div style={{ fontSize: 15 }}>Body — the quick brown knight forks the king.</div>
          <div className="t2" style={{ fontSize: 14 }}>Secondary text for supporting detail.</div>
          <div className="mono tnum amber" style={{ fontSize: 22, fontWeight: 700 }}>2,287 · 14:22 · +107</div>
          <div className="mono t3" style={{ fontSize: 12 }}>r1bqk2r/pppp1ppp/2n2n2 (FEN · monospace)</div>
        </Card>
      </LibSection>

      <LibSection title="Buttons" anno="active: scale(0.97)">
        <Card className="row gap3 wrap">
          <Button variant="amber" icon="bolt">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="green" icon="check">Success</Button>
          <Button variant="danger" icon="x">Danger</Button>
          <Button variant="amber" loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1400); }}>Click to load</Button>
          <Button variant="outline" icon="plus" disabled>Disabled</Button>
          <Button variant="outline" size="sm">Small</Button>
        </Card>
      </LibSection>

      <LibSection title="Badges & chips">
        <Card className="col" style={{ gap: 16 }}>
          <div className="row gap2 wrap">
            <Badge>Default</Badge><Badge variant="amber">Amber</Badge><Badge variant="green" dot>Active</Badge>
            <Badge variant="red" dot>Due</Badge><Badge variant="amber"><Icon name="bolt" size={11} fill />1407</Badge>
          </div>
          <div className="row gap2 wrap">
            <Chip active>Fork</Chip><Chip>Pin</Chip><Chip>Skewer</Chip><Chip active>Mate in 1</Chip><Chip>Endgame</Chip>
          </div>
        </Card>
      </LibSection>

      <LibSection title="Progress, rings & inputs">
        <div className="two-grid">
          <Card className="col" style={{ gap: 18 }}>
            <div><div className="field-label">Linear progress</div><Progress value={0.66} /></div>
            <div><div className="field-label">Success</div><Progress value={0.93} green /></div>
            <div className="row gap4"><Ring value={0.6} size={84}><span className="stat" style={{ fontSize: 16 }}>60%</span></Ring><Ring value={0.93} size={84} color="var(--green)"><span className="stat" style={{ fontSize: 16 }}>93%</span></Ring></div>
          </Card>
          <Card className="col" style={{ gap: 16 }}>
            <div><label className="field-label">Text input</label><input className="input" placeholder="Set name…" /></div>
            <div><label className="field-label">Range</label><input type="range" className="range" defaultValue="60" style={{ width: '100%' }} /></div>
            <div className="seg" style={{ alignSelf: 'flex-start' }}><button className="on">Active</button><button>Due</button><button>Done</button></div>
          </Card>
        </div>
      </LibSection>

      <LibSection title="Board states" anno="green=correct · red=incorrect">
        <div className="board-state-grid">
          {[['Last move', { from: 'b5', to: 'c7' }, null, 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1'],
            ['Correct', { from: 'd1', to: 'd8' }, 'correct', '3Q2k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1'],
            ['Incorrect', { from: 'e4', to: 'e5' }, 'wrong', 'r1bqk2r/pppp1ppp/2n2n2/2b1P3/2B5/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1']
          ].map(([label, lm, fb, fen]) => (
            <div key={label} className="col" style={{ gap: 10 }}>
              <div className="row gap2"><span style={{ width: 8, height: 8, borderRadius: 999, background: fb === 'correct' ? 'var(--green)' : fb === 'wrong' ? 'var(--red)' : 'var(--amber)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span></div>
              <ChessBoard fen={fen} interactive={false} lastMove={lm} feedback={fb} showCoords={false} />
            </div>
          ))}
        </div>
      </LibSection>

      <LibSection title="Empty / loading / error states">
        <div className="three-grid">
          <Card className="col center" style={{ textAlign: 'center', gap: 10, padding: 28 }}>
            <span style={{ color: 'var(--text-3)' }}><Icon name="layers" size={28} /></span>
            <div style={{ fontWeight: 600 }}>No sets yet</div>
            <div className="t3" style={{ fontSize: 12.5 }}>Create your first training set.</div>
          </Card>
          <Card className="col" style={{ gap: 12 }}>
            <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '70%' }} />
            <div className="skeleton" style={{ height: 10, borderRadius: 6, width: '90%' }} />
            <div className="skeleton" style={{ height: 10, borderRadius: 6, width: '55%' }} />
            <div className="skeleton" style={{ height: 60, borderRadius: 10, marginTop: 6 }} />
          </Card>
          <Card className="col center" style={{ textAlign: 'center', gap: 10, padding: 28, borderColor: 'rgba(239,68,68,.3)' }}>
            <span style={{ color: 'var(--red)' }}><Icon name="x" size={26} /></span>
            <div style={{ fontWeight: 600 }}>Couldn't load puzzles</div>
            <Button size="sm" variant="outline" icon="refresh">Retry</Button>
          </Card>
        </div>
      </LibSection>
    </div>
  );
}

Object.assign(window, { SetComplete, Profile, ComponentLibrary });
