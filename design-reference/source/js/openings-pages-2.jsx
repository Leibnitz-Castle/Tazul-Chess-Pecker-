/* ============================================================
   Aperturas Pecker — Line Practice (core) + Memory Quiz
   ============================================================ */
const { useState: opS2, useEffect: opE2, useRef: opR2, useMemo: opM2 } = React;

// expected move {from,to,uci,san} for `moves[ply]` from the position at `ply`
function expectedMove(moves, ply) {
  const g = new window.Chess();
  for (let i = 0; i < ply; i++) { try { g.move(moves[i]); } catch (e) {} }
  let mv = null;
  try { mv = g.move(moves[ply]); } catch (e) { mv = null; }
  if (!mv) return null;
  return { from: mv.from, to: mv.to, uci: mv.from + mv.to + (mv.promotion || ''), san: mv.san, fen: g.fen() };
}

/* ---------------- Line Practice ---------------- */
function LinePractice({ lineId, back, openComplete }) {
  const lines = window.ALL_LINES;
  const [lid, setLid] = opS2(lineId || lines[0].id);
  const line = lines.find(l => l.id === lid) || lines[0];
  const playerSide = line.side; // 'white' | 'black'

  const [ply, setPly] = opS2(0);
  const [fen, setFen] = opS2(() => fenAtPly(line.moves, 0));
  const [lastMove, setLastMove] = opS2(null);
  const [feedback, setFeedback] = opS2(null);   // 'correct' | 'wrong'
  const [shake, setShake] = opS2(false);
  const [errors, setErrors] = opS2(0);
  const [hintSq, setHintSq] = opS2(null);
  const [showCorrect, setShowCorrect] = opS2(false);
  const [planOpen, setPlanOpen] = opS2(false);
  const [errOpen, setErrOpen] = opS2(false);
  const [startedAt] = opS2(() => Date.now());
  const timers = opR2([]);

  const playerToMovePly = (p) => (playerSide === 'white' ? p % 2 === 0 : p % 2 === 1);
  const total = line.moves.length;
  const complete = ply >= total;

  // reset when line changes
  opE2(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setPly(0); setFen(fenAtPly(line.moves, 0)); setLastMove(null);
    setFeedback(null); setShake(false); setErrors(0); setHintSq(null); setShowCorrect(false);
    // if opponent moves first (player is black), auto-play white's first move
    if (playerSide === 'black') {
      const t = setTimeout(() => advanceTo(1, true), 600); timers.current.push(t);
    }
  }, [lid]);

  opE2(() => () => timers.current.forEach(clearTimeout), []);

  // advance board to ply `p` (plays the move that creates position p)
  const advanceTo = (p, auto) => {
    setFen(fenAtPly(line.moves, p));
    setLastMove(lastMoveAtPly(line.moves, p));
    setPly(p);
    setHintSq(null); setShowCorrect(false);
    if (p >= total) { const t = setTimeout(() => openComplete(line, errors, Date.now() - startedAt), 900); timers.current.push(t); }
  };

  const onUserMove = (mv) => {
    if (complete || !playerToMovePly(ply)) return;
    const exp = expectedMove(line.moves, ply);
    if (exp && mv.uci === exp.uci) {
      setFeedback('correct');
      const np = ply + 1;
      advanceTo(np, false);
      const t1 = setTimeout(() => setFeedback(null), 480); timers.current.push(t1);
      // auto-play opponent reply if any
      if (np < total && !playerToMovePly(np)) {
        const t2 = setTimeout(() => advanceTo(np + 1, true), 560); timers.current.push(t2);
      }
    } else {
      setErrors(e => e + 1); setFeedback('wrong'); setShake(true);
      setLastMove({ from: mv.from, to: mv.to });
      const t = setTimeout(() => {
        setShake(false); setFeedback(null); setLastMove(lastMoveAtPly(line.moves, ply)); setFen(fenAtPly(line.moves, ply));
      }, 700); timers.current.push(t);
    }
  };

  const doHint = () => { const exp = expectedMove(line.moves, ply); if (exp) setHintSq(exp.from); };
  const reveal = () => {
    const exp = expectedMove(line.moves, ply); if (!exp) return;
    setShowCorrect(true);
    setTimeout(() => advanceTo(ply + 1, false), 850);
    if (ply + 1 < total && !playerToMovePly(ply + 1)) setTimeout(() => advanceTo(ply + 2, true), 1400);
  };

  const moveNo = Math.floor(ply / 2) + 1;
  const yourTurn = !complete && playerToMovePly(ply);

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={back}><Icon name="arrowLeft" size={14} /> Back to repertoire</button>
        <div className="row gap2">
          <EcoBadge eco={line.eco} /><span className="mono t3" style={{ fontSize: 12 }}>Line Practice</span>
        </div>
      </div>

      <div className="play-grid">
        {/* board */}
        <div className="col" style={{ gap: 14 }}>
          <div className={feedback === 'correct' ? 'pulse-correct' : feedback === 'wrong' ? 'glow-wrong' : ''} style={{ position: 'relative' }}>
            <ChessBoard fen={fen} orientation={playerSide} interactive={yourTurn} onUserMove={onUserMove}
              lastMove={showCorrect ? expectedMove(line.moves, ply) && { from: expectedMove(line.moves, ply).from, to: expectedMove(line.moves, ply).to } : lastMove}
              feedback={feedback} shake={shake} hintFrom={hintSq} />
            {hintSq && <HintOverlay sq={hintSq} side={playerSide} />}
          </div>
          <div className="row between">
            <span className="t3" style={{ fontSize: 12.5 }}>{complete ? 'Line complete' : yourTurn ? 'Your move' : 'Opponent to move…'}</span>
            <div className="row gap2">
              <Button size="sm" variant="ghost" icon="target" onClick={doHint} disabled={!yourTurn}>Hint</Button>
              <Button size="sm" variant="ghost" icon="refresh" onClick={() => setLid(lid)}>Retry</Button>
            </div>
          </div>
        </div>

        {/* panel */}
        <div className="col" style={{ gap: 16 }}>
          <Card>
            <div className="row gap2 wrap" style={{ alignItems: 'center', marginBottom: 6 }}>
              <EcoBadge eco={line.eco} /><span className="h3">{line.name}</span>
            </div>
            <div className="row gap3" style={{ marginBottom: 16 }}>
              <span className="t2" style={{ fontSize: 13 }}>You play <strong style={{ color: 'var(--text)' }}>{playerSide === 'white' ? 'White' : 'Black'}</strong></span>
              <span className="t3">·</span>
              <span className="mono tnum t2" style={{ fontSize: 13 }}>Move {Math.min(moveNo, Math.ceil(total / 2))} of {Math.ceil(total / 2)}</span>
            </div>
            <Progress value={ply / total} />
            <div className="row between" style={{ marginTop: 10 }}>
              <div className="row gap2"><StatusDot status={line.status} /><span className="t3" style={{ fontSize: 12 }}>{STATUS_META[line.status].label}</span></div>
              <span className="t3 mono tnum" style={{ fontSize: 12 }}>{errors} {errors === 1 ? 'error' : 'errors'}</span>
            </div>
          </Card>

          {/* feedback */}
          {feedback === 'wrong' && (
            <Card className="fade-in" style={{ borderColor: 'rgba(164,77,69,.35)' }}>
              <div className="row between">
                <div className="row gap3">
                  <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--red-ghost)', color: 'var(--red)', display: 'grid', placeItems: 'center' }}><Icon name="x" size={17} /></span>
                  <div><div style={{ fontWeight: 650, fontSize: 14 }}>Not quite. Try again.</div><div className="t3" style={{ fontSize: 12 }}>That move isn’t in this line.</div></div>
                </div>
                <Button size="sm" variant="ghost" onClick={reveal}>Show move</Button>
              </div>
            </Card>
          )}
          {complete && (
            <div className="success-banner">
              <span style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--green-ghost)', color: 'var(--green)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="check" size={20} strokeWidth={2.4} /></span>
              <div className="grow"><div className="h3" style={{ color: 'var(--green)' }}>Line complete</div><div className="t3" style={{ fontSize: 12.5 }}>{errors === 0 ? 'Flawless — mastery +6%' : `${errors} ${errors === 1 ? 'error' : 'errors'} · mastery +3%`}</div></div>
              <Button variant="green" iconRight="arrowRight" onClick={() => openComplete(line, errors, Date.now() - startedAt)}>Summary</Button>
            </div>
          )}

          {/* collapsible plan */}
          <Collapse title="Typical plan" icon="openings" open={planOpen} setOpen={setPlanOpen} body={line.plan} />
          <Collapse title="Common error" icon="x" danger open={errOpen} setOpen={setErrOpen} body={line.error} />

          <div className="row gap2">
            <Button variant="outline" className="grow" onClick={back}>Back to repertoire</Button>
            <Button variant="amber" className="grow" iconRight="arrowRight" onClick={() => { const i = lines.indexOf(line); setLid(lines[(i + 1) % lines.length].id); }}>Next line</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Collapse({ title, icon, danger, open, setOpen, body }) {
  return (
    <Card pad={false}>
      <button className="row between" style={{ width: '100%', padding: '14px 18px' }} onClick={() => setOpen(o => !o)}>
        <span className="row gap2" style={{ fontSize: 13.5, fontWeight: 600, color: danger ? 'var(--text)' : 'var(--text)' }}>
          <span style={{ color: danger ? 'var(--red)' : 'var(--text-3)' }}><Icon name={icon} size={15} /></span> {title}
        </span>
        <span style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><Icon name="chevDown" size={16} /></span>
      </button>
      {open && <div className="fade-in" style={{ padding: '0 18px 16px' }}><p className="t2" style={{ fontSize: 13, lineHeight: 1.6 }}>{body}</p></div>}
    </Card>
  );
}

