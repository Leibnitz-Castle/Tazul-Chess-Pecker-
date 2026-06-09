/* ============================================================
   Aperturas Pecker — Dashboard + Repertoire Overview
   ============================================================ */
const { useState: opS1, useMemo: opM1 } = React;

/* ---------------- Repertoire folder card ---------------- */
function RepCard({ rep, onStudy, onEdit }) {
  const mastery = window.repMastery(rep), due = window.repDue(rep);
  const isWhite = rep.color === 'white';
  return (
    <Card hover className={`rep-card ${isWhite ? '' : 'black-rep'}`} onClick={onStudy}>
      <span className="rep-glyph">{isWhite ? '\u2654' : '\u265A'}</span>
      <div className="row between" style={{ marginBottom: 16, position: 'relative' }}>
        <span className="badge" style={{ background: isWhite ? 'rgba(242,236,227,.08)' : 'rgba(0,0,0,.3)', borderColor: 'var(--line)', color: 'var(--text)', textTransform: 'none', height: 24 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: isWhite ? '#F2ECE3' : '#1E1A16', border: '1px solid var(--line)' }} /> {isWhite ? 'White' : 'Black'}
        </span>
        <MasteryRing value={mastery} size={34} />
      </div>
      <div className="h3" style={{ marginBottom: 14, position: 'relative' }}>{rep.name}</div>
      <div className="row gap6" style={{ marginBottom: 20, position: 'relative' }}>
        <div><div className="stat" style={{ fontSize: 22 }}>{rep.total}</div><div className="eyebrow">lines</div></div>
        <div><div className="stat amber" style={{ fontSize: 22 }}>{Math.round(mastery * 100)}%</div><div className="eyebrow">memorized</div></div>
        <div><div className="stat" style={{ fontSize: 22, color: due ? 'var(--warning)' : 'var(--text)' }}>{due}</div><div className="eyebrow">due today</div></div>
      </div>
      <div className="row between" style={{ position: 'relative' }}>
        <div className="row gap2">
          <Button size="sm" variant="amber" icon="bolt" onClick={(e) => { e.stopPropagation(); onStudy(); }}>Study</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</Button>
        </div>
        <span className="t3" style={{ fontSize: 11.5 }}>Practiced {rep.lastPracticed}</span>
      </div>
    </Card>
  );
}

