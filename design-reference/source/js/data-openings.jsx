/* ============================================================
   Aperturas Pecker — opening repertoire data
   Lines stored as SAN arrays. Positions computed live via chess.js.
   side = the color the player trains (their moves are the "answers").
   ============================================================ */

// status: 'mastered' | 'learning' | 'weak'
const LINES_WHITE = [
  { id: 'w-italian', eco: 'C50', name: 'Italian Game — Main', side: 'white',
    moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','c3','Nf6','d3','d6','O-O','O-O'],
    mastery: 0.92, status: 'mastered', lastPracticed: '2 days ago', priority: 'high',
    plan: 'Slow build-up with c3 and d3, prepare d4 break. Re1, Nbd2–f1–g3 regrouping.',
    error: 'Avoid early Ng5 ideas without preparation — Black equalizes with ...d5.',
    note: 'The backbone of the 1.e4 repertoire. Quiet, strategic, low theory.' },
  { id: 'w-evans', eco: 'C51', name: 'Evans Gambit', side: 'white',
    moves: ['e4','e5','Nf3','Nc6','Bc4','Bc5','b4','Bxb4','c3','Ba5','d4'],
    mastery: 0.64, status: 'learning', lastPracticed: '5 days ago', priority: 'medium',
    plan: 'Sacrifice a pawn for rapid development and a strong center with c3 and d4.',
    error: '...exd4 then cxd4 — do not recapture too early; keep the initiative.',
    note: 'Aggressive sideline. High reward against unprepared opponents.' },
  { id: 'w-ruy', eco: 'C65', name: 'Ruy Lopez — Berlin', side: 'white',
    moves: ['e4','e5','Nf3','Nc6','Bb5','Nf6','O-O','Nxe4','d4','Nd6','Bxc6','dxc6','dxe5','Nf5'],
    mastery: 0.48, status: 'weak', lastPracticed: '12 days ago', priority: 'high',
    plan: 'Endgame play — superior structure, target the c-pawns, restrict the bishop pair.',
    error: 'Qxd8+ then the king walks to e8 — do not rush; complete development first.',
    note: 'The Berlin Wall. Requires precise endgame technique.' },
  { id: 'w-scotch', eco: 'C45', name: 'Scotch Game', side: 'white',
    moves: ['e4','e5','Nf3','Nc6','d4','exd4','Nxd4','Nf6','Nxc6','bxc6','e5','Qe7'],
    mastery: 0.78, status: 'learning', lastPracticed: '1 day ago', priority: 'medium',
    plan: 'Open the center early, trade on c6 to damage the structure, e5 to gain space.',
    error: 'Qd2 is passive — Qe2 keeps the queen active and supports e5.',
    note: 'Direct and concrete. A good surprise weapon.' },
  { id: 'w-vienna', eco: 'C25', name: 'Vienna Game', side: 'white',
    moves: ['e4','e5','Nc3','Nf6','f4','d5','fxe5','Nxe4','Nf3'],
    mastery: 0.55, status: 'learning', lastPracticed: '8 days ago', priority: 'low',
    plan: 'Flexible king-side expansion with f4, often transposing to favorable structures.',
    error: 'Do not play exd5 automatically — it releases central tension too soon.',
    note: 'A sound, less-explored alternative to the open games.' },
];

