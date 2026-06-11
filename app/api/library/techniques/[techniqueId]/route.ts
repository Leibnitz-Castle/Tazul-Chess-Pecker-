import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { techniqueId: string } }
) {
  try {
    const technique = await prisma.libraryTechnique.findUnique({
      where: { id: params.techniqueId },
      include: {
        examples: {
          orderBy: { orderIndex: "asc" },
        },
        book: {
          select: { id: true, bookId: true, slug: true, title: true },
        },
      },
    });
    if (!technique) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ technique });
  } catch (err) {
    console.error("[library/techniques/[techniqueId] GET]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
