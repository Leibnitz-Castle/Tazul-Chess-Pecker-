/* ============================================================
   Elite Chess Data Warehouse +2600 — data
   Game move lists are legal SAN; positions computed via chess.js.
   ============================================================ */

// ---- two fully-annotated games for the viewer (legal SAN) ----
const WH_GAME_RUY = {
  id: 'g-2401', white: 'Caruana, Fabiano', whiteElo: 2805, black: 'Nepomniachtchi, Ian', blackElo: 2792,
  result: '1-0', eco: 'C88', opening: 'Ruy Lopez, Closed', event: 'FIDE Candidates', date: '2024.04.07', round: '7',
  moves: ['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','d6','c3','O-O','h3','Na5','Bc2','c5','d4','Qc7','Nbd2','cxd4','cxd4','Nc6','Nb3','a5','Be3','a4','Nbd2','Bd7'],
  // move quality keyed by ply index (0-based): best | inaccuracy | mistake | blunder
  quality: { 17: 'inaccuracy', 23: 'best', 27: 'mistake', 30: 'best' },
};
const WH_GAME_NAJ = {
  id: 'g-2402', white: 'Firouzja, Alireza', whiteElo: 2760, black: 'Ding, Liren', blackElo: 2788,
  result: '0-1', eco: 'B90', opening: 'Sicilian, Najdorf — English Attack', event: 'Tata Steel Masters', date: '2024.01.20', round: '11',
  moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Be3','e5','Nb3','Be6','f3','Be7','Qd2','O-O','O-O-O','Nbd7','g4','b5','g5','b4','Ne2','Ne8','f4','a5','f5','a4'],
  quality: { 20: 'best', 23: 'inaccuracy', 26: 'mistake', 29: 'blunder' },
};
const WH_GAMES_FULL = { 'g-2401': WH_GAME_RUY, 'g-2402': WH_GAME_NAJ };

// ---- games browser table rows ----
const PLAYERS_POOL = [
  ['Carlsen, Magnus', 2830], ['Nakamura, Hikaru', 2802], ['Caruana, Fabiano', 2805],
  ['Nepomniachtchi, Ian', 2792], ['Ding, Liren', 2788], ['Firouzja, Alireza', 2760],
  ['Abdusattorov, Nodirbek', 2766], ['Gukesh, D', 2752], ['Praggnanandhaa, R', 2748],
  ['Wei, Yi', 2756], ['So, Wesley', 2757], ['Giri, Anish', 2749],
  ['Mamedyarov, Shakhriyar', 2740], ['Rapport, Richard', 2733],
];
const EVENTS = ['FIDE Candidates 2024', 'Tata Steel Masters', 'Norway Chess', 'Sinquefield Cup', 'Grand Chess Tour', 'World Rapid', 'Chess Olympiad', 'Superbet Classic'];
const OPENINGS = [
  ['C88', 'Ruy Lopez, Closed'], ['B90', 'Sicilian, Najdorf'], ['D37', 'QGD, Harrwitz'],
  ['E60', "King's Indian"], ['C54', 'Italian, Giuoco Piano'], ['B12', 'Caro-Kann, Advance'],
  ['A05', 'Réti Opening'], ['D85', 'Grünfeld, Exchange'], ['C42', 'Petroff Defense'],
  ['E20', 'Nimzo-Indian'], ['B33', 'Sicilian, Sveshnikov'], ['A29', 'English, Four Knights'],
];
const RESULTS = ['1-0', '0-1', '½-½', '½-½', '½-½'];

