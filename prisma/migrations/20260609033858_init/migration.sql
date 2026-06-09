-- CreateTable
CREATE TABLE "training_items" (
    "id" TEXT NOT NULL,
    "source_id" TEXT,
    "fen" TEXT NOT NULL,
    "side_to_move" TEXT NOT NULL,
    "solution_moves" TEXT[],
    "solution_san" TEXT,
    "source_name" TEXT NOT NULL,
    "source_author" TEXT NOT NULL,
    "source_year" INTEGER NOT NULL,
    "chapter" TEXT,
    "exercise_number" INTEGER,
    "difficulty" TEXT,
    "theme" TEXT,
    "tags" TEXT[],
    "item_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puzzle_attempts" (
    "id" TEXT NOT NULL,
    "training_item_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "move_played" TEXT NOT NULL,
    "expected_move" TEXT NOT NULL,
    "time_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_items_difficulty_idx" ON "training_items"("difficulty");

-- CreateIndex
CREATE INDEX "training_items_chapter_idx" ON "training_items"("chapter");

-- CreateIndex
CREATE INDEX "training_items_side_to_move_idx" ON "training_items"("side_to_move");

-- CreateIndex
CREATE INDEX "training_items_source_name_idx" ON "training_items"("source_name");

-- CreateIndex
CREATE INDEX "training_items_chapter_difficulty_idx" ON "training_items"("chapter", "difficulty");

-- CreateIndex
CREATE INDEX "puzzle_attempts_training_item_id_idx" ON "puzzle_attempts"("training_item_id");

-- CreateIndex
CREATE INDEX "puzzle_attempts_created_at_idx" ON "puzzle_attempts"("created_at");

-- AddForeignKey
ALTER TABLE "puzzle_attempts" ADD CONSTRAINT "puzzle_attempts_training_item_id_fkey" FOREIGN KEY ("training_item_id") REFERENCES "training_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
