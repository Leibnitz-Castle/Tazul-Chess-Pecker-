import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const books = await prisma.libraryBook.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { techniques: true } },
      },
    });
    return NextResponse.json({ books });
  } catch (err) {
    console.error("[library/books GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