function mulberryWH(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const WH_GAMES = (() => {
  const rnd = mulberryWH(2600); const out = [];
  // seed the two real annotated games first
  out.push({ id: WH_GAME_RUY.id, date: WH_GAME_RUY.date, white: WH_GAME_RUY.white, whiteElo: WH_GAME_RUY.whiteElo, black: WH_GAME_RUY.black, blackElo: WH_GAME_RUY.blackElo, result: WH_GAME_RUY.result, eco: WH_GAME_RUY.eco, opening: WH_GAME_RUY.opening, event: WH_GAME_RUY.event, moveCount: 41, analysis: 'analyzed' });
  out.push({ id: WH_GAME_NAJ.id, date: WH_GAME_NAJ.date, white: WH_GAME_NAJ.white, whiteElo: WH_GAME_NAJ.whiteElo, black: WH_GAME_NAJ.black, blackElo: WH_GAME_NAJ.blackElo, result: WH_GAME_NAJ.result, eco: WH_GAME_NAJ.eco, opening: WH_GAME_NAJ.opening, event: WH_GAME_NAJ.event, moveCount: 56, analysis: 'analyzed' });
  for (let i = 0; i < 42; i++) {
    let wi = Math.floor(rnd() * PLAYERS_POOL.length), bi = Math.floor(rnd() * PLAYERS_POOL.length);
    if (bi === wi) bi = (bi + 1) % PLAYERS_POOL.length;
    const [white, wb] = PLAYERS_POOL[wi], [black, bb] = PLAYERS_POOL[bi];
    const wElo = wb + Math.floor((rnd() - 0.5) * 30), bElo = bb + Math.floor((rnd() - 0.5) * 30);
    const [eco, opening] = OPENINGS[Math.floor(rnd() * OPENINGS.length)];
    const result = RESULTS[Math.floor(rnd() * RESULTS.length)];
    const month = String(1 + Math.floor(rnd() * 5)).padStart(2, '0'), day = String(1 + Math.floor(rnd() * 27)).padStart(2, '0');
    const analysis = rnd() > 0.78 ? 'queued' : rnd() > 0.18 ? 'analyzed' : 'pending';
    out.push({ id: 'g-' + (2403 + i), date: `2024.${month}.${day}`, white, whiteElo: wElo, black, blackElo: bElo,
      result, eco, opening, event: EVENTS[Math.floor(rnd() * EVENTS.length)], moveCount: 28 + Math.floor(rnd() * 56), analysis });
  }
  return out;
})();

// ---- hub stats ----
const WH_STATS = {
  totalGames: 248910, totalPlayers: 1284, totalPositions: 9420755,
  lastImport: '2 hours ago', analyzedPct: 0.62, newThisWeek: 3120,
};

// ---- recent imports ----
const WH_IMPORTS = [
  { id: 'imp-301', file: 'twic1574.pgn', source: 'TWIC', games: 3120, kept: 842, status: 'done', date: '2h ago', size: '4.2 MB' },
  { id: 'imp-300', file: 'candidates_2024.pgn', source: 'ChessBase', games: 91, kept: 91, status: 'done', date: 'Yesterday', size: '212 KB' },
  { id: 'imp-299', file: 'tata_steel_2024.pgn', source: 'Custom', games: 182, kept: 182, status: 'processing', date: 'Yesterday', size: '498 KB' },
  { id: 'imp-298', file: 'norway_blitz.pgn', source: 'TWIC', games: 240, kept: 0, status: 'failed', date: '2 days ago', size: '610 KB' },
  { id: 'imp-297', file: 'olympiad_open.pgn', source: 'ChessBase', games: 4400, kept: 1203, status: 'done', date: '3 days ago', size: '8.1 MB' },
  { id: 'imp-296', file: 'pasted_games.pgn', source: 'Paste', games: 12, kept: 9, status: 'queued', date: '3 days ago', size: '28 KB' },
];

// ---- data quality metrics ----
const WH_QUALITY = [
  { label: 'Complete metadata', value: 0.94 },
  { label: 'ECO classified', value: 0.99 },
  { label: 'FEN extracted', value: 0.88 },
  { label: 'Stockfish analyzed', value: 0.62 },
  { label: 'Deduplicated', value: 0.97 },
];

// ---- elite trends (recent) ----
const WH_TRENDS = [
  { eco: 'C88', name: 'Ruy Lopez, Anti-Marshall', games: 412, whiteScore: 0.56, trend: +8 },
  { eco: 'B90', name: 'Najdorf, English Attack', games: 388, whiteScore: 0.52, trend: +14 },
  { eco: 'D37', name: 'QGD, Harrwitz Attack', games: 351, whiteScore: 0.58, trend: -3 },
  { eco: 'C54', name: 'Italian, Giuoco Pianissimo', games: 506, whiteScore: 0.49, trend: +21 },
  { eco: 'A05', name: 'Réti, King\u2019s Indian Attack', games: 288, whiteScore: 0.54, trend: +5 },
];

// ---- opening analytics comparison ----
const WH_OPENING_STATS = [
  { eco: 'C88', name: 'Ruy Lopez, Closed', games: 1840, white: 0.38, draw: 0.50, black: 0.12, avg: 41, trend: +6 },
  { eco: 'B90', name: 'Sicilian, Najdorf', games: 2104, white: 0.36, draw: 0.40, black: 0.24, avg: 45, trend: +14 },
  { eco: 'C54', name: 'Italian, Giuoco Piano', games: 1620, white: 0.34, draw: 0.52, black: 0.14, avg: 38, trend: +21 },
  { eco: 'D37', name: 'QGD, Harrwitz', games: 1402, white: 0.40, draw: 0.48, black: 0.12, avg: 42, trend: -3 },
  { eco: 'E20', name: 'Nimzo-Indian', games: 1190, white: 0.35, draw: 0.49, black: 0.16, avg: 44, trend: +2 },
  { eco: 'B12', name: 'Caro-Kann, Advance', games: 980, white: 0.37, draw: 0.45, black: 0.18, avg: 43, trend: +9 },
  { eco: 'D85', name: 'Grünfeld, Exchange', games: 870, white: 0.39, draw: 0.42, black: 0.19, avg: 46, trend: -5 },
  { eco: 'C42', name: 'Petroff Defense', games: 760, white: 0.30, draw: 0.62, black: 0.08, avg: 36, trend: -8 },
];

// timeline: top 3 openings share over 8 quarters
const WH_TIMELINE = {
  labels: ['Q1\u201922', 'Q2', 'Q3', 'Q4', 'Q1\u201923', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: 'Italian', color: '#C8A96B', data: [9, 11, 13, 14, 16, 18, 19, 21] },
    { name: 'Najdorf', color: '#6E8BAB', data: [14, 13, 13, 12, 12, 13, 14, 15] },
    { name: 'Ruy Lopez', color: '#4E8A62', data: [18, 17, 16, 15, 14, 13, 12, 11] },
  ],
};

