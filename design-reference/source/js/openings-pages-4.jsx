/* ============================================================
   Aperturas Pecker — Line Editor · PGN Import · Model Game · Line Complete
   ============================================================ */
const { useState: opS4, useRef: opR4, useMemo: opM4, useEffect: opE4 } = React;

/* ---------------- Line Editor ---------------- */
function LineEditor({ back }) {
  const base = window.LINES_WHITE[0];
  const [name, setName] = opS4(base.name);
  const [eco, setEco] = opS4(base.eco);
  const [main, setMain] = opS4(true);
  const [priority, setPriority] = opS4('high');
  const [tab, setTab] = opS4('notes');
  const [notes, setNotes] = opS4({ notes: base.note, plan: base.plan, error: base.error, critical: 'After ...O-O, the d4 break decides whether White gets an edge.' });
  const [ply, setPly] = opS4(base.moves.length);
  const moves = base.moves;
  const fen = opM4(() => fenAtPly(moves, ply), [ply]);
  const lastMove = opM4(() => lastMoveAtPly(moves, ply), [ply]);
  const pairs = toMovePairs(moves);
  const [saved, setSaved] = opS4(false);
  const tabs = [['notes', 'Notes'], ['plan', 'Typical Plan'], ['error', 'Common Error'], ['critical', 'Critical Position']];

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between wrap gap3" style={{ marginBottom: 20 }}>
        <div className="col" style={{ gap: 6 }}>
          <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={back}><Icon name="arrowLeft" size={14} /> Repertoire</button>
          <h1 className="serif-title">Line Editor</h1>
        </div>
        <div className="row gap2">
          <Button variant="outline" icon="upload">Import PGN</Button>
          <Button variant="ghost" onClick={back}>Cancel</Button>
          <Button variant="amber" icon={saved ? 'check' : undefined} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1600); }}>{saved ? 'Saved' : 'Save Line'}</Button>
        </div>
      </div>

      <div className="viewer-grid">
        {/* board */}
        <Card>
          <ChessBoard fen={fen} orientation={base.side} interactive={false} lastMove={lastMove} showCoords />
          <div className="row between" style={{ marginTop: 14 }}>
            <div className="row gap2">
              <Button size="sm" variant="outline" icon="prev" onClick={() => setPly(0)} disabled={ply === 0} />
              <Button size="sm" variant="outline" onClick={() => setPly(Math.max(0, ply - 1))} disabled={ply === 0}><Icon name="chevDown" size={15} style={{ transform: 'rotate(90deg)' }} /></Button>
              <Button size="sm" variant="outline" onClick={() => setPly(Math.min(moves.length, ply + 1))} disabled={ply === moves.length}><Icon name="chevDown" size={15} style={{ transform: 'rotate(-90deg)' }} /></Button>
              <Button size="sm" variant="outline" icon="next" onClick={() => setPly(moves.length)} disabled={ply === moves.length} />
            </div>
            <span className="t3" style={{ fontSize: 12 }}>Drag pieces to add moves</span>
          </div>
        </Card>

        {/* editor panel */}
        <div className="col" style={{ gap: 16 }}>
          {/* metadata */}
          <Card>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Line metadata</div>
            <div className="col" style={{ gap: 14 }}>
              <div><label className="field-label">Line name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="row gap3">
                <div style={{ width: 110 }}><label className="field-label">ECO code</label><input className="input mono" value={eco} onChange={e => setEco(e.target.value)} /></div>
                <div className="grow"><label className="field-label">Priority</label>
                  <div className="seg" style={{ width: '100%' }}>
                    {['high','medium','low'].map(p => <button key={p} className={priority === p ? 'on' : ''} style={{ flex: 1, textTransform: 'capitalize' }} onClick={() => setPriority(p)}>{p}</button>)}
                  </div>
                </div>
              </div>
              <div className="row between" style={{ padding: '4px 0' }}>
                <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>Main line</div><div className="t3" style={{ fontSize: 12 }}>Mark as the primary variation</div></div>
                <button className={['tgl', main && 'on'].filter(Boolean).join(' ')} onClick={() => setMain(m => !m)} aria-pressed={main} aria-label="Main line toggle" />
              </div>
            </div>
          </Card>

          {/* move list */}
          <Card pad={false}>
            <div className="row between" style={{ padding: '14px 18px 10px' }}><span className="eyebrow">Moves</span><span className="mono t3" style={{ fontSize: 11.5 }}>{moves.length} plies</span></div>
            <div className="pgn-list" style={{ margin: '0 12px 12px', maxHeight: 160 }}>
              {pairs.map(p => (
                <div key={p.n} className="pgn-row">
                  <span className="pgn-num mono">{p.n}.</span>
                  <button className={['pgn-mv mono', ply === p.wi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.wi + 1)}>{p.w}</button>
                  {p.b ? <button className={['pgn-mv mono', ply === p.bi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.bi + 1)}>{p.b}</button> : <span />}
                </div>
              ))}
            </div>
          </Card>

          {/* notes tabs — chess notebook */}
          <Card pad={false}>
            <div className="subtabs">
              {tabs.map(([k, l]) => <button key={k} className={['subtab', tab === k && 'on'].filter(Boolean).join(' ')} onClick={() => setTab(k)}>{l}</button>)}
            </div>
            <div style={{ padding: 16 }}>
              <textarea className="pgn-textarea" style={{ fontFamily: 'var(--font)', minHeight: 120, fontSize: 13.5, lineHeight: 1.6 }}
                value={notes[tab]} onChange={e => setNotes(n => ({ ...n, [tab]: e.target.value }))} placeholder="Write your study notes…" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PGN Import ---------------- */
