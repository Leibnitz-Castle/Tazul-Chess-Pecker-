import { prisma } from "@/lib/db";

export async function getLibraryBook(slug: string) {
  return prisma.libraryBook.findUnique({
    where: { slug },
    include: {
      _count: { select: { techniques: true } },
    },
  });
}

export async function getLibraryTechniques(bookId: string) {
  return prisma.libraryTechnique.findMany({
    where: { bookId },
    orderBy: { techniqueNumber: "asc" },
    include: {
      _count: { select: { examples: true } },
    },
  });
}

export async function getLibraryTechnique(id: string) {
  return prisma.libraryTechnique.findUnique({
    where: { id },
    include: {
      examples: { orderBy: { orderIndex: "asc" } },
      book: { select: { id: true, bookId: true, slug: true, title: true } },
    },
  });
}

export async function getAdjacentTechniques(bookId: string, techniqueNumber: number) {
  const [prev, next] = await Promise.all([
    prisma.libraryTechnique.findFirst({
      where: { bookId, techniqueNumber: { lt: techniqueNumber } },
      orderBy: { techniqueNumber: "desc" },
      select: { id: true, techniqueNumber: true, title: true },
    }),
    prisma.libraryTechnique.findFirst({
      where: { bookId, techniqueNumber: { gt: techniqueNumber } },
      orderBy: { techniqueNumber: "asc" },
      select: { id: true, techniqueNumber: true, title: true },
    }),
  ]);
  return { prev, next };
}
