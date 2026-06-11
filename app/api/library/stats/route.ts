import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [bookCount, techniqueCount, exampleCount] = await Promise.all([
      prisma.libraryBook.count(),
      prisma.libraryTechnique.count(),
      prisma.libraryExample.count(),
    ]);
    return NextResponse.json({
      books: bookCount,
      techniques: techniqueCount,
      examples: exampleCount,
    });
  } catch (err) {
    console.error("[library/stats GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
