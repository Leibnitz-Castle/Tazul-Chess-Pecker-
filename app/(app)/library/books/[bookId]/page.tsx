import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionPreviewCard } from "@/components/library/SectionPreviewCard";
import { IdeaCard } from "@/components/library/IdeaCard";

interface PageProps {
  params: { bookId: string };
}

const BOOK_META: Record<string, { title: string; author: string; subtitle: string }> = {
  "positional-techniques": {
    title: "Técnicas del juego posicional",
    author: "Bronznik & Terekhin",
    subtitle: "44 técnicas estratégicas para mejorar la comprensión posicional del tablero.",
  },
};

const SECTIONS_STUB = [
  {
    id: "1",
    sectionNumber: 1,
    title: "Técnica 1 — La columna abierta",
    description:
      "Uso sistemático de columnas abiertas para penetrar en la posición del oponente.",
    status: "available" as const,
    exerciseCount: 8,
    tags: ["estrategia", "torres", "columnas"],
    href: "/library/books/positional-techniques/sections/1",
  },
  {
    id: "2",
    sectionNumber: 2,
    title: "Técnica 2 — El alfil malo",
    description:
      "Identificar y explotar el alfil bloqueado por sus propios peones.",
    status: "locked" as const,
    exerciseCount: 6,
    tags: ["alfiles", "estructura"],
    href: "/library/books/positional-techniques/sections/2",
  },
  {
    id: "3",
    sectionNumber: 3,
    title: "Técnica 3 — El caballo en el puesto avanzado",
    description:
      "Crear y mantener un caballo permanente en un casilla poderosa del territorio enemigo.",
    status: "locked" as const,
    exerciseCount: 10,
    tags: ["caballos", "puntos débiles"],
    href: "/library/books/positional-techniques/sections/3",
  },
];

export default function BookPage({ params }: PageProps) {
  const meta = BOOK_META[params.bookId] ?? {
    title: params.bookId.replace(/-/g, " "),
    author: "—",
    subtitle: "Módulo en construcción.",
  };

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5" style={{ flexWrap: "wrap" }}>
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca Dinámica
        </Link>
        <span>/</span>
        <Link href="/library/books" className="hover:text-amber transition-colors">
          Libros
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>{meta.title}</span>
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
              <Badge variant="amber" dot>
                En construcción
              </Badge>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{meta.author}</span>
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              {meta.title}
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 560 }}>
              {meta.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href={`/library/books/${params.bookId}/sections/1`}>
              <Button variant="amber" size="sm" icon="bolt">
                Empezar
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 pt-5" style={{ borderTop: "1px solid var(--line)" }}>
          {[
            { icon: "layers", label: "Secciones totales", value: "44" },
            { icon: "puzzle", label: "Ejercicios", value: "~280" },
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

      {/* Key ideas preview */}
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

      {/* Sections list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Secciones — {SECTIONS_STUB.length} de 44 disponibles
          </h2>
          <Badge variant="default">Datos de ejemplo</Badge>
        </div>
        <div className="flex flex-col gap-3">
          {SECTIONS_STUB.map((s) => (
            <SectionPreviewCard key={s.id} {...s} />
          ))}
        </div>
        <div
          className="mt-4 rounded-[12px] p-4 text-center"
          style={{ background: "var(--surface)", border: "1px dashed var(--line)" }}
        >
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            41 secciones adicionales se agregarán al importar el contenido del libro.
          </span>
        </div>
      </div>
    </div>
  );
}
