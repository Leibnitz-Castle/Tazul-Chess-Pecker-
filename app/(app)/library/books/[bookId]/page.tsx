import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { BookIndexPanel } from "@/components/library/BookIndexPanel";
import { TechniqueIndexList } from "@/components/library/TechniqueIndexList";
import { getLibraryBook, getLibraryTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string };
}

export async function generateMetadata({ params }: PageProps) {
  const book = await getLibraryBook(params.bookId);
  return { title: book ? `${book.title} — Biblioteca` : "Libro — Biblioteca" };
}

export default async function BookPage({ params }: PageProps) {
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
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", maxWidth: 860 }}>
        {/* Breadcrumb */}
        <div className="eyebrow flex items-center gap-2 mb-6 flex-wrap">
          <Link href="/library" className="hover:text-amber transition-colors">
            Biblioteca Dinámica
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-2)" }}>{book.title}</span>
        </div>

        {/* Book header */}
        <div
          style={{
            padding: "22px 24px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderLeft: "3px solid var(--amber)",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(200,169,107,0.10)",
                color: "var(--amber)",
                flexShrink: 0,
              }}
            >
              <Icon name="book" size={22} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
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
                {book.author} · {book.year}
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

          {/* Real stats only */}
          <div
            className="flex items-center gap-6 flex-wrap mt-5 pt-4"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            {[
              {
                icon: "layers",
                label: "Técnicas",
                value: String(techniques.length || book.techniquesTotal),
              },
              {
                icon: "puzzle",
                label: "Ejemplos",
                value: String(totalExamples || book.examplesTotal),
              },
              { icon: "target", label: "Progreso", value: "0%" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={s.icon} size={13} style={{ color: "var(--text-3)" }} />
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      lineHeight: 1.1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to study */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              marginBottom: 14,
            }}
          >
            Cómo estudiar este libro
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Lee la idea central de cada técnica con tus propias palabras.",
              "Reproduce los ejemplos del tablero — sigue las jugadas paso a paso.",
              "Responde las preguntas guiadas antes de ver la solución.",
              "Repite las posiciones que no dominas hasta automatizar el patrón.",
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  fontSize: 13,
                  color: "var(--text-2)",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--amber)",
                    flexShrink: 0,
                    marginTop: 1,
                    opacity: 0.8,
                  }}
                >
                  {i + 1}.
                </span>
                {step}
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              marginTop: 12,
              fontStyle: "italic",
              opacity: 0.7,
            }}
          >
            Las explicaciones propias se añadirán progresivamente. El dataset contiene
            FEN + jugadas; no texto del libro.
          </p>
        </div>

        {/* Technique index */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "var(--text-3)",
              }}
            >
              Índice — {techniques.length} técnicas
            </h2>
            {techniques.length > 12 && (
              <Link href={`/library/books/${params.bookId}/techniques`}>
                <Button variant="ghost" size="sm" iconRight="arrowRight">
                  Ver todas
                </Button>
              </Link>
            )}
          </div>

          {techniques.length === 0 ? (
            <div
              style={{
                padding: "40px 24px",
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
            <TechniqueIndexList
              techniques={techniqueItems}
              bookId={params.bookId}
              limit={12}
            />
          )}

          {techniques.length > 12 && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Link href={`/library/books/${params.bookId}/techniques`}>
                <Button variant="outline" size="sm">
                  Ver las {techniques.length - 12} técnicas restantes
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
