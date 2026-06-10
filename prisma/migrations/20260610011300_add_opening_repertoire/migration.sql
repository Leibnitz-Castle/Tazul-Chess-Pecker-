-- CreateTable
CREATE TABLE "opening_repertoires" (
    "id" TEXT NOT NULL,
    "dev_user_id" TEXT NOT NULL DEFAULT 'dev-user-001',
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opening_repertoires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_lines" (
    "id" TEXT NOT NULL,
    "repertoire_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eco" TEXT,
    "side" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "start_fen" TEXT NOT NULL,
    "final_fen" TEXT NOT NULL,
    "move_count" INTEGER NOT NULL,
    "is_main_line" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opening_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_move_nodes" (
    "id" TEXT NOT NULL,
    "repertoire_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "move_number" INTEGER NOT NULL,
    "san" TEXT NOT NULL,
    "uci" TEXT NOT NULL,
    "fen_before" TEXT NOT NULL,
    "fen_after" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "eco" TEXT,
    "line_name" TEXT,
    "path" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_main_line" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opening_move_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_line_nodes" (
    "id" TEXT NOT NULL,
    "line_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "opening_line_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_attempts" (
    "id" TEXT NOT NULL,
    "repertoire_id" TEXT NOT NULL,
    "line_id" TEXT,
    "node_id" TEXT NOT NULL,
    "move_played" TEXT NOT NULL,
    "expected_move" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "time_ms" INTEGER NOT NULL,
    "attempt_type" TEXT NOT NULL DEFAULT 'PRACTICE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opening_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opening_repertoires_dev_user_id_idx" ON "opening_repertoires"("dev_user_id");

-- CreateIndex
CREATE INDEX "opening_lines_repertoire_id_idx" ON "opening_lines"("repertoire_id");

-- CreateIndex
CREATE INDEX "opening_lines_eco_idx" ON "opening_lines"("eco");

-- CreateIndex
CREATE INDEX "opening_move_nodes_repertoire_id_idx" ON "opening_move_nodes"("repertoire_id");

-- CreateIndex
CREATE INDEX "opening_move_nodes_parent_id_idx" ON "opening_move_nodes"("parent_id");

-- CreateIndex
CREATE INDEX "opening_move_nodes_fen_after_idx" ON "opening_move_nodes"("fen_after");

-- CreateIndex
CREATE INDEX "opening_move_nodes_eco_idx" ON "opening_move_nodes"("eco");

-- CreateIndex
CREATE UNIQUE INDEX "opening_move_nodes_repertoire_id_path_key" ON "opening_move_nodes"("repertoire_id", "path");

-- CreateIndex
CREATE INDEX "opening_line_nodes_line_id_idx" ON "opening_line_nodes"("line_id");

-- CreateIndex
CREATE INDEX "opening_line_nodes_node_id_idx" ON "opening_line_nodes"("node_id");

-- CreateIndex
CREATE UNIQUE INDEX "opening_line_nodes_line_id_node_id_key" ON "opening_line_nodes"("line_id", "node_id");

-- CreateIndex
CREATE INDEX "opening_attempts_repertoire_id_idx" ON "opening_attempts"("repertoire_id");

-- CreateIndex
CREATE INDEX "opening_attempts_line_id_idx" ON "opening_attempts"("line_id");

-- CreateIndex
CREATE INDEX "opening_attempts_node_id_idx" ON "opening_attempts"("node_id");

-- CreateIndex
CREATE INDEX "opening_attempts_created_at_idx" ON "opening_attempts"("created_at");

-- AddForeignKey
ALTER TABLE "opening_lines" ADD CONSTRAINT "opening_lines_repertoire_id_fkey" FOREIGN KEY ("repertoire_id") REFERENCES "opening_repertoires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_move_nodes" ADD CONSTRAINT "opening_move_nodes_repertoire_id_fkey" FOREIGN KEY ("repertoire_id") REFERENCES "opening_repertoires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_move_nodes" ADD CONSTRAINT "opening_move_nodes_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "opening_move_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_line_nodes" ADD CONSTRAINT "opening_line_nodes_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "opening_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_line_nodes" ADD CONSTRAINT "opening_line_nodes_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "opening_move_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_attempts" ADD CONSTRAINT "opening_attempts_repertoire_id_fkey" FOREIGN KEY ("repertoire_id") REFERENCES "opening_repertoires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_attempts" ADD CONSTRAINT "opening_attempts_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "opening_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_attempts" ADD CONSTRAINT "opening_attempts_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "opening_move_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
