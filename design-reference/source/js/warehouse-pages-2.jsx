/* ============================================================
   Elite Warehouse — Import Wizard + Elite Game Viewer
   ============================================================ */
const { useState: whS2, useEffect: whE2, useRef: whR2, useMemo: whM2 } = React;

/* ---------------- Import Wizard ---------------- */
const WH_OPTIONS = [
  { id: 'filter', label: 'Filter only +2600 players', desc: 'Discard games where neither player is rated 2600+.', cost: 'fast', warn: false, default: true },
  { id: 'fen', label: 'Extract moves and FEN', desc: 'Store every position for search and analysis.', cost: '~12s / 1k games', warn: false, default: true },
  { id: 'eco', label: 'Auto-classify ECO', desc: 'Detect opening codes from move order.', cost: 'fast', warn: false, default: true },
  { id: 'sf', label: 'Queue Stockfish analysis', desc: 'Depth-99 evaluation of every position.', cost: '~4s / position · CPU heavy', warn: true, default: false },
  { id: 'dedup', label: 'Deduplicate existing games', desc: 'Skip games already in the warehouse.', cost: 'fast', warn: false, default: true },
  { id: 'norm', label: 'Normalize player names', desc: 'Unify name variants (e.g. "Nepo,I" → full name).', cost: 'fast', warn: false, default: true },
];

