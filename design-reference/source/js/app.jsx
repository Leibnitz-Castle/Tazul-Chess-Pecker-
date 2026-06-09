/* ============================================================
   Tazul Chess — App shell + router
   ============================================================ */
const { useState: uSA, useEffect: uEA } = React;

const NAV = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'practice', label: 'Practice', icon: 'practice' },
  { id: 'openings', label: 'Openings', icon: 'openings' },
  { id: 'warehouse', label: 'Elite Warehouse', icon: 'warehouse' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

function ComingSoon({ title, icon, blurb }) {
  return (
    <div className="page fade-in col center" style={{ minHeight: '70vh', textAlign: 'center', gap: 16 }}>
      <span style={{ width: 64, height: 64, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'var(--amber-ghost)', color: 'var(--amber)' }}><Icon name={icon} size={30} /></span>
      <h1 className="h1">{title}</h1>
      <p className="t2" style={{ fontSize: 14, maxWidth: 380 }}>{blurb}</p>
      <Badge variant="amber" style={{ height: 26 }}>On the roadmap</Badge>
    </div>
  );
}

function Topbar({ page, go }) {
  const u = window.USER;
  const titles = { dashboard: 'Dashboard', practice: 'Practice', play: 'Training', profile: 'Profile',
    setcomplete: 'Session', openings: 'Openings', warehouse: 'Elite Warehouse', library: 'Design System' };
  return (
    <div className="topbar">
      <div className="row gap3">
        <span className="h3 hide-mobile">{titles[page] || 'Tazul'}</span>
        <div className="show-mobile"><Logo size={18} wordmark={false} /></div>
      </div>
      <div className="row gap3">
        <button className="btn btn-icon btn-ghost btn-sm hide-mobile"><Icon name="search" size={16} /></button>
        <span className="streak-badge"><Icon name="flame" size={13} fill />{u.streak} days</span>
        <button className="row gap2" onClick={() => go('profile')} style={{ cursor: 'pointer' }}>
          <Avatar name={u.display} size={32} />
          <span className="hide-mobile" style={{ fontSize: 13.5, fontWeight: 600 }}>{u.display}</span>
        </button>
      </div>
    </div>
  );
}

function Sidebar({ page, go }) {
  return (
    <aside className="sidebar">
      <div style={{ padding: '4px 8px 22px' }}><Logo size={20} /></div>
      <nav className="col" style={{ gap: 3 }}>
        {NAV.map(n => (
          <button key={n.id} className={['nav-item', page === n.id && 'active'].filter(Boolean).join(' ')} onClick={() => go(n.id)}>
            <Icon name={n.icon} size={19} /> {n.label}
          </button>
        ))}
      </nav>
      <div className="grow" />
      <button className="nav-item" onClick={() => go('library')} style={{ marginBottom: 4 }}>
        <Icon name="grid" size={19} /> Design System
      </button>
      <div className="card" style={{ padding: 14, background: 'var(--surface)' }}>
        <div className="row gap2" style={{ marginBottom: 6 }}><Icon name="bolt" size={14} className="amber" /><span style={{ fontSize: 12.5, fontWeight: 700 }}>Pecker Pro</span></div>
        <div className="t3" style={{ fontSize: 11.5, marginBottom: 10 }}>Unlimited sets, engine analysis, Elite Warehouse.</div>
        <Button size="sm" variant="amber" className="btn-block">Upgrade</Button>
      </div>
    </aside>
  );
}

function MobileNav({ page, go }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'practice', label: 'Practice', icon: 'practice' },
    { id: 'play', label: 'Train', icon: 'bolt' },
    { id: 'profile', label: 'Profile', icon: 'profile' },
    { id: 'library', label: 'System', icon: 'grid' },
  ];
  return (
    <nav className="mobile-nav">
      {items.map(n => (
        <button key={n.id} className={['m-item', page === n.id && 'active'].filter(Boolean).join(' ')} onClick={() => go(n.id)}>
          <Icon name={n.icon} size={21} /> {n.label}
        </button>
      ))}
    </nav>
  );
}

function App() {
  const [page, setPage] = uSA(() => {
    const h = (window.location.hash || '').replace('#', '');
    return h && h !== 'landing' ? h : 'landing';
  });
  const [opts, setOpts] = uSA({});
  const [showCreate, setShowCreate] = uSA(false);

  const go = (p, o = {}) => { setOpts(o); setPage(p); window.location.hash = p; window.scrollTo(0, 0); };

  uEA(() => {
    const onHash = () => { const h = (window.location.hash || '').replace('#', '') || 'landing'; setPage(h); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  uEA(() => { document.title = 'Tazul Chess — ' + (page[0].toUpperCase() + page.slice(1)); }, [page]);

  if (page === 'landing') return <Landing go={go} />;

  let content;
  switch (page) {
    case 'dashboard': content = <Dashboard go={go} />; break;
    case 'practice': content = <PracticeHub go={go} openCreate={() => setShowCreate(true)} />; break;
    case 'play': content = <PlayPage go={go} setName={opts.setName} />; break;
    case 'setcomplete': content = <SetComplete go={go} />; break;
    case 'profile': content = <Profile go={go} />; break;
    case 'library': content = <ComponentLibrary />; break;
    case 'openings': content = <OpeningsModule />; break;
    case 'warehouse': content = <WarehouseModule />; break;
    default: content = <Dashboard go={go} />;
  }

  return (
    <div className="app">
      <Sidebar page={page} go={go} />
      <main className="main">
        <Topbar page={page} go={go} />
        {content}
      </main>
      <MobileNav page={page} go={go} />
      {showCreate && <CreateSet onClose={() => setShowCreate(false)} go={(p, o) => { setShowCreate(false); go(p, o); }} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
