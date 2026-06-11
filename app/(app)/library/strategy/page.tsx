import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Estrategia Posicional — Biblioteca Dinámica",
};

const ROADMAP = [
  {
    phase: "Fase 1",
    title: "Pipeline de contenido",
    description: "Importar y estructurar el libro Bronznik & Terekhin en 44 secciones con ideas clave, posiciones modelo y etiquetas estratégicas.",
    status: "next" as const,
    items: ["Parser de libro privado", "Extracción de posiciones FEN", "Etiquetado de técnicas", "Revisión manual de ideas clave"],
  },
  {
    phase: "Fase 2",
    title: "Ejercicios interactivos",
    description: "Crear ejercicios por técnica basados en las posiciones modelo. Sistema de pistas y soluciones.",
    status: "future" as const,
    items: ["Generador de ejercicios", "Sistema de pistas", "Feedback por técnica", "Puntuación y progreso"],
  },
  {
    phase: "Fase 3",
    title: "Repetición espaciada",
    description: "Aplicar el método Woodpecker a las técnicas posicionales. Revisión automática de ideas débiles.",
    status: "future" as const,
    items: ["Cola de revisión", "Métricas por técnica", "Dashboard de progreso", "Integración con Practice Pecker"],
  },
];

export default function StrategyPage() {
  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 860, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5">
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca Dinámica
        </Link>
        <span>/</span>
        <span>Plan Estratégico</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-[12px] flex items-center justify-center"
            style={{ background: "rgba(200,169,107,0.10)", color: "var(--amber)" }}
          >
            <Icon name="target" size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Plan: Técnicas del juego posicional
            </h1>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>Hoja de ruta del módulo</div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 600, lineHeight: 1.65 }}>
          Este plan documenta cómo se construirá el módulo interactivo del libro Bronznik &
          Terekhin. El dataset del libro es privado y no se sube al repositorio.
        </p>
      </div>

      {/* Roadmap */}
      <div className="flex flex-col gap-5">
        {ROADMAP.map((phase) => (
          <div
            key={phase.phase}
            className="rounded-[14px] p-6"
            style={{
              background: "var(--surface)",
              border: `1px solid ${phase.status === "next" ? "rgba(200,169,107,0.28)" : "var(--line)"}`,
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                  {phase.phase}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {phase.title}
                </h2>
              </div>
              <Badge variant={phase.status === "next" ? "amber" : "default"} dot>
                {phase.status === "next" ? "Próximo" : "Futuro"}
              </Badge>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 14 }}>
              {phase.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {phase.items.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 12,
                    color: "var(--text-3)",
                    background: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "4px 10px",
                  }}
                >
                  <Icon name="chevRight" size={11} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div
        className="flex items-start gap-3 mt-8 rounded-[12px] p-4"
        style={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
      >
        <Icon name="book" size={16} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
          El contenido del libro (posiciones, texto, análisis) es material privado y{" "}
          <strong style={{ color: "var(--text-2)" }}>nunca se sube al repositorio público</strong>.
          El pipeline de importación opera localmente sobre archivos en{" "}
          <code style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-2)" }}>
            data/private/
          </code>
          .
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Link href="/library/books/positional-techniques">
          <Button variant="amber" size="sm" icon="book">
            Abrir libro
          </Button>
        </Link>
        <Link href="/library">
          <Button variant="outline" size="sm" icon="arrowLeft">
            Biblioteca
          </Button>
        </Link>
      </div>
    </div>
  );
}
