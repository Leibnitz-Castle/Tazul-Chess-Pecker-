import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const book = await prisma.libraryBook.findUnique({
      where: { slug: params.bookId },
      include: {
        _count: { select: { techniques: true } },
      },
    });
    if (!book) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ book });
  } catch (err) {
    console.error("[library/books/[bookId] GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
