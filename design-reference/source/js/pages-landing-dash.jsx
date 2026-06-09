/* ============================================================
   Tazul Chess — Landing + Dashboard
   ============================================================ */
const { useState: uS1 } = React;

function Logo({ size = 22, mark = true, wordmark = true }) {
  return (
    <div className="row gap3" style={{ alignItems: 'center' }}>
      {mark && (
        <span style={{
          width: size + 12, height: size + 12, borderRadius: 9, display: 'grid', placeItems: 'center',
          background: 'linear-gradient(150deg,#1c1d22,#101116)', border: '1px solid var(--line)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)',
        }}>
          <span style={{ fontSize: size, lineHeight: 1, color: 'var(--amber)', textShadow: '0 0 10px rgba(200,169,107,.30)' }}>{'\u265E'}</span>
        </span>
      )}
      {wordmark && (
        <span style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: size * 0.82 }}>
          Tazul<span className="amber">.</span>
        </span>
      )}
    </div>
  );
}

/* ---------------- Landing ---------------- */
function Landing({ go }) {
  const features = [
    { icon: 'target', title: 'Practice Pecker', body: 'Spaced-repetition tactics trainer. Build sets, drill weak themes, master patterns through cycles.' },
    { icon: 'openings', title: 'Aperturas Pecker', body: 'Opening repertoire drills from elite games. Train your lines until they\u2019re reflex.' },
    { icon: 'warehouse', title: 'Elite Warehouse', body: '500,000 games from 2400+ players. Mine positions, study plans, extract tactics.' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(900px 480px at 72% -8%, rgba(200,169,107,.05), transparent 62%), var(--bg)' }}>
      {/* nav */}
      <header className="row between" style={{ height: 72, padding: '0 32px', maxWidth: 1280, margin: '0 auto' }}>
        <Logo size={22} />
        <Button variant="outline" icon="lichess" onClick={() => go('dashboard')}>Login with Lichess</Button>
      </header>

      {/* hero */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 0' }} className="hero-grid">
        <div className="col" style={{ justifyContent: 'center', gap: 24 }}>
          <Badge variant="amber" style={{ alignSelf: 'flex-start' }}><Icon name="bolt" size={12} fill /> Built for serious players · 1800–2600+</Badge>
          <h1 className="display">Train like the GMs.<br /><span className="amber">Think</span> like the best.</h1>
          <p className="t2" style={{ fontSize: 17, maxWidth: 440, lineHeight: 1.55 }}>
            A focused study environment for spaced-repetition tactics, opening drills, and elite-game mining — no noise, no gimmicks.
          </p>
          <div className="row gap3 wrap">
            <Button variant="amber" size="lg" icon="bolt" onClick={() => go('play')}>Start Training</Button>
            <Button variant="ghost" size="lg" iconRight="arrowRight" onClick={() => go('dashboard')}>View dashboard</Button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ maxWidth: 460, marginLeft: 'auto' }}>
            <ChessBoard fen="r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1"
              interactive={false} lastMove={{ from: 'f1', to: 'c4' }} />
          </div>
          <div className="badge badge-amber" style={{ position: 'absolute', bottom: -10, left: 8, height: 28 }}>
            <Icon name="bolt" size={12} fill /> Italian Game · live position
          </div>
        </div>
      </section>

      {/* features */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 32px 0' }}>
        <div className="feat-grid">
          {features.map((f, i) => (
            <Card key={i} hover>
              <span style={{ width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--amber-ghost)', color: 'var(--amber)', marginBottom: 16 }}>
                <Icon name={f.icon} size={20} />
              </span>
              <div className="h3" style={{ marginBottom: 8 }}>{f.title}</div>
              <p className="t2" style={{ fontSize: 14, lineHeight: 1.55 }}>{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* stats bar */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 32px 80px' }}>
        <Card style={{ background: 'linear-gradient(180deg,#15161b,#101115)' }}>
          <div className="stats-bar">
            {[['2,345,000', 'puzzles'], ['500,000', 'elite games'], ['2400+', 'rating floor'], ['\u221E', 'cycles']].map(([n, l], i) => (
              <div key={i} className="col center" style={{ gap: 4, padding: '4px 0' }}>
                <div className="stat amber" style={{ fontSize: 30 }}>{n}</div>
                <div className="eyebrow">{l}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="t3 center" style={{ marginTop: 20, fontSize: 12.5 }}>Built for serious players. Dark mode, always.</div>
      </section>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ go }) {
  const u = window.USER;
  return (
    <div className="page fade-in">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="h1" style={{ marginTop: 6 }}>Welcome back, {u.display}.</h1>
      </div>

      <div className="dash-grid stagger">
        {/* Today's training */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardHead title="Today's Training" icon="target" />
          <div className="row" style={{ gap: 20 }}>
            <Ring value={u.solvedToday / u.dailyGoal} size={120}>
              <div className="col center">
                <div className="stat" style={{ fontSize: 26 }}><CountUp value={u.solvedToday} /></div>
                <div className="t3" style={{ fontSize: 11 }}>of {u.dailyGoal}</div>
              </div>
            </Ring>
            <div className="col" style={{ gap: 10, justifyContent: 'center' }}>
              <div><div className="stat amber" style={{ fontSize: 22 }}>{Math.round(u.solvedToday / u.dailyGoal * 100)}%</div><div className="eyebrow">of daily goal</div></div>
              <Button size="sm" variant="amber" icon="bolt" onClick={() => go('play')}>Resume</Button>
            </div>
          </div>
        </Card>

        {/* Performance */}
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHead title="Performance · Puzzle rating (30d)" icon="chart"
            action={<Badge variant="green"><Icon name="arrowRight" size={11} style={{ transform: 'rotate(-45deg)' }} />+107</Badge>} />
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: 8 }}>
            <div className="stat amber" style={{ fontSize: 34 }}><CountUp value={u.puzzleElo} /></div>
            <div className="t3" style={{ fontSize: 12 }}>peak {Math.max(...window.PERF_SERIES)}</div>
          </div>
          <LineChart data={window.PERF_SERIES} height={120} />
        </Card>

        {/* Active sets */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardHead title="Active Sets" icon="layers" action={<button className="t3" onClick={() => go('practice')}><Icon name="chevRight" size={16} /></button>} />
          <div className="col" style={{ gap: 16 }}>
            {window.SETS.filter(s => s.status !== 'completed').slice(0, 3).map(s => (
              <div key={s.id} className="col" style={{ gap: 7, cursor: 'pointer' }} onClick={() => go('play')}>
                <div className="row between">
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                  <span className="mono tnum t3" style={{ fontSize: 12 }}>{s.done}/{s.total}</span>
                </div>
                <Progress value={s.done / s.total} />
              </div>
            ))}
          </div>
        </Card>

        {/* Current streak */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardHead title="Current Streak" icon="flame" action={<span className="streak-badge" style={{ height: 26 }}><Icon name="flame" size={13} fill />{u.streak}d</span>} />
          <MiniHeat cells={window.STREAK_MINI} />
          <div className="row between" style={{ marginTop: 14 }}>
            <span className="t3" style={{ fontSize: 12 }}>Last 49 days</span>
            <span className="t3" style={{ fontSize: 12 }}>Longest: <span className="amber mono">{u.longest}d</span></span>
          </div>
        </Card>

        {/* Weak areas */}
        <Card style={{ gridColumn: 'span 1' }}>
          <CardHead title="Weak Areas" icon="target" />
          <div className="col" style={{ gap: 14 }}>
            {window.WEAK_AREAS.map(w => (
              <div key={w.theme} className="row between">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{w.theme}</div>
                  <div className="t3 mono" style={{ fontSize: 11.5 }}>{Math.round(w.accuracy * 100)}% · {w.attempts} tries</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => go('play')}>Practice</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended */}
        <Card style={{ gridColumn: 'span 3' }}>
          <CardHead title="Recommended for you" icon="star" />
          <div className="rec-grid">
            {window.RECOMMENDED.map(r => (
              <div key={r.id} className="card card-hover" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }} onClick={() => go('play')}>
                <div style={{ width: 76, flexShrink: 0 }}>
                  <ChessBoard fen={r.fen} interactive={false} showCoords={false} />
                </div>
                <div className="grow">
                  <div className="row gap2" style={{ marginBottom: 6 }}><Badge>{r.theme}</Badge><Badge variant="amber"><Icon name="bolt" size={10} fill />{r.rating}</Badge></div>
                  <div className="t3" style={{ fontSize: 12 }}>{r.why} · sharpen this pattern</div>
                </div>
                <Icon name="chevRight" size={18} style={{ color: 'var(--text-3)' }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, Dashboard, Logo });
