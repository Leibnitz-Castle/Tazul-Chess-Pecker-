-- CreateTable
CREATE TABLE "library_books" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "techniques_total" INTEGER NOT NULL,
    "examples_total" INTEGER NOT NULL,
    "export_level" TEXT NOT NULL DEFAULT 'PUBLIC_SAFE',
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_techniques" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "technique_number" INTEGER NOT NULL,
    "technique_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examples_count" INTEGER NOT NULL,
    "tags" TEXT[],
    "difficulty" TEXT,
    "order_index" INTEGER NOT NULL,
    "export_level" TEXT NOT NULL DEFAULT 'PUBLIC_SAFE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_examples" (
    "id" TEXT NOT NULL,
    "technique_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "pgn_index" INTEGER NOT NULL,
    "eco" TEXT,
    "fen_initial" TEXT NOT NULL,
    "mainline_moves" TEXT[],
    "mainline_length" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL,
    "export_level" TEXT NOT NULL DEFAULT 'PUBLIC_SAFE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_examples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_books_book_id_key" ON "library_books"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "library_books_slug_key" ON "library_books"("slug");

-- CreateIndex
CREATE INDEX "library_techniques_book_id_idx" ON "library_techniques"("book_id");

-- CreateIndex
CREATE INDEX "library_techniques_technique_number_idx" ON "library_techniques"("technique_number");

-- CreateIndex
CREATE UNIQUE INDEX "library_techniques_book_id_technique_number_key" ON "library_techniques"("book_id", "technique_number");

-- CreateIndex
CREATE INDEX "library_examples_technique_id_idx" ON "library_examples"("technique_id");

-- CreateIndex
CREATE INDEX "library_examples_fen_initial_idx" ON "library_examples"("fen_initial");

-- AddForeignKey
ALTER TABLE "library_techniques" ADD CONSTRAINT "library_techniques_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_examples" ADD CONSTRAINT "library_examples_technique_id_fkey" FOREIGN KEY ("technique_id") REFERENCES "library_techniques"("id") ON DELETE CASCADE ON UPDATE CASCADE;
