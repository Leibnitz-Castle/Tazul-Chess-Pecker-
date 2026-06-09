import { z } from "zod";

export const TrainingFiltersSchema = z.object({
  chapter: z.string().optional(),
  difficulty: z.enum(["easy", "intermediate", "advanced"]).optional(),
  side_to_move: z.enum(["w", "b"]).optional(),
  source_name: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const PuzzleAttemptSchema = z.object({
  training_item_id: z.string().uuid(),
  is_correct: z.boolean(),
  move_played: z.string().min(4).max(5),
  expected_move: z.string().min(4).max(5),
  time_ms: z.number().min(0),
});

export type TrainingFiltersInput = z.infer<typeof TrainingFiltersSchema>;
export type PuzzleAttemptInput = z.infer<typeof PuzzleAttemptSchema>;