function PgnImport({ back }) {
  const [state, setState] = opS4('empty'); // empty | selected | parsing | success | error
  const [drag, setDrag] = opS4(false);
  const [text, setText] = opS4('');
  const [upto, setUpto] = opS4(12);
  const [repTarget, setRepTarget] = opS4('rep-white');
  const [keepComments, setKeepComments] = opS4(true);
  const [detectEco, setDetectEco] = opS4(true);
  const [markMain, setMarkMain] = opS4(true);
  const preview = window.IMPORT_PREVIEW;
  const hasError = preview.some(p => !p.ok);

  const runParse = () => { setState('parsing'); setTimeout(() => setState(hasError ? 'error' : 'success'), 1100); };
  const loadSample = () => { setText(window.PGN_SAMPLE); setState('selected'); };

  return (
    <div className="col" style={{ gap: 20 }}>
      <div className="import-grid">
        {/* left: input */}
        <Card>
          <CardHead title="PGN source" icon="upload" />
          <div className={['dropzone', drag && 'drag'].filter(Boolean).join(' ')}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); setText(window.PGN_SAMPLE); setState('selected'); }}>
            <span style={{ color: 'var(--text-3)' }}><Icon name="upload" size={26} /></span>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>Drag & drop a .pgn file</div>
            <div className="t3" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>or paste below · max 200 games</div>
            <Button size="sm" variant="outline" icon="search" onClick={loadSample}>Browse files</Button>
          </div>
          <div className="field-label" style={{ marginTop: 18 }}>Paste PGN</div>
          <textarea className="pgn-textarea" value={text} placeholder="[Event &quot;…&quot;]&#10;1.e4 e5 2.Nf3 …" onChange={e => { setText(e.target.value); setState(e.target.value ? 'selected' : 'empty'); }} />
          {state !== 'empty' && <div className="row gap2" style={{ marginTop: 8 }}><span className="t3" style={{ fontSize: 12 }}>Not sure?</span><button className="amber" style={{ fontSize: 12, fontWeight: 600 }} onClick={loadSample}>Load sample repertoire</button></div>}
        </Card>

        {/* right: options */}
        <Card>
          <CardHead title="Import options" icon="settings" />
          <div className="col" style={{ gap: 18 }}>
            <div>
              <div className="row between"><label className="field-label" style={{ marginBottom: 0 }}>Import up to move</label><span className="mono amber tnum" style={{ fontWeight: 700 }}>{upto}</span></div>
              <input type="range" className="range" min="5" max="30" value={upto} onChange={e => setUpto(+e.target.value)} style={{ width: '100%', marginTop: 10 }} />
              <div className="row between"><span className="t3 mono" style={{ fontSize: 11 }}>5</span><span className="t3 mono" style={{ fontSize: 11 }}>30</span></div>
            </div>
            <div><label className="field-label">Assign to repertoire</label>
              <div className="seg" style={{ width: '100%' }}>
                {window.REPERTOIRES.map(r => <button key={r.id} className={repTarget === r.id ? 'on' : ''} style={{ flex: 1 }} onClick={() => setRepTarget(r.id)}>{r.color === 'white' ? 'White' : 'Black'}</button>)}
              </div>
            </div>
            <hr className="divider" />
            {[['Keep comments as notes', keepComments, setKeepComments], ['Detect ECO automatically', detectEco, setDetectEco], ['Mark first variation as main line', markMain, setMarkMain]].map(([label, val, set], i) => (
              <div key={i} className="row between"><span style={{ fontSize: 13.5, fontWeight: 550 }}>{label}</span>
                <button className={['tgl', val && 'on'].filter(Boolean).join(' ')} onClick={() => set(v => !v)} aria-pressed={val} aria-label={label} /></div>
            ))}
            <Button variant="amber" icon="upload" className="btn-block" loading={state === 'parsing'} disabled={state === 'empty'} onClick={runParse}>
              {state === 'parsing' ? 'Parsing…' : 'Import lines'}
            </Button>
          </div>
        </Card>
      </div>

      {/* preview / states */}
      <Card pad={false}>
        <div style={{ padding: '20px 24px 4px' }}>
          <CardHead title={state === 'success' ? 'Imported — 5 lines added' : state === 'error' ? 'Preview · 1 line needs attention' : 'Preview'} icon="layers"
            action={state === 'success' ? <Badge variant="green" dot>Success</Badge> : state === 'error' ? <Badge variant="red" dot>Partial error</Badge> : state === 'parsing' ? <Badge variant="amber" dot>Parsing</Badge> : null} />
        </div>
        {state === 'empty' && (
          <div className="col center" style={{ padding: '40px 24px', textAlign: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-3)' }}><Icon name="openings" size={26} /></span>
            <div style={{ fontWeight: 600 }}>No PGN imported yet</div>
            <div className="t3" style={{ fontSize: 12.5 }}>Paste or drop a file to preview the first lines.</div>
          </div>
        )}
        {state === 'parsing' && (
          <div className="col" style={{ gap: 10, padding: '8px 24px 24px' }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
          </div>
        )}
        {(state === 'selected' || state === 'success' || state === 'error') && (
          <div style={{ padding: '0 12px 12px' }}>
            {preview.map((p, i) => (
              <div key={i} className="row between" style={{ padding: '12px 12px', borderTop: '1px solid var(--line-soft)' }}>
                <div className="row gap3" style={{ minWidth: 0 }}>
                  {p.ok ? <span style={{ color: 'var(--green)' }}><Icon name="check" size={16} /></span> : <span style={{ color: 'var(--red)' }}><Icon name="x" size={16} /></span>}
                  <EcoBadge eco={p.eco} />
                  <span className="mono" style={{ fontSize: 12.5, color: p.ok ? 'var(--text-2)' : 'var(--red)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.san}</span>
                </div>
                {!p.ok && <span className="t3" style={{ fontSize: 11.5, color: 'var(--red)', flexShrink: 0 }}>ambiguous move</span>}
              </div>
            ))}
            {state === 'error' && (
              <div style={{ margin: '12px', padding: '12px 14px', borderRadius: 8, background: 'var(--red-ghost)', border: '1px solid rgba(164,77,69,.3)' }}>
                <div className="row gap2" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}><Icon name="x" size={14} /> Line 5 — ambiguous move at 5.d4?!</div>
                <div className="t2" style={{ fontSize: 12.5 }}>The annotation glyph could not be parsed cleanly. Import the other 4 lines, or fix the source and retry.</div>
                <div className="row gap2" style={{ marginTop: 10 }}><Button size="sm" variant="outline" onClick={() => setState('selected')}>Edit source</Button><Button size="sm" variant="amber">Import 4 valid</Button></div>
              </div>
            )}
            {state === 'success' && (
              <div className="success-banner" style={{ margin: 12 }}>
                <span style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--green-ghost)', color: 'var(--green)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="check" size={18} /></span>
                <div className="grow"><div style={{ fontWeight: 650, color: 'var(--green)' }}>5 lines imported</div><div className="t3" style={{ fontSize: 12.5 }}>Added to {window.REPERTOIRES.find(r => r.id === repTarget).name}</div></div>
                <Button variant="green" iconRight="arrowRight" onClick={back}>View repertoire</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Model Game Viewer ---------------- */
function ModelGameViewer({ back }) {
  const g = window.MODEL_GAME;
  const [ply, setPly] = opS4(g.moves.length);
  const fen = opM4(() => fenAtPly(g.moves, ply), [ply]);
  const lastMove = opM4(() => lastMoveAtPly(g.moves, ply), [ply]);
  const pairs = toMovePairs(g.moves);
  // crude eval bar from ply (illustrative)
  const evalPct = opM4(() => 50 + Math.min(40, ply * 1.6) * (ply > 8 ? 1 : 0.4), [ply]);

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 18 }} onClick={back}><Icon name="arrowLeft" size={14} /> Back</button>
      <div className="viewer-grid">
        {/* board + eval bar */}
        <div className="row gap3" style={{ alignItems: 'stretch' }}>
          <div style={{ width: 10, borderRadius: 6, overflow: 'hidden', background: '#1E1A16', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${evalPct}%`, background: 'linear-gradient(180deg,#F2ECE3,#C1B29F)', transition: 'height .3s ease' }} />
          </div>
          <div className="grow col" style={{ gap: 12 }}>
            <ChessBoard fen={fen} interactive={false} lastMove={lastMove} showCoords />
            <div className="row between">
              <div className="row gap2">
                <Button size="sm" variant="outline" icon="prev" onClick={() => setPly(0)} disabled={ply === 0} />
                <Button size="sm" variant="outline" onClick={() => setPly(Math.max(0, ply - 1))} disabled={ply === 0}><Icon name="chevDown" size={15} style={{ transform: 'rotate(90deg)' }} /></Button>
                <Button size="sm" variant="outline" onClick={() => setPly(Math.min(g.moves.length, ply + 1))} disabled={ply === g.moves.length}><Icon name="chevDown" size={15} style={{ transform: 'rotate(-90deg)' }} /></Button>
                <Button size="sm" variant="outline" icon="next" onClick={() => setPly(g.moves.length)} disabled={ply === g.moves.length} />
              </div>
              <span className="mono tnum t3" style={{ fontSize: 12 }}>ply {ply}/{g.moves.length}</span>
            </div>
          </div>
        </div>

        {/* info */}
        <div className="col" style={{ gap: 16 }}>
          <Card>
            {/* tournament bulletin header */}
            <div className="row between" style={{ marginBottom: 14 }}>
              <div className="row gap3"><span style={{ width: 12, height: 12, borderRadius: 3, background: '#F2ECE3', border: '1px solid var(--line)' }} /><div><div style={{ fontWeight: 650 }}>{g.white}</div><div className="t3 mono" style={{ fontSize: 11.5 }}>{g.whiteElo}</div></div></div>
              <span className="mono amber" style={{ fontWeight: 700 }}>{g.result}</span>
            </div>
            <div className="row between" style={{ marginBottom: 16 }}>
              <div className="row gap3"><span style={{ width: 12, height: 12, borderRadius: 3, background: '#1E1A16', border: '1px solid var(--line)' }} /><div><div style={{ fontWeight: 650 }}>{g.black}</div><div className="t3 mono" style={{ fontSize: 11.5 }}>{g.blackElo}</div></div></div>
            </div>
            <hr className="divider" style={{ marginBottom: 14 }} />
            <div className="col" style={{ gap: 9 }}>
              {[['Event', g.event], ['Date', g.date], ['ECO', g.eco], ['Opening', g.opening]].map(([k, v]) => (
                <div key={k} className="row between"><span className="t3" style={{ fontSize: 12.5 }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{k === 'ECO' ? <EcoBadge eco={v} /> : v}</span></div>
              ))}
            </div>
          </Card>
          <Card pad={false}>
            <div style={{ padding: '14px 16px 8px' }}><span className="eyebrow">Moves</span></div>
            <div className="pgn-list" style={{ margin: '0 12px 12px', maxHeight: 200 }}>
              {pairs.map(p => (
                <div key={p.n} className="pgn-row">
                  <span className="pgn-num mono">{p.n}.</span>
                  <button className={['pgn-mv mono', ply === p.wi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.wi + 1)}>{p.w}</button>
                  {p.b ? <button className={['pgn-mv mono', ply === p.bi + 1 && 'cur'].filter(Boolean).join(' ')} onClick={() => setPly(p.bi + 1)}>{p.b}</button> : <span />}
                </div>
              ))}
            </div>
          </Card>
          <div className="row gap2">
            <Button variant="outline" className="grow" onClick={back}>Return to repertoire</Button>
            <Button variant="amber" className="grow" icon="plus">Add to training</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Line Complete summary ---------------- */
function LineComplete({ line, errors, ms, back, nextLine }) {
  const secs = Math.round((ms || 0) / 1000);
  const gain = errors === 0 ? 6 : errors <= 2 ? 3 : 1;
  return (
    <div className="page fade-in" style={{ maxWidth: 680, paddingBottom: 40 }}>
      <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 18 }} onClick={back}><Icon name="arrowLeft" size={14} /> Repertoire</button>
      <div className="success-banner" style={{ marginBottom: 22 }}>
        <span style={{ width: 42, height: 42, borderRadius: 999, background: 'var(--green-ghost)', color: 'var(--green)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="check" size={22} strokeWidth={2.4} /></span>
        <div className="grow"><div className="row gap2" style={{ alignItems: 'center' }}><EcoBadge eco={line.eco} /><span className="h3">{line.name}</span></div><div className="t3" style={{ fontSize: 12.5, marginTop: 2 }}>Line completed</div></div>
      </div>
      <div className="three-grid stagger" style={{ marginBottom: 22 }}>
        <Stat label="Time" value={`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`} icon="clock" />
        <Stat label="Errors" value={errors} primary={errors === 0} icon="target" sub={errors === 0 ? 'flawless' : 'review the slips'} />
        <Stat label="Mastery gained" value={'+' + gain + '%'} accent icon="bolt" sub={`now ${Math.round(Math.min(1, line.mastery + gain / 100) * 100)}%`} />
      </div>
      <div className="row gap2">
        <Button variant="amber" className="grow" iconRight="arrowRight" onClick={nextLine}>Next line</Button>
        <Button variant="outline" className="grow" onClick={back}>Back to repertoire</Button>
      </div>
    </div>
  );
}

Object.assign(window, { LineEditor, PgnImport, ModelGameViewer, LineComplete });