// hint pulse ring over a square
function HintOverlay({ sq, side }) {
  const white = side === 'white';
  const { x, y } = centerPct(sq, white);
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', width: '11%', height: '11%', borderRadius: 999, border: '3px solid var(--amber)', boxShadow: '0 0 0 4px rgba(200,169,107,.18)', pointerEvents: 'none', zIndex: 9, animation: 'pulseC 1s ease infinite' }} />
  );
}

/* ---------------- Memory Quiz ---------------- */
function MemoryQuiz({ back }) {
  const lines = window.ALL_LINES;
  // build quiz questions: pick a random mid-line position from several lines
  const questions = opM2(() => lines.slice(0, 5).map(l => {
    const askPly = Math.min(l.moves.length - 1, (l.side === 'white' ? 4 : 5));
    return { line: l, askPly };
  }), []);
  const [qi, setQi] = opS2(0);
  const [results, setResults] = opS2([]);
  const [feedback, setFeedback] = opS2(null);
  const [shake, setShake] = opS2(false);
  const [done, setDone] = opS2(false);
  const timers = opR2([]);
  opE2(() => () => timers.current.forEach(clearTimeout), []);

  const q = questions[qi];
  const fen = fenAtPly(q.line.moves, q.askPly);
  const exp = expectedMove(q.line.moves, q.askPly);

  const onMove = (mv) => {
    if (feedback) return;
    const ok = exp && mv.uci === exp.uci;
    setFeedback(ok ? 'correct' : 'wrong');
    if (!ok) setShake(true);
    const t = setTimeout(() => {
      setResults(r => [...r, { q, ok }]);
      setShake(false); setFeedback(null);
      if (qi + 1 >= questions.length) setDone(true); else setQi(qi + 1);
    }, ok ? 700 : 1100);
    timers.current.push(t);
  };

  if (done) {
    const correct = results.filter(r => r.ok).length;
    const weak = results.filter(r => !r.ok).map(r => r.q.line);
    return (
      <div className="page fade-in" style={{ maxWidth: 720, paddingBottom: 40 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 18 }} onClick={back}><Icon name="arrowLeft" size={14} /> Back</button>
        <Card style={{ textAlign: 'center', padding: '36px 28px', marginBottom: 20 }}>
          <div className="eyebrow amber">Quiz complete</div>
          <div className="stat amber" style={{ fontSize: 52, margin: '10px 0' }}>{correct}<span className="t3" style={{ fontSize: 28 }}>/{questions.length}</span></div>
          <div className="t2" style={{ fontSize: 14 }}>{correct === questions.length ? 'Perfect recall.' : 'Positions to revisit below.'}</div>
        </Card>
        {weak.length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <CardHead title="Weakest positions" icon="target" />
            <div className="col" style={{ gap: 2 }}>
              {weak.map(l => (
                <div key={l.id} className="row between" style={{ padding: '10px 4px', borderTop: '1px solid var(--line-soft)' }}>
                  <div className="row gap3"><StatusDot status={l.status} /><EcoBadge eco={l.eco} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{l.name}</span></div>
                  <span className="t3" style={{ fontSize: 12 }}>missed</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div className="row gap2">
          <Button variant="amber" icon="refresh" onClick={() => { setResults([]); setQi(0); setDone(false); }}>Practice failed positions</Button>
          <Button variant="outline" icon="openings" onClick={back}>Review notes</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={back}><Icon name="arrowLeft" size={14} /> Back</button>
        <span className="mono tnum t3" style={{ fontSize: 12.5 }}>Question {qi + 1} / {questions.length}</span>
      </div>
      <div className="row gap2" style={{ marginBottom: 16 }}>
        {questions.map((_, i) => <div key={i} className="grow" style={{ height: 4, borderRadius: 999, background: i < qi ? 'var(--green)' : i === qi ? 'var(--amber)' : 'var(--surface-2)' }} />)}
      </div>
      <div className="play-grid">
        <div className={feedback === 'correct' ? 'pulse-correct' : feedback === 'wrong' ? 'glow-wrong' : ''} style={{ position: 'relative' }}>
          <ChessBoard fen={fen} orientation={q.line.side} interactive={!feedback} onUserMove={onMove} feedback={feedback} shake={shake} />
        </div>
        <div className="col" style={{ gap: 16 }}>
          <Card>
            <div className="h3" style={{ marginBottom: 14 }}>What is your next move in this line?</div>
            <div className="col" style={{ gap: 10 }}>
              {[['Repertoire', q.line.side === 'white' ? 'White — 1.e4' : 'Black — Sicilian & Indians'],
                ['ECO', q.line.eco], ['Side to move', q.line.side === 'white' ? 'White' : 'Black'],
                ['Line type', q.line.priority === 'high' ? 'Main line' : 'Side variation']].map(([k, v]) => (
                <div key={k} className="row between"><span className="t3" style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</span></div>
              ))}
            </div>
          </Card>
          {feedback && (
            <Card className="fade-in" style={{ borderColor: feedback === 'correct' ? 'rgba(78,138,98,.35)' : 'rgba(164,77,69,.35)' }}>
              <div className="row gap3">
                <span style={{ width: 30, height: 30, borderRadius: 999, background: feedback === 'correct' ? 'var(--green-ghost)' : 'var(--red-ghost)', color: feedback === 'correct' ? 'var(--green)' : 'var(--red)', display: 'grid', placeItems: 'center' }}><Icon name={feedback === 'correct' ? 'check' : 'x'} size={17} /></span>
                <div><div style={{ fontWeight: 650, fontSize: 14, color: feedback === 'correct' ? 'var(--green)' : 'var(--red)' }}>{feedback === 'correct' ? 'Correct' : 'Incorrect'}</div><div className="t3 mono" style={{ fontSize: 12.5 }}>Best: {exp ? exp.san : '—'}</div></div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LinePractice, MemoryQuiz, expectedMove, Collapse });
