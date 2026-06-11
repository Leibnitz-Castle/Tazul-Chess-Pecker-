import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookIndexPanel } from "@/components/library/BookIndexPanel";
import { TechniqueIndexList } from "@/components/library/TechniqueIndexList";
import { getLibraryBook, getLibraryTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string };
}

export async function generateMetadata({ params }: PageProps) {
  const book = await getLibraryBook(params.bookId);
  return {
    title: book ? `Técnicas — ${book.title}` : "Técnicas — Biblioteca",
  };
}

export default async function TechniquesPage({ params }: PageProps) {
  const book = await getLibraryBook(params.bookId);
  if (!book) notFound();

  const techniques = await getLibraryTechniques(book.id);
  const totalExamples = techniques.reduce((sum, t) => sum + t._count.examples, 0);
  const firstTechnique = techniques[0];

  const techniqueItems = techniques.map((t) => ({
    id: t.id,
    techniqueNumber: t.techniqueNumber,
    title: t.title,
    examplesCount: t._count.examples,
  }));

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}
    >
      {/* Left index panel — sticky, desktop only */}
      <div
        className="hidden md:flex"
        style={{
          width: 230,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        <BookIndexPanel
          bookTitle={book.title}
          author={book.author}
          techniques={techniqueItems}
          bookId={params.bookId}
        />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px" }}>
        {/* Breadcrumb */}
        <div className="eyebrow flex items-center gap-2 mb-6 flex-wrap">
          <Link href="/library" className="hover:text-amber transition-colors">
            Biblioteca Dinámica
          </Link>
          <span>/</span>
          <Link
            href={`/library/books/${params.bookId}`}
            className="hover:text-amber transition-colors"
          >
            {book.title}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-2)" }}>Índice de técnicas</span>
        </div>

        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}
            >
              {book.title}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>
              {book.author} · {techniques.length} técnicas · {totalExamples} ejemplos
            </p>
          </div>

          {firstTechnique && (
            <Link href={`/library/books/${params.bookId}/techniques/${firstTechnique.id}`}>
              <Button variant="amber" size="sm" icon="arrowRight">
                Empezar por Técnica 1
              </Button>
            </Link>
          )}
        </div>

        {/* Full technique index */}
        {techniques.length === 0 ? (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              borderRadius: 10,
              border: "1px dashed var(--line)",
              color: "var(--text-3)",
              fontSize: 14,
            }}
          >
            Todavía no hay técnicas importadas. Ejecuta{" "}
            <code style={{ fontSize: 12 }}>npm run library:import</code>.
          </div>
        ) : (
          <TechniqueIndexList techniques={techniqueItems} bookId={params.bookId} />
        )}
      </div>
    </div>
  );
}
