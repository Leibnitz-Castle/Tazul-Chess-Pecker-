/* ============================================================
   Tazul Chess — Puzzle Play Page (core experience)
   ============================================================ */
const { useState: uS3, useEffect: uE3, useRef: uR3 } = React;

function fmtTime(s) { const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; }

function MasteryDots({ level, max = 3 }) {
  return (
    <span className="row gap2" style={{ display: 'inline-flex' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 999,
          background: i < level ? 'var(--amber)' : 'var(--surface-3)',
          boxShadow: i < level ? '0 0 8px rgba(245,158,11,.5)' : 'none' }} />
      ))}
    </span>
  );
}

function PlayPage({ setName = 'Knight Forks — Core', go }) {
  const puzzles = window.PUZZLES;
  const [idx, setIdx] = uS3(0);
  const puzzle = puzzles[idx];

  const [fen, setFen] = uS3(puzzle.fen);
  const [feedback, setFeedback] = uS3(null);       // 'correct' | 'wrong' | null
  const [lastMove, setLastMove] = uS3(null);
  const [shake, setShake] = uS3(false);
  const [attempts, setAttempts] = uS3(0);
  const [revealed, setRevealed] = uS3(false);
  const [confetti, setConfetti] = uS3(false);
  const [solvedIds, setSolvedIds] = uS3(() => new Set());
  const [mastery, setMastery] = uS3(() => ({}));
  const [flip, setFlip] = uS3(false);
  const [infoOpen, setInfoOpen] = uS3(false);
  const [timerOn, setTimerOn] = uS3(true);
  const [seconds, setSeconds] = uS3(0);
  const [pulse, setPulse] = uS3(false);
  const revertRef = uR3(null);

  const solved = feedback === 'correct';
  const orientation = (puzzle.sideToMove === 'w') === !flip ? 'white' : 'black';

  // timer
  uE3(() => {
    if (!timerOn) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  const loadPuzzle = (i) => {
    clearTimeout(revertRef.current);
    setIdx(i); setFen(puzzles[i].fen); setFeedback(null); setLastMove(null);
    setShake(false); setAttempts(0); setRevealed(false); setConfetti(false); setInfoOpen(false);
  };
  const next = () => loadPuzzle((idx + 1) % puzzles.length);
  const prev = () => loadPuzzle((idx - 1 + puzzles.length) % puzzles.length);

  const onUserMove = (mv) => {
    if (solved) return;
    if (mv.uci === puzzle.solution) {
      setFen(mv.fen); setLastMove({ from: mv.from, to: mv.to }); setFeedback('correct');
      setConfetti(true); setPulse(true); setTimeout(() => setPulse(false), 460);
      setSolvedIds(s => new Set(s).add(puzzle.id));
      if (attempts === 0 && !revealed) {
        setMastery(m => ({ ...m, [puzzle.id]: Math.min(3, (m[puzzle.id] || 0) + 1) }));
      }
    } else {
      setAttempts(a => a + 1);
      setLastMove({ from: mv.from, to: mv.to }); setFeedback('wrong'); setShake(true);
      revertRef.current = setTimeout(() => {
        setShake(false); setFeedback(null); setLastMove(null); setFen(puzzle.fen);
      }, 720);
    }
  };

  const showSolution = () => {
    clearTimeout(revertRef.current);
    const g = window.newGame(puzzle.fen);
    const from = puzzle.solution.slice(0, 2), to = puzzle.solution.slice(2, 4);
    const promotion = puzzle.solution[4];
    g.move({ from, to, promotion });
    setFen(g.fen()); setLastMove({ from, to }); setFeedback('correct'); setRevealed(true); setShake(false);
  };

  const masteryLevel = mastery[puzzle.id] || (idx % 3);
  const setTotal = 80, setDone = 52 + solvedIds.size;

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      {/* breadcrumb */}
      <div className="row between" style={{ marginBottom: 18 }}>
        <button className="row gap2 t2" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => go && go('practice')}>
          <Icon name="arrowLeft" size={15} /> {setName}
        </button>
        <div className="row gap3">
          <Badge variant="amber"><Icon name="bolt" size={12} fill /> {puzzle.rating}</Badge>
          <span className="mono t3" style={{ fontSize: 12 }}>{puzzle.id}</span>
        </div>
      </div>

      <div className="play-grid">
        {/* ---------- LEFT: board ---------- */}
        <div className="col" style={{ gap: 16 }}>
          <div className={pulse ? 'pulse-correct' : feedback === 'wrong' ? 'glow-wrong' : ''} style={{ position: 'relative' }}>
            <ChessBoard fen={fen} orientation={orientation} interactive={!solved}
              onUserMove={onUserMove} lastMove={lastMove} feedback={feedback} shake={shake} />
            <Confetti run={confetti} />
          </div>
          {/* board controls */}
          <div className="row between">
            <div className="row gap2">
              <Button size="sm" variant="outline" icon="prev" onClick={prev} aria-label="Previous" />
              <Button size="sm" variant="outline" icon="next" onClick={next} aria-label="Next" />
            </div>
            <div className="row gap2">
              <Button size="sm" variant="ghost" icon="flip" onClick={() => setFlip(f => !f)}>Flip</Button>
              <Button size="sm" variant="ghost" icon="bolt" onClick={() => setTimerOn(t => !t)}>
                <span className="mono tnum">{fmtTime(seconds)}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: panel ---------- */}
        <div className="col" style={{ gap: 16 }}>
          <Card>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <div className="eyebrow">Active set</div>
                <div className="h3" style={{ marginTop: 4 }}>{setName}</div>
              </div>
              <div className="text-right">
                <div className="mono tnum amber" style={{ fontWeight: 700, fontSize: 18 }}>{setDone}<span className="t3">/{setTotal}</span></div>
                <div className="eyebrow" style={{ marginTop: 2 }}>solved</div>
              </div>
            </div>
            <Progress value={setDone / setTotal} />
          </Card>

          {/* turn / feedback */}
          <Card style={{ borderColor: solved ? 'rgba(16,185,129,.35)' : feedback === 'wrong' ? 'rgba(239,68,68,.35)' : undefined }}>
            {!feedback && (
              <div className="fade-in">
                <div className="row gap3" style={{ marginBottom: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: puzzle.sideToMove === 'w' ? '#f8f5ee' : '#26201a', border: '1px solid var(--line)' }} />
                  <span className="h3">Your turn as {puzzle.sideToMove === 'w' ? 'White' : 'Black'}</span>
                </div>
                <div className="t2" style={{ fontSize: 14 }}>{puzzle.prompt}</div>
                {attempts > 0 && (
                  <div className="row gap2" style={{ marginTop: 12 }}>
                    <Badge variant="red"><Icon name="x" size={11} /> {attempts} wrong</Badge>
                    {attempts >= 2 && <Button size="sm" variant="ghost" onClick={showSolution}>Show solution</Button>}
                  </div>
                )}
              </div>
            )}
            {solved && (
              <div className="fade-in">
                <div className="row gap3" style={{ marginBottom: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--green-ghost)', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
                    <Icon name="check" size={20} strokeWidth={2.6} />
                  </span>
                  <div>
                    <div className="h3 green">{revealed ? 'Solution shown' : 'Correct!'}</div>
                    <div className="t3" style={{ fontSize: 12.5 }}>
                      {revealed ? 'Try the next one without help.' : `Solved in ${fmtTime(seconds)} · ${attempts === 0 ? 'first try' : attempts + ' tries'}`}
                    </div>
                  </div>
                </div>
                <Button variant="green" className="btn-block" iconRight="arrowRight" onClick={next}>Next puzzle</Button>
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="fade-in row gap3">
                <span style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--red-ghost)', color: 'var(--red)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="x" size={20} strokeWidth={2.6} />
                </span>
                <div>
                  <div className="h3 red">Incorrect</div>
                  <div className="t3" style={{ fontSize: 12.5 }}>That's not the best move — try again.</div>
                </div>
              </div>
            )}
          </Card>

          {/* mastery */}
          <Card pad={false} style={{ padding: '16px 20px' }}>
            <div className="row between">
              <div className="row gap3">
                <Icon name="target" size={16} style={{ color: 'var(--text-3)' }} />
                <span className="t2" style={{ fontSize: 13.5, fontWeight: 600 }}>Mastery</span>
              </div>
              <div className="row gap3">
                <span className="mono tnum t3" style={{ fontSize: 12.5 }}>{masteryLevel}/3</span>
                <MasteryDots level={masteryLevel} />
              </div>
            </div>
          </Card>

          {/* puzzle info (collapsible) */}
          <Card pad={false}>
            <button className="row between" style={{ width: '100%', padding: '16px 20px' }} onClick={() => setInfoOpen(o => !o)}>
              <span className="t2" style={{ fontSize: 13.5, fontWeight: 600 }}>Puzzle info</span>
              <span style={{ color: 'var(--text-3)', transform: infoOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                <Icon name="chevDown" size={16} />
              </span>
            </button>
            {infoOpen && (
              <div className="fade-in" style={{ padding: '0 20px 18px' }}>
                <hr className="divider" style={{ marginBottom: 14 }} />
                <div className="row between" style={{ marginBottom: 12 }}>
                  <span className="t3" style={{ fontSize: 13 }}>Rating</span>
                  <span className="mono amber tnum" style={{ fontWeight: 700 }}>{puzzle.rating}</span>
                </div>
                <div className="row between wrap gap2" style={{ marginBottom: 14 }}>
                  <span className="t3" style={{ fontSize: 13 }}>Themes</span>
                  <div className="row gap2 wrap" style={{ justifyContent: 'flex-end' }}>
                    {puzzle.themes.map(t => <Badge key={t}>{t}</Badge>)}
                  </div>
                </div>
                <div className="row between" style={{ marginBottom: 14 }}>
                  <span className="t3" style={{ fontSize: 13 }}>Original game</span>
                  <a className="row gap2 amber" style={{ fontSize: 13, fontWeight: 600 }}>
                    <Icon name="link" size={13} /> Lichess
                  </a>
                </div>
                <div className="t3" style={{ fontSize: 12 }}>{puzzle.game}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12, background: 'var(--bg-2)', padding: '8px 10px', borderRadius: 8, wordBreak: 'break-all' }}>
                  {puzzle.fen}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PlayPage });
