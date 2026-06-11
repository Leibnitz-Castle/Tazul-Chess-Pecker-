import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Igor Smirnov — Biblioteca Dinámica",
};

const MODULES = [
  { icon: "target", label: "Cálculo", description: "Método sistemático para calcular variantes y encontrar jugadas exactas." },
  { icon: "bolt", label: "Ataque", description: "Principios del ataque al rey y creación de iniciativas peligrosas." },
  { icon: "layers", label: "Defensa", description: "Técnicas de defensa activa y pasiva en posiciones comprometidas." },
  { icon: "clock", label: "Pensamiento práctico", description: "Cómo pensar durante la partida: prioridades, tiempo y psicología." },
  { icon: "flame", label: "Toma de decisiones", description: "Marco para elegir entre candidatos cuando el cálculo no es suficiente." },
  { icon: "star", label: "Repertorio mental", description: "Construcción de un repertorio de planes e ideas recurrentes." },
];

export default function IgorSmirnovPage() {
  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5">
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca Dinámica
        </Link>
        <span>/</span>
        <span>Igor Smirnov</span>
      </div>

      {/* Header */}
      <div
        className="relative overflow-hidden rounded-[16px] p-7 mb-8"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderLeft: "4px solid #7A9EA8",
        }}
      >
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(122,158,168,0.10)", color: "#7A9EA8" }}
          >
            <Icon name="star" size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="default" dot>
                Próximamente
              </Badge>
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              Igor Smirnov
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 540 }}>
              Cursos, principios y métodos de entrenamiento organizados por temas. Un sistema
              completo para mejorar en todas las fases del juego.
            </p>
          </div>
        </div>
      </div>

      {/* Coming soon notice */}
      <div
        className="flex items-center gap-4 rounded-[14px] p-5 mb-8"
        style={{
          background: "rgba(122,158,168,0.06)",
          border: "1px solid rgba(122,158,168,0.18)",
        }}
      >
        <Icon name="clock" size={20} style={{ color: "#7A9EA8", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Módulo en planificación</div>
          <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
            Este módulo se construirá después de completar el módulo de Técnicas del juego posicional.
            Los cursos de Smirnov serán el segundo módulo de la Biblioteca Dinámica.
          </p>
        </div>
      </div>

      {/* Modules preview */}
      <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>
        Temas planificados
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {MODULES.map((m) => (
          <div
            key={m.label}
            className="rounded-[12px] p-4 flex gap-3 opacity-70"
            style={{ background: "var(--bg-card)", border: "1px solid var(--line)" }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--bg-2)", color: "var(--text-3)" }}
            >
              <Icon name={m.icon} size={17} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
              <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href="/library">
          <Button variant="outline" size="sm" icon="arrowLeft">
            Volver a Biblioteca
          </Button>
        </Link>
        <Link href="/library/books/positional-techniques">
          <Button variant="amber" size="sm" icon="book">
            Ver Técnicas posicionales
          </Button>
        </Link>
      </div>
    </div>
  );
}