/* ---------------- Repertoire Dashboard ---------------- */
function OpeningsDashboard({ openRep, openPractice, empty: forceEmpty }) {
  const [empty, setEmpty] = opS1(false);
  const reps = window.REPERTOIRES;
  const totalLines = reps.reduce((a, r) => a + r.total, 0);
  const totalDue = reps.reduce((a, r) => a + window.repDue(r), 0);
  const avgMastery = reps.reduce((a, r) => a + window.repMastery(r), 0) / reps.length;
  const critical = window.WEAK_LINES.filter(l => l.mastery < 0.5).length;

  if (empty) {
    return (
      <div>
        <div className="row end" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
          <div className="seg"><button onClick={() => setEmpty(false)}>With data</button><button className="on">Empty</button></div>
        </div>
        <Card style={{ padding: '60px 32px', textAlign: 'center', maxWidth: 520, margin: '24px auto' }}>
          <div style={{ width: 110, margin: '0 auto 22px' }}>
            <ChessBoard fen="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1" interactive={false} showCoords={false} />
          </div>
          <div className="h2" style={{ marginBottom: 8 }}>No repertoire yet</div>
          <p className="t2" style={{ fontSize: 14, marginBottom: 22, maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>
            A repertoire is your personal library of opening lines. Build one, drill it with spaced repetition, and walk into every game prepared.
          </p>
          <Button variant="amber" icon="plus">Create your first repertoire</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="row end" style={{ justifyContent: 'flex-end', marginBottom: 14 }}>
        <div className="seg"><button className="on">With data</button><button onClick={() => setEmpty(true)}>Empty state</button></div>
      </div>

      {/* quick stats */}
      <div className="four-grid stagger" style={{ marginBottom: 22 }}>
        <Stat label="Total lines" value={totalLines} icon="layers" />
        <Stat label="Due for review" value={totalDue} primary icon="clock" sub="across both colors" />
        <Stat label="Avg memorization" value={Math.round(avgMastery * 100) + '%'} icon="target" />
        <Stat label="Critical positions" value={critical} icon="bolt" sub="below 50% mastery" />
      </div>

      {/* repertoire folders */}
      <div className="rep-grid stagger" style={{ marginBottom: 24 }}>
        {reps.map(r => <RepCard key={r.id} rep={r} onStudy={() => openRep(r.id)} onEdit={() => openRep(r.id)} />)}
      </div>

      {/* weak lines */}
      <Card>
        <CardHead title="Weak lines — review recommended" icon="target"
          action={<Button size="sm" variant="ghost" iconRight="chevRight" onClick={openPractice}>Practice all</Button>} />
        <div className="col" style={{ gap: 2 }}>
          {window.WEAK_LINES.slice(0, 4).map(l => (
            <div key={l.id} className="row between" style={{ padding: '11px 4px', borderTop: '1px solid var(--line-soft)' }}>
              <div className="row gap3" style={{ minWidth: 0 }}>
                <StatusDot status={l.status} />
                <EcoBadge eco={l.eco} />
                <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</span>
              </div>
              <div className="row gap4">
                <span className="mono tnum" style={{ fontSize: 12.5, color: STATUS_META[l.status].color, width: 38, textAlign: 'right' }}>{Math.round(l.mastery * 100)}%</span>
                <Button size="sm" variant="outline" onClick={openPractice}>Practice</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Repertoire Overview ---------------- */
function RepertoireOverview({ repId, openPractice, openEditor, back }) {
  const rep = window.REPERTOIRES.find(r => r.id === repId) || window.REPERTOIRES[0];
  const [selId, setSelId] = opS1(rep.lines[0].id);
  const [ply, setPly] = opS1(rep.lines[0].moves.length);
  const [q, setQ] = opS1('');
  const line = rep.lines.find(l => l.id === selId) || rep.lines[0];
  const mastery = window.repMastery(rep);
  const filtered = rep.lines.filter(l => (l.name + l.eco).toLowerCase().includes(q.toLowerCase()));

  const selectLine = (l) => { setSelId(l.id); setPly(l.moves.length); };

  return (
    <div className="page page-wide fade-in" style={{ paddingBottom: 40 }}>
      {/* header */}
      <div className="row between wrap gap3" style={{ marginBottom: 26, alignItems: 'flex-end' }}>
        <div className="col" style={{ gap: 10, minWidth: 0 }}>
          <button className="row gap2 t3" style={{ fontSize: 12.5, fontWeight: 600 }} onClick={back}><Icon name="arrowLeft" size={14} /> Aperturas</button>
          <h1 className="serif-title">{rep.name}</h1>
          <div className="row gap3 wrap" style={{ alignItems: 'center' }}>
            <span className="badge" style={{ height: 24, color: 'var(--text)' }}><span style={{ width: 9, height: 9, borderRadius: 999, background: rep.color === 'white' ? '#F2ECE3' : '#1E1A16', border: '1px solid var(--line)' }} />{rep.color === 'white' ? 'White' : 'Black'}</span>
            <span className="t3" style={{ fontSize: 13 }}>{rep.total} lines · <span className="amber mono">{Math.round(mastery * 100)}%</span> mastery</span>
          </div>
        </div>
        <div className="row gap2 wrap">
          <Button variant="amber" icon="bolt" onClick={() => openPractice(line.id)}>Practice</Button>
          <Button variant="outline" icon="upload" onClick={openEditor}>Import PGN</Button>
          <Button variant="outline" icon="settings" onClick={openEditor}>Edit</Button>
        </div>
      </div>

      <div className="overview-grid">
        {/* left: line tree */}
        <Card pad={false} style={{ position: 'sticky', top: 80 }}>
          <div style={{ padding: '14px 14px 10px' }}>
            <div className="row gap2" style={{ position: 'relative', marginBottom: 10 }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={15} /></span>
              <input className="input" style={{ height: 38, paddingLeft: 34, fontSize: 13 }} placeholder="Search lines…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Button size="sm" variant="outline" icon="plus" className="btn-block" onClick={openEditor}>Add Line</Button>
          </div>
          <hr className="divider" />
          <div className="tree-list" style={{ padding: 8, maxHeight: 460, overflowY: 'auto' }}>
            {filtered.map(l => (
              <div key={l.id} className={['tree-row', selId === l.id && 'sel'].filter(Boolean).join(' ')} onClick={() => selectLine(l)} tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectLine(l)}>
                <StatusDot status={l.status} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row gap2" style={{ alignItems: 'center' }}>
                    <EcoBadge eco={l.eco} />
                    <span className="tname" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</span>
                  </div>
                  <div className="tmeta" style={{ marginTop: 3 }}>depth {l.moves.length} · {Math.round(l.mastery * 100)}% mastery</div>
                </div>
                <MasteryRing value={l.mastery} size={26} stroke={3} status={l.status} />
              </div>
            ))}
            {filtered.length === 0 && <div className="t3" style={{ padding: 20, textAlign: 'center', fontSize: 13 }}>No lines match “{q}”.</div>}
          </div>
        </Card>

        {/* right: board + viewer + study */}
        <div className="col" style={{ gap: 20 }}>
          <Card>
            <LineViewer line={line} ply={ply} setPly={setPly} />
          </Card>
          <StudyTabs line={line} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OpeningsDashboard, RepertoireOverview, RepCard });
