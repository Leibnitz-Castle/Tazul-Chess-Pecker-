import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { TechniqueCard } from "@/components/library/TechniqueCard";
import { getLibraryBook, getLibraryTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string };
}

export default async function TechniquesPage({ params }: PageProps) {
  const book = await getLibraryBook(params.bookId);
  if (!book) notFound();

  const techniques = await getLibraryTechniques(book.id);

  const totalExamples = techniques.reduce((sum, t) => sum + t._count.examples, 0);

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5 flex-wrap">
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca Dinámica
        </Link>
        <span>/</span>
        <Link href="/library/books" className="hover:text-amber transition-colors">
          Libros
        </Link>
        <span>/</span>
        <Link
          href={`/library/books/${params.bookId}`}
          className="hover:text-amber transition-colors"
        >
          {book.title}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>Técnicas</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {techniques.length} Técnicas
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
            {totalExamples} examples totales · {book.author}
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4">
          {[
            { icon: "layers", label: "técnicas", value: techniques.length },
            { icon: "puzzle", label: "ejemplos", value: totalExamples },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <Icon name={s.icon} size={13} style={{ color: "var(--amber)" }} />
              <span style={{ fontWeight: 700, color: "var(--text)" }}>{s.value}</span>
              <span style={{ color: "var(--text-3)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      {techniques.length === 0 ? (
        <div
          className="rounded-[14px] p-10 text-center"
          style={{ background: "var(--surface)", border: "1px dashed var(--line)" }}
        >
          <Icon name="layers" size={28} style={{ color: "var(--text-3)", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 6 }}>
            Sin técnicas importadas todavía
          </p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Ejecuta <code>npm run library:import</code> para cargar el libro.
          </p>
        </div>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {techniques.map((tech) => (
            <TechniqueCard
              key={tech.id}
              techniqueNumber={tech.techniqueNumber}
              title={tech.title}
              examplesCount={tech._count.examples}
              difficulty={tech.difficulty}
              tags={tech.tags}
              href={`/library/books/${params.bookId}/techniques/${tech.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
