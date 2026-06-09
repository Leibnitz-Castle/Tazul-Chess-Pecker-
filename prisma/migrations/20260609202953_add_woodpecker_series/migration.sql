-- CreateTable
CREATE TABLE "training_series" (
    "id" TEXT NOT NULL,
    "dev_user_id" TEXT NOT NULL DEFAULT 'dev-user-001',
    "title" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "chapter" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'CHAPTER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "total_items" INTEGER NOT NULL,
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_series_items" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "training_item_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_series_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_cycles" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "total_exercises" INTEGER NOT NULL,
    "solved_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "incorrect_count" INTEGER NOT NULL DEFAULT 0,
    "total_time_ms" INTEGER NOT NULL DEFAULT 0,
    "average_time_ms" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_attempts" (
    "id" TEXT NOT NULL,
    "training_item_id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "move_played" TEXT NOT NULL,
    "expected_move" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "time_ms" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "fen" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_series_dev_user_id_idx" ON "training_series"("dev_user_id");

-- CreateIndex
CREATE INDEX "training_series_status_idx" ON "training_series"("status");

-- CreateIndex
CREATE INDEX "training_series_items_series_id_idx" ON "training_series_items"("series_id");

-- CreateIndex
CREATE INDEX "training_series_items_training_item_id_idx" ON "training_series_items"("training_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_series_items_series_id_training_item_id_key" ON "training_series_items"("series_id", "training_item_id");

-- CreateIndex
CREATE INDEX "training_cycles_series_id_idx" ON "training_cycles"("series_id");

-- CreateIndex
CREATE INDEX "training_cycles_cycle_number_idx" ON "training_cycles"("cycle_number");

-- CreateIndex
CREATE INDEX "exercise_attempts_training_item_id_idx" ON "exercise_attempts"("training_item_id");

-- CreateIndex
CREATE INDEX "exercise_attempts_series_id_idx" ON "exercise_attempts"("series_id");

-- CreateIndex
CREATE INDEX "exercise_attempts_cycle_id_idx" ON "exercise_attempts"("cycle_id");

-- CreateIndex
CREATE INDEX "exercise_attempts_created_at_idx" ON "exercise_attempts"("created_at");

-- AddForeignKey
ALTER TABLE "training_series_items" ADD CONSTRAINT "training_series_items_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "training_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_series_items" ADD CONSTRAINT "training_series_items_training_item_id_fkey" FOREIGN KEY ("training_item_id") REFERENCES "training_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_cycles" ADD CONSTRAINT "training_cycles_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "training_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_training_item_id_fkey" FOREIGN KEY ("training_item_id") REFERENCES "training_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "training_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