const LINES_BLACK = [
  { id: 'b-najdorf', eco: 'B90', name: 'Sicilian Najdorf', side: 'black',
    moves: ['e4','c5','Nf3','d6','d4','cxd4','Nxd4','Nf6','Nc3','a6','Be3','e5','Nb3','Be6'],
    mastery: 0.71, status: 'learning', lastPracticed: '3 days ago', priority: 'high',
    plan: 'Flexible ...a6 and ...e5, fight for d5, develop with ...Be6, ...Nbd7, ...Be7.',
    error: 'Against 6.Be3, ...Ng4 only works after ...e5 — order matters.',
    note: 'The sharpest, most theory-rich defense. The crown jewel.' },
  { id: 'b-caro', eco: 'B12', name: 'Caro-Kann — Advance', side: 'black',
    moves: ['e4','c6','d4','d5','e5','Bf5','Nf3','e6','Be2','c5','Be3','Qb6'],
    mastery: 0.88, status: 'mastered', lastPracticed: 'Today', priority: 'high',
    plan: 'Solid structure, develop the light bishop outside the chain before ...e6.',
    error: '...Bf5 must come before ...e6 — otherwise the bishop is locked in.',
    note: 'Rock-solid. Low risk, reliable equality with chances.' },
  { id: 'b-kid', eco: 'E97', name: "King's Indian — Mar del Plata", side: 'black',
    moves: ['d4','Nf6','c4','g6','Nc3','Bg7','e4','d6','Nf3','O-O','Be2','e5','O-O','Nc6','d5','Ne7'],
    mastery: 0.42, status: 'weak', lastPracticed: '15 days ago', priority: 'high',
    plan: 'King-side pawn storm with ...f5–f4–g5, ignore the queenside, attack the king.',
    error: 'Do not delay ...Ne7 and ...f5 — tempo is everything in the race.',
    note: 'Uncompromising. A double-edged battle of opposite-wing attacks.' },
  { id: 'b-nimzo', eco: 'E32', name: 'Nimzo-Indian — Classical', side: 'black',
    moves: ['d4','Nf6','c4','e6','Nc3','Bb4','Qc2','O-O','a3','Bxc3+','Qxc3','b6'],
    mastery: 0.66, status: 'learning', lastPracticed: '4 days ago', priority: 'medium',
    plan: 'Trade the dark bishop for the knight, give White doubled c-pawns, blockade.',
    error: '...Bxc3+ only after a3 is forced — keep the pin as long as useful.',
    note: 'Strategic and principled. Damages White\u2019s structure for long-term play.' },
  { id: 'b-french', eco: 'C11', name: 'French — Classical', side: 'black',
    moves: ['e4','e6','d4','d5','Nc3','Nf6','e5','Nfd7','f4','c5','Nf3','Nc6'],
    mastery: 0.59, status: 'learning', lastPracticed: '6 days ago', priority: 'low',
    plan: 'Strike at the center with ...c5 and ...f6, exploit the cramped but solid setup.',
    error: 'Play ...c5 before ...f6 — premature ...f6 weakens e6 prematurely.',
    note: 'A resilient defense built on counterattacking the pawn chain.' },
];

const REPERTOIRES = [
  { id: 'rep-white', color: 'white', name: 'White — 1.e4 Repertoire',
    lines: LINES_WHITE, lastPracticed: '1 day ago',
    get total() { return this.lines.length; } },
  { id: 'rep-black', color: 'black', name: 'Black — Sicilian & Indians',
    lines: LINES_BLACK, lastPracticed: 'Today',
    get total() { return this.lines.length; } },
];

function repMastery(rep) {
  return rep.lines.reduce((a, l) => a + l.mastery, 0) / rep.lines.length;
}
function repDue(rep) { return rep.lines.filter(l => l.status !== 'mastered').length; }

const ALL_LINES = [...LINES_WHITE, ...LINES_BLACK];

// weakest positions for the weaknesses dashboard
const WEAK_LINES = ALL_LINES.filter(l => l.mastery < 0.7)
  .sort((a, b) => a.mastery - b.mastery)
  .map((l, i) => ({ ...l, failures: Math.round((1 - l.mastery) * 20) + 3, lastFailed: ['2 days ago', '5 days ago', 'Yesterday', '1 week ago', '3 days ago'][i % 5] }));

// mastery by opening family (for charts)
const FAMILY_MASTERY = [
  { family: 'Open Games', acc: 0.74 }, { family: 'Sicilian', acc: 0.71 },
  { family: 'Caro-Kann', acc: 0.88 }, { family: "King's Indian", acc: 0.42 },
  { family: 'Nimzo / QGD', acc: 0.66 }, { family: 'French', acc: 0.59 },
];

