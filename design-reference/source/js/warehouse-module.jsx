/* ============================================================
   Elite Warehouse — module router
   ============================================================ */
const { useState: whSR, useEffect: whER } = React;

function WarehouseModule() {
  const [tab, setTab] = whSR('hub');
  const [gameId, setGameId] = whSR(null);
  const [prevTab, setPrevTab] = whSR('games');

  whER(() => { window.scrollTo(0, 0); }, [tab, gameId]);

  const openGame = (id) => { setPrevTab(tab); setGameId(id); };
  const go = (t) => { setGameId(null); setTab(t); };

  // game viewer is a full-page overlay on top of any tab
  if (gameId) return <GameViewer gameId={gameId} back={() => setGameId(null)} />;

  const action = tab === 'hub'
    ? <Button variant="amber" icon="upload" onClick={() => setTab('import')}>Import PGN</Button>
    : tab === 'games'
    ? <Button variant="outline" icon="upload" onClick={() => setTab('import')}>Import</Button>
    : null;

  // import wizard renders inside the shell but without the action button
  return (
    <WarehouseShell tab={tab === 'import' ? 'hub' : tab} setTab={go} action={action}>
      {tab === 'hub' && <WarehouseHub go={go} openGame={openGame} />}
      {tab === 'import' && <ImportWizard go={go} />}
      {tab === 'games' && <GamesBrowser openGame={openGame} />}
      {tab === 'players' && <PlayerExplorer openGame={openGame} />}
      {tab === 'openings' && <OpeningAnalytics />}
      {tab === 'stockfish' && <StockfishPanel />}
      {tab === 'recs' && <Recommendations openGame={openGame} go={go} />}
      {tab === 'export' && <ExportPanel />}
      {tab === 'pipeline' && <PipelineStatus />}
    </WarehouseShell>
  );
}

Object.assign(window, { WarehouseModule });