// ---- players ----
const WH_PLAYERS = PLAYERS_POOL.map(([name, elo], i) => {
  const titles = ['GM']; const countries = ['NOR', 'USA', 'USA', 'RUS', 'CHN', 'FRA', 'UZB', 'IND', 'IND', 'CHN', 'USA', 'NED', 'AZE', 'HUN'];
  const rnd = mulberryWH(elo + i);
  const games = 200 + Math.floor(rnd() * 1400);
  const w = 0.28 + rnd() * 0.12, d = 0.4 + rnd() * 0.18, l = 1 - w - d;
  return { id: 'p-' + i, name, title: 'GM', country: countries[i], elo, games,
    wdl: [w, d, l], peak: elo + Math.floor(rnd() * 40),
    openings: [OPENINGS[i % OPENINGS.length], OPENINGS[(i + 3) % OPENINGS.length], OPENINGS[(i + 6) % OPENINGS.length]].map(o => o[1]) };
});

// ---- stockfish queue ----
const WH_SF_QUEUE = [
  { id: 'sf-1', fen: 'r2q1rk1/1b1nbppp/p2ppn2/1p6/3NP3/1BN1B3/PPP2PPP/R2Q1RK1 w - - 0 1', game: 'g-2401', depth: 99, status: 'analyzing', progress: 0.74, eval: '+0.42' },
  { id: 'sf-2', fen: 'rnbq1rk1/pp2ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b - - 0 1', game: 'g-2415', depth: 0, status: 'queued', progress: 0, eval: '—' },
  { id: 'sf-3', fen: 'r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R w - - 0 1', game: 'g-2422', depth: 0, status: 'queued', progress: 0, eval: '—' },
  { id: 'sf-4', fen: '8/2p2pk1/p2p2p1/1p1Pp2p/1P2P3/P1P2P2/6PK/8 w - - 0 1', game: 'g-2418', depth: 99, status: 'done', progress: 1, eval: '+1.18' },
];
const WH_SF_DONE = [
  { fen: 'g-2401 · move 16', eval: '+0.42', best: 'Bd2', depth: 99, time: '4.2s' },
  { fen: 'g-2402 · move 28', eval: '\u22121.18', best: 'f4', depth: 99, time: '5.1s' },
  { fen: 'g-2418 · move 41', eval: '+1.18', best: 'Kg3', depth: 99, time: '3.8s' },
];