// ECO explorer reference data
const ECO_GROUPS = {
  A: { label: 'Flank Openings', range: 'A00–A99', color: '#6E8BAB' },
  B: { label: 'Semi-Open (excl. French)', range: 'B00–B99', color: '#C48A41' },
  C: { label: 'Open & French', range: 'C00–C99', color: '#C8A96B' },
  D: { label: 'Closed & Semi-Closed', range: 'D00–D99', color: '#4E8A62' },
  E: { label: 'Indian Defenses', range: 'E00–E99', color: '#A4795B' },
};

const ECO_ENTRIES = [
  { eco: 'A45', name: 'Trompowsky Attack', moves: '1.d4 Nf6 2.Bg5', inRep: false, group: 'A' },
  { eco: 'A10', name: 'English Opening', moves: '1.c4', inRep: false, group: 'A' },
  { eco: 'B90', name: 'Sicilian, Najdorf', moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6', inRep: true, group: 'B' },
  { eco: 'B12', name: 'Caro-Kann, Advance', moves: '1.e4 c6 2.d4 d5 3.e5', inRep: true, group: 'B' },
  { eco: 'B33', name: 'Sicilian, Sveshnikov', moves: '1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6', inRep: false, group: 'B' },
  { eco: 'C50', name: 'Italian Game', moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4', inRep: true, group: 'C' },
  { eco: 'C65', name: 'Ruy Lopez, Berlin', moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6', inRep: true, group: 'C' },
  { eco: 'C45', name: 'Scotch Game', moves: '1.e4 e5 2.Nf3 Nc6 3.d4', inRep: true, group: 'C' },
  { eco: 'C11', name: 'French, Classical', moves: '1.e4 e6 2.d4 d5 3.Nc3 Nf6', inRep: true, group: 'C' },
  { eco: 'C25', name: 'Vienna Game', moves: '1.e4 e5 2.Nc3', inRep: true, group: 'C' },
  { eco: 'D30', name: "Queen's Gambit Declined", moves: '1.d4 d5 2.c4 e6', inRep: false, group: 'D' },
  { eco: 'D85', name: 'Grünfeld Defense', moves: '1.d4 Nf6 2.c4 g6 3.Nc3 d5', inRep: false, group: 'D' },
  { eco: 'D10', name: 'Slav Defense', moves: '1.d4 d5 2.c4 c6', inRep: false, group: 'D' },
  { eco: 'E97', name: "King's Indian, Mar del Plata", moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6', inRep: true, group: 'E' },
  { eco: 'E32', name: 'Nimzo-Indian, Classical', moves: '1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2', inRep: true, group: 'E' },
  { eco: 'E60', name: "King's Indian Defense", moves: '1.d4 Nf6 2.c4 g6', inRep: false, group: 'E' },
];

// a model game for the viewer (Kasparov — Topalov style attacking game, abbreviated, real-ish)
const MODEL_GAME = {
  white: 'Kasparov, G.', whiteElo: 2851, black: 'Topalov, V.', blackElo: 2700,
  event: 'Hoogovens Wijk aan Zee', date: '1999.01.20', result: '1-0',
  eco: 'B07', opening: 'Pirc Defense',
  moves: ['e4','d6','d4','Nf6','Nc3','g6','Be3','Bg7','Qd2','c6','f3','b5','Nge2','Nbd7','Bh6','Bxh6','Qxh6','Bb7','a3','e5','O-O-O','Qe7'],
};

// PGN import preview sample
const PGN_SAMPLE = `[Event "Repertoire"]
[White "?"]
[Black "?"]
[ECO "C50"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O *`;

const IMPORT_PREVIEW = [
  { eco: 'C50', san: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6', ok: true },
  { eco: 'C51', san: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4', ok: true },
  { eco: 'C45', san: '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6', ok: true },
  { eco: '—', san: '1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 …', ok: true },
  { eco: '?', san: '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.O-O Nf6 5.d4?! exd4 (ambiguous)', ok: false },
];

Object.assign(window, {
  REPERTOIRES, LINES_WHITE, LINES_BLACK, ALL_LINES, WEAK_LINES,
  FAMILY_MASTERY, ECO_GROUPS, ECO_ENTRIES, MODEL_GAME, PGN_SAMPLE, IMPORT_PREVIEW,
  repMastery, repDue,
});
