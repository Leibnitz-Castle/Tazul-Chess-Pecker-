/* ============================================================
   Tazul Chess — mock data
   All puzzles are single best-move tactics with real, legal FENs.
   solution = UCI string (e.g. "e4f6", "a7a8q" for promotion).
   ============================================================ */

const PUZZLES = [
  {
    id: 'TZ-1a4f', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    solution: 'a1a8', sideToMove: 'w',
    themes: ['Back Rank', 'Mate in 1'], rating: 1104,
    game: 'Capablanca — Tartakower, New York 1924',
    prompt: 'White to move and mate.',
  },
  {
    id: 'TZ-2b7c', fen: '4k3/8/8/1N1q4/8/8/8/4K3 w - - 0 1',
    solution: 'b5c7', sideToMove: 'w',
    themes: ['Fork', 'Knight'], rating: 1312,
    game: 'Training position',
    prompt: 'White to move and win the queen.',
  },
  {
    id: 'TZ-3e6f', fen: '4r1k1/8/8/8/4N3/8/8/6K1 w - - 0 1',
    solution: 'e4f6', sideToMove: 'w',
    themes: ['Fork', 'Knight'], rating: 1258,
    game: 'Training position',
    prompt: 'White to move and win the exchange.',
  },
  {
    id: 'TZ-4d8d', fen: '6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1',
    solution: 'd1d8', sideToMove: 'w',
    themes: ['Back Rank', 'Mate in 1'], rating: 948,
    game: 'Training position',
    prompt: 'White to move and mate.',
  },
  {
    id: 'TZ-5skw', fen: '1r4k1/6pp/5p2/8/8/8/8/3Q2K1 w - - 0 1',
    solution: 'd1d8', sideToMove: 'w',
    themes: ['Skewer', 'Double Attack'], rating: 1407,
    game: 'Training position',
    prompt: 'White to move and win material.',
  },
  {
    id: 'TZ-6prm', fen: '8/P5k1/8/8/8/8/6K1/8 w - - 0 1',
    solution: 'a7a8q', sideToMove: 'w',
    themes: ['Promotion', 'Endgame'], rating: 712,
    game: 'Training position',
    prompt: 'White to move — promote.',
  },
  {
    id: 'TZ-7smo', fen: '6rk/6pp/7N/8/8/8/8/6K1 w - - 0 1',
    solution: 'h6f7', sideToMove: 'w',
    themes: ['Smothered Mate', 'Mate in 1'], rating: 1521,
    game: 'Classic mating pattern',
    prompt: 'White to move and mate.',
  },
  {
    id: 'TZ-8hng', fen: '6k1/5ppp/8/8/8/8/8/r2Q2K1 w - - 0 1',
    solution: 'd1a1', sideToMove: 'w',
    themes: ['Hanging Piece'], rating: 803,
    game: 'Training position',
    prompt: 'White to move and win a rook.',
  },
];

const THEMES = [
  'Fork', 'Pin', 'Skewer', 'Discovered Attack', 'Double Attack',
  'Mate in 1', 'Mate in 2', 'Back Rank', 'Smothered Mate', 'Hanging Piece',
  'Deflection', 'Decoy', 'Zwischenzug', 'Promotion', 'Endgame', 'Sacrifice',
];

const SETS = [
  { id: 's1', name: 'Knight Forks — Core', themes: ['Fork', 'Knight'], total: 80, done: 52,
    cycle: 2, due: 'Today', ratingRange: [1200, 1500], status: 'due', accuracy: 0.81 },
  { id: 's2', name: 'Back-Rank Patterns', themes: ['Back Rank', 'Mate in 1'], total: 60, done: 60,
    cycle: 3, due: 'in 4 days', ratingRange: [900, 1300], status: 'completed', accuracy: 0.93 },
  { id: 's3', name: 'Endgame Conversions', themes: ['Endgame', 'Promotion'], total: 120, done: 34,
    cycle: 1, due: 'Today', ratingRange: [1100, 1600], status: 'active', accuracy: 0.74 },
  { id: 's4', name: 'Pins & Skewers', themes: ['Pin', 'Skewer'], total: 45, done: 12,
    cycle: 1, due: 'Tomorrow', ratingRange: [1300, 1700], status: 'active', accuracy: 0.68 },
  { id: 's5', name: 'Greek Gift & Sacrifices', themes: ['Sacrifice', 'Double Attack'], total: 50, done: 0,
    cycle: 0, due: 'New', ratingRange: [1600, 2000], status: 'active', accuracy: null },
  { id: 's6', name: 'Mate in 2 — Tournament', themes: ['Mate in 2'], total: 100, done: 100,
    cycle: 4, due: 'in 9 days', ratingRange: [1500, 1900], status: 'completed', accuracy: 0.88 },
];

