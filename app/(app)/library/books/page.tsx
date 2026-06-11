import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Libros — Biblioteca Dinámica",
};

const BOOKS_STUB = [
  {
    id: "positional-techniques",
    title: "Técnicas del juego posicional",
    author: "Bronznik & Terekhin",
    sections: 44,
    status: "building" as const,
  },
];

export default function LibraryBooksPage() {
  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link href="/library" className="hover:text-amber transition-colors">
            Biblioteca Dinámica
          </Link>
          <span>/</span>
          <span>Libros</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 6 }}>
          Todos los libros
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {BOOKS_STUB.map((b) => (
          <Link key={b.id} href={`/library/books/${b.id}`} className="block">
            <div
              className="flex items-center gap-4 rounded-[14px] p-5 bg-bg-card border border-border-subtle transition-all duration-200 hover:border-amber/40 hover:-translate-y-[2px] hover:shadow-amber"
            >
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200,169,107,0.09)", color: "var(--amber)" }}
              >
                <Icon name="book" size={22} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4 }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-3)" }}>
                  {b.author} · {b.sections} secciones
                </div>
              </div>
              <Badge variant="amber" dot>
                En construcción
              </Badge>
              <Icon name="chevRight" size={16} style={{ color: "var(--text-3)" }} />
            </div>
          </Link>
        ))}

        {/* Empty state for future books */}
        <div
          className="flex flex-col items-center justify-center rounded-[14px] gap-4 text-center"
          style={{
            minHeight: 200,
            background: "var(--surface)",
            border: "1px dashed var(--line)",
            padding: 40,
          }}
        >
          <span style={{ color: "var(--text-3)" }}>
            <Icon name="plus" size={28} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              Más libros próximamente
            </div>
            <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 320 }}>
              Igor Smirnov, colecciones personales y más módulos en construcción.
            </p>
          </div>
          <Link href="/library">
            <Button variant="ghost" size="sm" icon="arrowLeft">
              Volver a Biblioteca
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