function ImportWizard({ go }) {
  const [step, setStep] = whS2(0);
  const [source, setSource] = whS2('twic');
  const [text, setText] = whS2('');
  const [fileLoaded, setFileLoaded] = whS2(false);
  const [drag, setDrag] = whS2(false);
  const [opts, setOpts] = whS2(() => Object.fromEntries(WH_OPTIONS.map(o => [o.id, o.default])));
  const [phase, setPhase] = whS2('config'); // config | processing | complete | error
  const [progress, setProgress] = whS2(0);
  const [log, setLog] = whS2([]);
  const logTimer = whR2(null);

  const steps = ['Source', 'Upload', 'Options', 'Review'];
  const toggle = id => setOpts(o => ({ ...o, [id]: !o[id] }));
  const fileMeta = { size: '4.2 MB', games: 3120, format: 'TWIC PGN', warnings: 1 };

  const startImport = () => {
    setPhase('processing'); setProgress(0); setLog([]);
    const tasks = window.WH_LOG.slice(0, 7);
    let i = 0;
    logTimer.current = setInterval(() => {
      setProgress(p => Math.min(1, p + 0.16));
      setLog(l => i < tasks.length ? [...l, tasks[i]] : l); i++;
      if (i > tasks.length + 1) { clearInterval(logTimer.current); setPhase(opts.sf ? 'complete' : 'complete'); setProgress(1); }
    }, 480);
  };
  whE2(() => () => clearInterval(logTimer.current), []);

  if (phase === 'processing' || phase === 'complete') {
    const done = phase === 'complete';
    return (
      <div className="col" style={{ gap: 18, maxWidth: 860 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={() => { clearInterval(logTimer.current); setPhase('config'); setStep(3); }}><Icon name="arrowLeft" size={14} /> Back to settings</button>
        <Card>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="row gap3"><span style={{ color: done ? 'var(--green)' : 'var(--warning)' }}><Icon name={done ? 'check' : 'refresh'} size={18} /></span><span className="h3">{done ? 'Import complete' : 'Processing twic1574.pgn'}</span></div>
            {done ? <StatusBadge status="done" /> : <StatusBadge status="processing" />}
          </div>
          <Progress value={progress} />
          <div className="row between" style={{ marginTop: 10 }}>
            <span className="mono tnum t3" style={{ fontSize: 12 }}>{Math.round(progress * 842)} / 842 processed · 6 failed · 11 skipped</span>
            <span className="mono tnum t2" style={{ fontSize: 12 }}>{Math.round(progress * 100)}%</span>
          </div>
        </Card>

        <Card pad={false}>
          <div style={{ padding: '14px 18px 8px' }} className="row between"><span className="eyebrow">Process log</span>{!done && <span className="t3 mono" style={{ fontSize: 11 }}>g-{2403 + Math.round(progress * 40)} · current</span>}</div>
          <div style={{ padding: '0 14px 14px' }}><LogPanel lines={log} height={200} /></div>
        </Card>

        {done && (
          <>
            <div className="wh-metrics-4">
              <Metric label="Imported" value="831" mono trendLabel="games stored" />
              <Metric label="Failed" value="6" mono trendLabel="flagged for review" />
              <Metric label="New players" value="14" mono />
              <Metric label="ECO coverage" value="38" mono trendLabel="opening codes" />
            </div>
            <div className="row gap2 wrap">
              <Button variant="amber" icon="warehouse" onClick={() => go('games')}>Browse imported games</Button>
              <Button variant="outline" icon="chart" onClick={() => go('openings')}>View analytics</Button>
              <Button variant="ghost" icon="upload" onClick={() => { setPhase('config'); setStep(0); }}>Import another</Button>
            </div>
          </>
        )}
        {!done && <Button variant="ghost" onClick={() => go('hub')} style={{ alignSelf: 'flex-start' }}>Continue in background</Button>}
      </div>
    );
  }

  return (
    <div className="col" style={{ gap: 20, maxWidth: 820 }}>
      {/* progress */}
      <div>
        <div className="row gap2" style={{ marginBottom: 10 }}>
          {steps.map((_, i) => <div key={i} className="grow" style={{ height: 4, borderRadius: 999, background: i <= step ? 'var(--amber)' : 'var(--surface-2)', transition: 'background .3s' }} />)}
        </div>
        <div className="row between"><span className="eyebrow">Step {step + 1} of 4</span><span className="eyebrow amber">{steps[step]}</span></div>
      </div>

      {step === 0 && (
        <div className="fade-in">
          <div className="field-label">Choose a source</div>
          <div className="source-grid">
            {window.WH_SOURCES.map(s => (
              <button key={s.id} onClick={() => setSource(s.id)} className="card" style={{ padding: 16, textAlign: 'left', display: 'flex', gap: 13, alignItems: 'center', borderColor: source === s.id ? 'var(--amber)' : undefined, background: source === s.id ? 'var(--amber-ghost)' : undefined }}>
                <span style={{ width: 38, height: 38, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: source === s.id ? 'var(--amber)' : 'var(--text-2)', flexShrink: 0 }}><Icon name={s.icon} size={18} /></span>
                <div><div style={{ fontWeight: 650, fontSize: 14 }}>{s.title}</div><div className="t3" style={{ fontSize: 12 }}>{s.body}</div></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="fade-in col" style={{ gap: 16 }}>
          {source === 'paste' ? (
            <div><div className="field-label">Paste PGN text</div><textarea className="pgn-textarea" value={text} placeholder="[Event &quot;…&quot;]&#10;1.e4 c5 …" onChange={e => { setText(e.target.value); setFileLoaded(!!e.target.value); }} /></div>
          ) : (
            <div className={['dropzone', drag && 'drag'].filter(Boolean).join(' ')}
              onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); setFileLoaded(true); }}>
              <span style={{ color: 'var(--text-3)' }}><Icon name="upload" size={28} /></span>
              <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>Drag & drop a .pgn file</div>
              <div className="t3" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>or browse — TWIC, ChessBase, or custom PGN</div>
              <Button size="sm" variant="outline" icon="search" onClick={() => setFileLoaded(true)}>Browse files</Button>
            </div>
          )}
          {(fileLoaded || text) && (
            <Card style={{ background: 'var(--surface-2)' }}>
              <div className="row between" style={{ marginBottom: 12 }}><span className="mono nm" style={{ fontSize: 13 }}>twic1574.pgn</span><StatusBadge status="done" small /></div>
              <div className="four-grid" style={{ gap: 12 }}>
                {[['Size', fileMeta.size], ['Est. games', fileMeta.games.toLocaleString()], ['Format', fileMeta.format], ['Warnings', fileMeta.warnings]].map(([k, v]) => (
                  <div key={k}><div className="eyebrow">{k}</div><div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: k === 'Warnings' && v > 0 ? 'var(--warning)' : 'var(--text)' }}>{v}</div></div>
                ))}
              </div>
              {fileMeta.warnings > 0 && <div className="row gap2" style={{ marginTop: 12, color: 'var(--warning)', fontSize: 12.5 }}><Icon name="x" size={13} /> 1 game has a malformed header — it will be skipped.</div>}
            </Card>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="fade-in col" style={{ gap: 10 }}>
          <div className="field-label">Processing options</div>
          {WH_OPTIONS.map(o => (
            <button key={o.id} className="card" style={{ padding: 14, textAlign: 'left', display: 'flex', gap: 13, alignItems: 'flex-start', borderColor: opts[o.id] ? 'rgba(200,169,107,.4)' : undefined }} onClick={() => toggle(o.id)}>
              <span className={['cbox', opts[o.id] && 'on'].filter(Boolean).join(' ')} style={{ marginTop: 2 }}>{opts[o.id] && <Icon name="check" size={11} strokeWidth={3} />}</span>
              <div className="grow">
                <div className="row between"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{o.label}</span><span className="mono t3" style={{ fontSize: 11, color: o.warn ? 'var(--warning)' : 'var(--text-3)' }}>{o.cost}</span></div>
                <div className="t3" style={{ fontSize: 12, marginTop: 3 }}>{o.desc}</div>
                {o.warn && opts[o.id] && <div className="row gap2" style={{ marginTop: 8, color: 'var(--warning)', fontSize: 11.5 }}><Icon name="bolt" size={12} fill /> Resource-intensive — adds significant queue time.</div>}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="fade-in col" style={{ gap: 14 }}>
          <div className="field-label">Review & import</div>
          <Card style={{ background: 'var(--surface-2)' }}>
            {[['Source', window.WH_SOURCES.find(s => s.id === source).title], ['File', 'twic1574.pgn · 4.2 MB'], ['Est. games', '3,120 → ~842 after +2600 filter'],
              ['Options', WH_OPTIONS.filter(o => opts[o.id]).map(o => o.label.replace(/ only.*| existing.*/,'')).length + ' enabled'],
              ['Stockfish', opts.sf ? 'Queued (CPU heavy)' : 'Skipped']].map(([k, v]) => (
              <div key={k} className="row between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}><span className="t3" style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '62%' }}>{v}</span></div>
            ))}
          </Card>
          <Card style={{ borderColor: 'rgba(200,169,107,.2)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Expected output</div>
            <div className="row gap6 wrap">
              <div><div className="stat amber" style={{ fontSize: 22 }}>~842</div><div className="eyebrow">games stored</div></div>
              <div><div className="stat" style={{ fontSize: 22 }}>~38k</div><div className="eyebrow">positions</div></div>
              <div><div className="stat" style={{ fontSize: 22 }}>~14</div><div className="eyebrow">new players</div></div>
              <div><div className="stat" style={{ fontSize: 22 }}>{opts.sf ? '~58 min' : '~40s'}</div><div className="eyebrow">est. time</div></div>
            </div>
          </Card>
        </div>
      )}

      {/* footer */}
      <div className="row between">
        <Button variant="ghost" icon="arrowLeft" onClick={() => step === 0 ? go('hub') : setStep(s => s - 1)}>{step === 0 ? 'Cancel' : 'Back'}</Button>
        {step < 3
          ? <Button variant="amber" iconRight="arrowRight" onClick={() => setStep(s => s + 1)} disabled={step === 1 && !fileLoaded && !text}>Continue</Button>
          : <Button variant="amber" icon="upload" onClick={startImport}>Start import</Button>}
      </div>
    </div>
  );
}

/* ---------------- Elite Game Viewer ---------------- */
function GameViewer({ gameId, back }) {
  const g = window.WH_GAMES_FULL[gameId] || window.WH_GAME_RUY;
  const [ply, setPly] = whS2(g.moves.length);
  const fen = whM2(() => fenAtPly(g.moves, ply), [g.id, ply]);
  const lastMove = whM2(() => lastMoveAtPly(g.moves, ply), [g.id, ply]);
  const pairs = toMovePairs(g.moves);
  // illustrative eval per ply
  const evalAt = whM2(() => {
    const arr = []; let v = 0.2;
    for (let i = 0; i <= g.moves.length; i++) {
      const q = g.quality[i - 1];
      v += q === 'blunder' ? (g.result === '0-1' ? -1.4 : 1.4) : q === 'mistake' ? (g.result === '0-1' ? -0.8 : 0.8) : q === 'inaccuracy' ? (Math.random() - 0.5) * 0.4 : (Math.random() - 0.48) * 0.25;
      v = Math.max(-4.5, Math.min(4.5, v)); arr.push(v);
    }
    if (g.result === '0-1') arr[arr.length - 1] = -3.8; if (g.result === '1-0') arr[arr.length - 1] = 3.8;
    return arr;
  }, [g.id]);
  const cp = evalAt[ply] ?? 0;
  const bestMoves = { Ruy: 'Bd2', Naj: 'f4' };

  whE2(() => {
    const onKey = e => { if (e.key === 'ArrowLeft') setPly(p => Math.max(0, p - 1)); if (e.key === 'ArrowRight') setPly(p => Math.min(g.moves.length, p + 1)); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [g.id]);

  const QualTag = ({ q }) => q ? <span className="ml-q" style={{ color: QUALITY[q].c }}>{QUALITY[q].sym}</span> : null;

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={back}><Icon name="arrowLeft" size={14} /> Games browser</button>
        <span className="mono t3" style={{ fontSize: 12 }}>{g.id} · use ← → keys</span>
      </div>

      <div className="wh-viewer">
        {/* board + eval bar */}
        <div className="row gap3" style={{ alignItems: 'stretch' }}>
          <EvalBar cp={cp} />
          <div className="grow col" style={{ gap: 12 }}>
            <ChessBoard fen={fen} interactive={false} lastMove={lastMove} feedback={g.quality[ply - 1] === 'blunder' || g.quality[ply - 1] === 'mistake' ? 'wrong' : null} showCoords />
            <div className="row between">
              <div className="row gap2">
                <Button size="sm" variant="outline" icon="prev" onClick={() => setPly(0)} disabled={ply === 0} />
                <Button size="sm" variant="outline" onClick={() => setPly(Math.max(0, ply - 1))} disabled={ply === 0}><Icon name="chevDown" size={15} style={{ transform: 'rotate(90deg)' }} /></Button>
                <Button size="sm" variant="outline" onClick={() => setPly(Math.min(g.moves.length, ply + 1))} disabled={ply === g.moves.length}><Icon name="chevDown" size={15} style={{ transform: 'rotate(-90deg)' }} /></Button>
                <Button size="sm" variant="outline" icon="next" onClick={() => setPly(g.moves.length)} disabled={ply === g.moves.length} />
                <Button size="sm" variant="ghost" icon="flip">Flip</Button>
              </div>
              <span className="mono tnum t3" style={{ fontSize: 12 }}>ply {ply}/{g.moves.length}</span>
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="col" style={{ gap: 16 }}>
          {/* bulletin header */}
          <Card>
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="row gap3"><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F2ECE3', border: '1px solid var(--line)' }} /><div><div style={{ fontWeight: 650, fontSize: 14 }}>{g.white}</div><div className="t3 mono tnum" style={{ fontSize: 11.5 }}>{g.whiteElo}</div></div></div>
              <ResultBadge result={g.result} />
            </div>
            <div className="row gap3" style={{ marginBottom: 14 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#1E1A16', border: '1px solid var(--line)' }} /><div><div style={{ fontWeight: 650, fontSize: 14 }}>{g.black}</div><div className="t3 mono tnum" style={{ fontSize: 11.5 }}>{g.blackElo}</div></div></div>
            <hr className="divider" style={{ marginBottom: 12 }} />
            <div className="row between wrap gap2" style={{ fontSize: 12.5 }}>
              <span className="t3">{g.event}</span><span className="t3 mono">{g.date}</span><EcoBadge eco={g.eco} /><span className="t2">{g.opening}</span>
            </div>
          </Card>

          {/* engine panel */}
          <Card style={{ background: 'var(--surface-2)' }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="eyebrow">Stockfish 16 · depth 99</span>
              <span className="mono tnum" style={{ fontWeight: 700, fontSize: 15, color: cp >= 0 ? 'var(--green)' : 'var(--red)' }}>{cp >= 0 ? '+' : ''}{cp.toFixed(2)}</span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)', background: '#120F0D', borderRadius: 8, padding: '10px 12px', lineHeight: 1.7 }}>
              <span className="t3">best</span> {g.id === 'g-2402' ? 'f4' : 'Bd2'} <span className="t3">pv</span> {g.id === 'g-2402' ? 'f4 exf4 Bxf4 Ne5' : 'Bd2 Rfc8 Rac1 Qb7'}
            </div>
            <Button size="sm" variant="outline" icon="bolt" className="btn-block" style={{ marginTop: 12 }}>Run deeper analysis</Button>
          </Card>

          {/* move list */}
          <Card pad={false}>
            <div style={{ padding: '12px 16px 6px' }} className="row between"><span className="eyebrow">Moves</span>
              <div className="row gap3" style={{ fontSize: 10.5 }}>{Object.entries(QUALITY).map(([k, v]) => <span key={k} className="row" style={{ gap: 3, color: v.c }}><b>{v.sym}</b><span className="t3">{v.label}</span></span>)}</div>
            </div>
            <div className="movelist" style={{ margin: '0 12px 12px' }}>
              {pairs.map(p => (
                <div key={p.n} className="ml-row">
                  <span className="mono t3" style={{ fontSize: 11.5, textAlign: 'right', paddingRight: 6 }}>{p.n}.</span>
                  <button className={['ml-mv', ply === p.wi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.wi + 1)}>{p.w}<QualTag q={g.quality[p.wi]} /></button>
                  {p.b ? <button className={['ml-mv', ply === p.bi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.bi + 1)}>{p.b}<QualTag q={g.quality[p.bi]} /></button> : <span />}
                </div>
              ))}
            </div>
          </Card>

          <div className="row gap2 wrap">
            <Button size="sm" variant="amber" icon="plus">Add to training</Button>
            <Button size="sm" variant="outline" icon="openings">Link to repertoire</Button>
            <Button size="sm" variant="ghost" icon="upload">Export PGN</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImportWizard, GameViewer });