const USER = {
  name: 'tazul_gm', display: 'Tazul', lichess: 'tazul_gm',
  rating: 2143, puzzleElo: 2287, title: 'NM',
  streak: 7, longest: 41, bestAccuracy: 0.96,
  totalSolved: 14820, solvedToday: 18, dailyGoal: 30,
};

const WEAK_AREAS = [
  { theme: 'Pin', accuracy: 0.61, attempts: 142 },
  { theme: 'Zwischenzug', accuracy: 0.64, attempts: 88 },
  { theme: 'Deflection', accuracy: 0.69, attempts: 121 },
];

const THEME_ACCURACY = [
  { theme: 'Fork', acc: 0.88 }, { theme: 'Back Rank', acc: 0.93 },
  { theme: 'Pin', acc: 0.61 }, { theme: 'Skewer', acc: 0.79 },
  { theme: 'Discovered', acc: 0.72 }, { theme: 'Sacrifice', acc: 0.66 },
  { theme: 'Endgame', acc: 0.74 }, { theme: 'Deflection', acc: 0.69 },
];

const RADAR = [
  { axis: 'Fork', value: 0.88 }, { axis: 'Pin', value: 0.61 },
  { axis: 'Skewer', value: 0.79 }, { axis: 'Mate', value: 0.9 },
  { axis: 'Endgame', value: 0.74 }, { axis: 'Sacrifice', value: 0.66 },
];

// ---- deterministic pseudo-random for stable charts/heatmaps ----
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 30-day rating performance series
const PERF_SERIES = (() => {
  const rnd = mulberry32(42); let v = 2180; const out = [];
  for (let i = 0; i < 30; i++) { v += (rnd() - 0.45) * 26; out.push(Math.round(v)); }
  out[out.length - 1] = USER.puzzleElo; return out;
})();

// 12-month activity heatmap: array of weeks, each 7 days, value 0..4
const ACTIVITY = (() => {
  const rnd = mulberry32(7); const weeks = [];
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const r = rnd();
      let lvl = r > 0.82 ? 4 : r > 0.66 ? 3 : r > 0.45 ? 2 : r > 0.25 ? 1 : 0;
      if (w >= 50 && d <= 4) lvl = Math.max(lvl, 2); // recent streak
      days.push(lvl);
    }
    weeks.push(days);
  }
  return weeks;
})();

// small 7x7 heatmap for the dashboard "current streak" card (last 49 days)
const STREAK_MINI = (() => {
  const rnd = mulberry32(13); const cells = [];
  for (let i = 0; i < 49; i++) {
    const r = rnd();
    let lvl = r > 0.8 ? 4 : r > 0.6 ? 3 : r > 0.4 ? 2 : r > 0.22 ? 1 : 0;
    if (i >= 42) lvl = Math.max(lvl, 3); // last 7 days = streak
    cells.push(lvl);
  }
  return cells;
})();

const RECOMMENDED = [
  { id: 'r1', theme: 'Pin', rating: 1380, fen: '1r4k1/6pp/5p2/8/8/8/8/3Q2K1 w - - 0 1', why: 'Weak area' },
  { id: 'r2', theme: 'Deflection', rating: 1290, fen: '4r1k1/8/8/8/4N3/8/8/6K1 w - - 0 1', why: 'Weak area' },
  { id: 'r3', theme: 'Zwischenzug', rating: 1450, fen: '4k3/8/8/1N1q4/8/8/8/4K3 w - - 0 1', why: 'Below 70%' },
];

const RECENT_SESSIONS = [
  { date: 'Today, 09:14', set: 'Knight Forks — Core', solved: 18, acc: 0.83, delta: +12 },
  { date: 'Yesterday', set: 'Endgame Conversions', solved: 24, acc: 0.71, delta: -6 },
  { date: 'Jun 5', set: 'Back-Rank Patterns', solved: 30, acc: 0.93, delta: +21 },
  { date: 'Jun 4', set: 'Pins & Skewers', solved: 15, acc: 0.67, delta: -3 },
  { date: 'Jun 2', set: 'Mate in 2 — Tournament', solved: 40, acc: 0.88, delta: +9 },
];

Object.assign(window, {
  PUZZLES, THEMES, SETS, USER, WEAK_AREAS, THEME_ACCURACY, RADAR,
  PERF_SERIES, ACTIVITY, STREAK_MINI, RECOMMENDED, RECENT_SESSIONS,
});
