// ── Existing types ─────────────────────────────────────────────────────────

export type SideToMove = "w" | "b";
export type Difficulty = "easy" | "intermediate" | "advanced";
export type ItemType = "calculation";

export interface TrainingItem {
  id: string;
  fen: string;
  side_to_move: SideToMove;
  solution_moves: string[];
  solution_san: string | null;
  source_name: string;
  source_author: string;
  source_year: number;
  chapter: string | null;
  exercise_number: number | null;
  difficulty: Difficulty | null;
  theme: string | null;
  tags: string[];
  item_type: ItemType;
  created_at: string;
}

export interface PuzzleAttempt {
  id: string;
  training_item_id: string;
  is_correct: boolean;
  move_played: string;
  expected_move: string;
  time_ms: number;
  created_at: string;
}

export interface TrainingFilters {
  chapter?: string;
  difficulty?: Difficulty;
  side_to_move?: SideToMove;
  source_name?: string;
  limit?: number;
  offset?: number;
}

export interface PuzzleMoveResult {
  isCorrect: boolean;
  userUci: string;
  expectedUci: string;
}

// ── Woodpecker series types ────────────────────────────────────────────────

export type SeriesMode = "CHAPTER" | "FULL_BOOK" | "FAILED_ONLY" | "CUSTOM";
export type SeriesStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type CycleStatus = "ACTIVE" | "COMPLETED";

export interface TrainingSeries {
  id: string;
  devUserId: string;
  title: string;
  sourceName: string;
  chapter: string | null;
  mode: SeriesMode;
  status: SeriesStatus;
  totalItems: number;
  currentIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCycle {
  id: string;
  seriesId: string;
  cycleNumber: number;
  status: CycleStatus;
  startedAt: string;
  completedAt: string | null;
  totalExercises: number;
  solvedCount: number;
  correctCount: number;
  incorrectCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  accuracy: number;
  bestStreak: number;
  createdAt: string;
}

export interface ExerciseAttempt {
  id: string;
  trainingItemId: string;
  seriesId: string;
  cycleId: string;
  movePlayed: string;
  expectedMove: string;
  isCorrect: boolean;
  timeMs: number;
  attemptNumber: number;
  fen: string;
  createdAt: string;
}

export interface SeriesWithCycle {
  series: TrainingSeries;
  activeCycle: TrainingCycle | null;
  currentExercise: TrainingItem | null;
  solvedInCycle: number;
  progress: {
    current: number;
    total: number;
    pct: number;
  };
}

// ── API request/response types ─────────────────────────────────────────────

export interface CreateSeriesBody {
  sourceName: string;
  chapter?: string;
  mode?: SeriesMode;
  includeIntroduction?: boolean;
  limit?: number;
}

export interface RecordAttemptBody {
  trainingItemId: string;
  movePlayed: string;
  expectedMove: string;
  isCorrect: boolean;
  timeMs: number;
  fen: string;
  attemptNumber: number;
}

export interface AttemptResponse {
  attempt: ExerciseAttempt;
  nextExerciseId: string | null;
  isLastExercise: boolean;
  progress: {
    current: number;
    total: number;
    pct: number;
  };
  cycleStats: Pick<
    TrainingCycle,
    | "solvedCount"
    | "correctCount"
    | "incorrectCount"
    | "accuracy"
    | "averageTimeMs"
    | "bestStreak"
  >;
}

// ── Profile / stats ────────────────────────────────────────────────────────

export interface WoodpeckerStats {
  totalSolved: number;
  totalCorrect: number;
  accuracy: number;
  averageTimeMs: number;
  bestStreak: number;
  wm1Progress: number;   // 0–1 fraction of WM1 exercises solved at least once
  wm2Progress: number;   // 0–1
  activeSeries: TrainingSeries[];
  recentCycles: Array<TrainingCycle & { seriesTitle: string }>;
  cycleComparisons: Array<{
    seriesTitle: string;
    cycles: TrainingCycle[];
  }>;
}