// ---- recommendations ----
const WH_RECS = [
  { id: 'rec-1', title: 'Anti-Marshall is surging at the top', eco: 'C88', reason: 'Appears in 7 of your repertoire lines and trending +8% among 2700+ this quarter.', games: 412, players: ['Caruana', 'Nepo', 'So'], severity: 'trend', fen: fenAtPlySafe(['e4','e5','Nf3','Nc6','Bb5','a6','Ba4','Nf6','O-O','Be7','Re1','b5','Bb3','O-O','h3']) },
  { id: 'rec-2', title: 'Najdorf 6.Be3 line underprepared', eco: 'B90', reason: 'Your mastery here is 71% but elite usage rose 14%. Several critical novelties unstudied.', games: 388, players: ['Firouzja', 'Ding', 'Wei'], severity: 'weak', fen: fenAtPlySafe(['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Be3','e5','Nb3','Be6']) },
  { id: 'rec-3', title: 'New TWIC pattern: Italian with h3 + Re1', eco: 'C54', reason: 'Appeared 21 times in the last TWIC archive — a fresh elite trend not yet in your sets.', games: 506, players: ['Carlsen', 'Gukesh', 'Prag'], severity: 'new', fen: fenAtPlySafe(['e4','e5','Nf3','Nc6','Bc4','Bc5','c3','Nf6','d3','d6','h3','O-O','O-O']) },
];

// ---- pipeline ----
const WH_WORKERS = [
  { id: 'w1', name: 'parser-01', status: 'busy', task: 'twic1574.pgn', load: 0.82 },
  { id: 'w2', name: 'parser-02', status: 'idle', task: '—', load: 0.04 },
  { id: 'w3', name: 'stockfish-01', status: 'busy', task: 'g-2401 d99', load: 0.97 },
  { id: 'w4', name: 'stockfish-02', status: 'busy', task: 'g-2415 d99', load: 0.91 },
  { id: 'w5', name: 'normalizer', status: 'idle', task: '—', load: 0.11 },
];
const WH_LOG = [
  { t: '14:22:07', lvl: 'info', msg: 'Import imp-301 started · twic1574.pgn (3120 games)' },
  { t: '14:22:09', lvl: 'info', msg: 'Validation passed · 3120/3120 headers well-formed' },
  { t: '14:22:14', lvl: 'info', msg: 'Filtering +2600 · 842 games retained, 2278 discarded' },
  { t: '14:22:31', lvl: 'warn', msg: 'Player name normalized: "Nepomniachtchi,I" → "Nepomniachtchi, Ian"' },
  { t: '14:22:48', lvl: 'info', msg: 'FEN extraction · 842 games · 38104 positions' },
  { t: '14:23:02', lvl: 'error', msg: 'Stockfish worker sf-03 timeout at depth 99 · re-queued' },
  { t: '14:23:05', lvl: 'info', msg: 'Dedup · 11 duplicates skipped' },
  { t: '14:23:19', lvl: 'info', msg: 'Stored 831 games · 6 flagged for manual review' },
];
const WH_DB_STATS = [
  ['Games', '248,910'], ['Positions', '9.42 M'], ['Players', '1,284'], ['DB size', '14.2 GB'],
  ['Avg query', '38 ms'], ['Uptime', '99.98%'],
];

// import wizard sources
const WH_SOURCES = [
  { id: 'file', icon: 'upload', title: 'Single PGN File', body: 'Upload one .pgn from your machine.' },
  { id: 'twic', icon: 'warehouse', title: 'TWIC Archive', body: 'This Week in Chess weekly bulletins.' },
  { id: 'cb', icon: 'layers', title: 'ChessBase Export', body: 'Exported .pgn from ChessBase databases.' },
  { id: 'paste', icon: 'openings', title: 'Paste PGN Text', body: 'Drop raw PGN directly into a textarea.' },
];

function fenAtPlySafe(moves) {
  try { const g = new window.Chess(); moves.forEach(m => { try { g.move(m); } catch (e) {} }); return g.fen(); }
  catch (e) { return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; }
}

Object.assign(window, {
  WH_GAMES, WH_GAMES_FULL, WH_GAME_RUY, WH_GAME_NAJ, WH_STATS, WH_IMPORTS, WH_QUALITY,
  WH_TRENDS, WH_OPENING_STATS, WH_TIMELINE, WH_PLAYERS, WH_SF_QUEUE, WH_SF_DONE,
  WH_RECS, WH_WORKERS, WH_LOG, WH_DB_STATS, WH_SOURCES,
});
