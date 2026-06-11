import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IdeaCard } from "@/components/library/IdeaCard";
import { TechniqueCard } from "@/components/library/TechniqueCard";
import { getLibraryBook, getLibraryTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string };
}

const BOOK_FALLBACK: Record<string, { subtitle: string }> = {
  "positional-techniques": {
    subtitle:
      "45 técnicas estratégicas del juego posicional — cada una ilustrada con partidas de los grandes maestros.",
  },
};

export default async function BookPage({ params }: PageProps) {
  const [book, techniquesRaw] = await Promise.all([
    getLibraryBook(params.bookId),
    (async () => {
      try {
        const b = await getLibraryBook(params.bookId);
        if (!b) return [];
        return getLibraryTechniques(b.id);
      } catch {
        return [];
      }
    })(),
  ]);

  if (!book) {
    notFound();
  }

  const techniques = techniquesRaw;
  const fallback = BOOK_FALLBACK[params.bookId];
  const totalExamples = techniques.reduce((sum, t) => sum + t._count.examples, 0);
  const isImported = techniques.length > 0;

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 960, margin: "0 auto" }}>
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
        <span style={{ color: "var(--text-2)" }}>{book.title}</span>
      </div>

      {/* Book header */}
      <div
        className="relative overflow-hidden rounded-[16px] p-7 mb-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderLeft: "4px solid var(--amber)",
        }}
      >
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(200,169,107,0.10)", color: "var(--amber)" }}
          >
            <Icon name="book" size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {isImported ? (
                <Badge variant="amber" dot>
                  Disponible
                </Badge>
              ) : (
                <Badge variant="default" dot>
                  En construcción
                </Badge>
              )}
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {book.author} · {book.year}
              </span>
            </div>
            <h1
              style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}
            >
              {book.title}
            </h1>
            {fallback && (
              <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 560 }}>
                {fallback.subtitle}
              </p>
            )}
          </div>
          {isImported && (
            <Link href={`/library/books/${params.bookId}/techniques`}>
              <Button variant="amber" size="sm" icon="bolt">
                Explorar técnicas
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-6 mt-6 pt-5"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {[
            { icon: "layers", label: "Técnicas", value: String(book.techniquesTotal) },
            { icon: "puzzle", label: "Ejemplos", value: isImported ? String(totalExamples) : "~446" },
            { icon: "clock", label: "Tiempo estimado", value: "40h" },
            { icon: "target", label: "Tu progreso", value: "0%" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <Icon name={s.icon} size={14} style={{ color: "var(--text-3)" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key ideas */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>
          Ideas clave del libro
        </h2>
        <div className="flex flex-col gap-3">
          <IdeaCard
            type="principle"
            title="Forma antes que fuerza"
            body="La comprensión de la posición debe preceder a los cálculos tácticos. Un buen esquema posicional crea amenazas que el oponente no puede defender."
            tags={["estrategia", "principio fundamental"]}
          />
          <IdeaCard
            type="technique"
            title="Repetición y automatismo"
            body="Cada técnica se estudia en múltiples posiciones hasta que el reconocimiento del patrón sea instantáneo. El método Woodpecker aplicado a la estrategia."
            tags={["práctica deliberada", "patrones"]}
          />
        </div>
      </div>

      {/* Techniques list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Técnicas{isImported ? ` — ${techniques.length}` : ""}
          </h2>
          {isImported && (
            <Link href={`/library/books/${params.bookId}/techniques`}>
              <Button variant="ghost" size="sm" icon="arrowRight">
                Ver todas
              </Button>
            </Link>
          )}
        </div>

        {isImported ? (
          <div className="grid grid-cols-1 gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {techniques.slice(0, 12).map((tech) => (
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
        ) : (
          <div
            className="rounded-[12px] p-8 text-center"
            style={{ background: "var(--surface)", border: "1px dashed var(--line)" }}
          >
            <Icon name="layers" size={24} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 8 }}>
              Técnicas pendientes de importación
            </p>
            <p style={{ fontSize: 12, color: "var(--text-4 )" }}>
              Ejecuta <code>npm run library:import</code> para cargar los datos del libro.
            </p>
          </div>
        )}

        {isImported && techniques.length > 12 && (
          <div className="mt-4 text-center">
            <Link href={`/library/books/${params.bookId}/techniques`}>
              <Button variant="outline" size="sm">
                Ver las {techniques.length - 12} técnicas restantes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
