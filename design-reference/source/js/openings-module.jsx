/* ============================================================
   Aperturas Pecker — module router (sub-navigation)
   ============================================================ */
const { useState: opSR, useEffect: opER } = React;

function OpeningsModule() {
  // view: dashboard | overview | practice | playing | tree | weak | eco | import | editor | model | complete
  const [view, setView] = opSR('dashboard');
  const [repId, setRepId] = opSR('rep-white');
  const [lineId, setLineId] = opSR(null);
  const [complete, setComplete] = opSR(null);

  opER(() => { window.scrollTo(0, 0); }, [view]);

  const tabViews = ['dashboard', 'practice', 'tree', 'weak', 'eco', 'import'];
  const isTab = tabViews.includes(view);

  const openRep = (id) => { setRepId(id); setView('overview'); };
  const openPractice = (lid) => { setLineId(lid || window.ALL_LINES[0].id); setView('playing'); };
  const openComplete = (line, errors, ms) => { setComplete({ line, errors, ms }); setView('complete'); };

  // secondary (full-page) views render standalone
  if (view === 'overview') return <RepertoireOverview repId={repId} openPractice={openPractice} openEditor={() => setView('editor')} back={() => setView('dashboard')} />;
  if (view === 'editor') return <LineEditor back={() => setView('overview')} />;
  if (view === 'model') return <ModelGameViewer back={() => setView('eco')} />;
  if (view === 'complete' && complete) return <LineComplete {...complete} back={() => setView('overview')} nextLine={() => { const ls = window.ALL_LINES; const i = ls.indexOf(complete.line); setLineId(ls[(i + 1) % ls.length].id); setView('playing'); }} />;
  if (view === 'playing') return <LinePractice lineId={lineId} back={() => setView('practice')} openComplete={openComplete} />;

  // tabbed views
  return (
    <OpeningsShell tab={view} setTab={setView}
      action={isTab && view !== 'import' && view !== 'eco' ? <Button variant="amber" icon="plus" onClick={() => setView('editor')}>New line</Button> : null}>
      {view === 'dashboard' && <OpeningsDashboard openRep={openRep} openPractice={() => setView('practice')} />}
      {view === 'practice' && <PracticePicker openPractice={openPractice} openQuiz={() => setView('quiz')} />}
      {view === 'tree' && <OpeningTree />}
      {view === 'weak' && <OpeningWeaknesses openPractice={openPractice} />}
      {view === 'eco' && <EcoExplorer openModel={() => setView('model')} />}
      {view === 'import' && <PgnImport back={() => setView('dashboard')} />}
      {view === 'quiz' && <MemoryQuiz back={() => setView('practice')} />}
    </OpeningsShell>
  );
}

// The "Practice" tab: pick a line to drill, or launch the memory quiz.
function PracticePicker({ openPractice, openQuiz }) {
  return (
    <div className="col" style={{ gap: 20 }}>
      <Card style={{ background: 'linear-gradient(120deg, rgba(200,169,107,.06), var(--surface) 60%)', borderColor: 'rgba(200,169,107,.16)' }}>
        <div className="row between wrap gap3">
          <div className="row gap4" style={{ alignItems: 'center' }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--amber-ghost)', color: 'var(--amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="target" size={22} /></span>
            <div><div className="h3">Opening Memory Quiz</div><div className="t2" style={{ fontSize: 13 }}>Five positions across your repertoire — find the right move from memory.</div></div>
          </div>
          <Button variant="amber" icon="bolt" onClick={openQuiz}>Start quiz</Button>
        </div>
      </Card>
      <div className="eyebrow">Drill a single line</div>
      <div className="set-grid stagger">
        {window.ALL_LINES.map(l => (
          <Card key={l.id} hover onClick={() => openPractice(l.id)}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="row gap2"><StatusDot status={l.status} /><EcoBadge eco={l.eco} /></div>
              <MasteryRing value={l.mastery} size={28} status={l.status} />
            </div>
            <div className="h3" style={{ marginBottom: 6 }}>{l.name}</div>
            <div className="t3" style={{ fontSize: 12, marginBottom: 14 }}>You play {l.side} · depth {l.moves.length} plies</div>
            <Button size="sm" variant="amber" icon="bolt" className="btn-block" onClick={(e) => { e.stopPropagation(); openPractice(l.id); }}>Practice line</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { OpeningsModule, PracticePicker });
