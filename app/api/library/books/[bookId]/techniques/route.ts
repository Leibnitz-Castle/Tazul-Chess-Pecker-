import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const book = await prisma.libraryBook.findUnique({
      where: { slug: params.bookId },
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const techniques = await prisma.libraryTechnique.findMany({
      where: { bookId: book.id },
      orderBy: { techniqueNumber: "asc" },
      include: {
        _count: { select: { examples: true } },
      },
    });
    return NextResponse.json({ techniques });
  } catch (err) {
    console.error("[library/books/[bookId]/techniques GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
