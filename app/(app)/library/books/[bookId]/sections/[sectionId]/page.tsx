import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IdeaCard } from "@/components/library/IdeaCard";

interface PageProps {
  params: { bookId: string; sectionId: string };
}

export default function SectionPage({ params }: PageProps) {
  const { bookId, sectionId } = params;
  const sectionNum = parseInt(sectionId, 10) || 1;

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 860, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5 flex-wrap">
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca
        </Link>
        <span>/</span>
        <Link href={`/library/books/${bookId}`} className="hover:text-amber transition-colors">
          {bookId.replace(/-/g, " ")}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>Sección {sectionNum}</span>
      </div>

      {/* Section header */}
      <div
        className="rounded-[16px] p-6 mb-7"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderTop: "3px solid var(--amber)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="flex items-center justify-center rounded-[10px]"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(200,169,107,0.10)",
                  color: "var(--amber)",
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {sectionNum}
              </span>
              <Badge variant="amber">En construcción</Badge>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Técnica {sectionNum} — Sección en preparación
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 520 }}>
              Esta sección se llenará de contenido real cuando se importe y estructure el material
              del libro. Por ahora muestra el shell y la navegación.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button variant="amber" size="sm" icon="bolt" disabled>
              Practicar
            </Button>
            <Link href={`/library/books/${bookId}`}>
              <Button variant="ghost" size="sm" icon="arrowLeft" block>
                Volver
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-5 pt-5" style={{ borderTop: "1px solid var(--line)" }}>
          {[
            { icon: "book", label: "Páginas", value: "—" },
            { icon: "puzzle", label: "Ejercicios", value: "—" },
            { icon: "target", label: "Tu precisión", value: "—" },
            { icon: "clock", label: "Último repaso", value: "—" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <Icon name={s.icon} size={14} style={{ color: "var(--text-3)" }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder content areas */}
      <div className="flex flex-col gap-6">
        {/* Key ideas */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Ideas clave</h2>
          <div className="flex flex-col gap-3">
            <IdeaCard
              type="principle"
              title="Concepto principal"
              body="El contenido real de esta sección se cargará desde el pipeline del libro una vez que el material sea importado y estructurado."
              tags={["pendiente"]}
            />
            <IdeaCard
              type="technique"
              title="Aplicación práctica"
              body="Cada idea clave irá acompañada de posiciones modelo del libro y ejercicios interactivos para practicar el reconocimiento del patrón."
              tags={["ejercicios", "posiciones modelo"]}
            />
          </div>
        </section>

        {/* Exercises placeholder */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Ejercicios</h2>
          <div
            className="flex flex-col items-center justify-center rounded-[14px] gap-4 text-center"
            style={{
              minHeight: 180,
              background: "var(--surface)",
              border: "1px dashed var(--line)",
              padding: 32,
            }}
          >
            <Icon name="puzzle" size={32} style={{ color: "var(--text-3)" }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                Ejercicios en construcción
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 360 }}>
                Los ejercicios interactivos se generarán al importar las posiciones modelo
                del capítulo correspondiente.
              </p>
            </div>
            <Badge variant="default">Pipeline pendiente</Badge>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--line)" }}>
          <Link href={`/library/books/${bookId}`}>
            <Button variant="outline" size="sm" icon="arrowLeft">
              Ver todas las secciones
            </Button>
          </Link>
          {sectionNum < 44 && (
            <Link href={`/library/books/${bookId}/sections/${sectionNum + 1}`}>
              <Button variant="outline" size="sm" iconRight="arrowRight">
                Sección {sectionNum + 1}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
