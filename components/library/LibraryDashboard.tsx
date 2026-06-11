import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LibraryCard, LibraryCardStatus, LibraryCardFeature, LibraryCardAction } from "./LibraryCard";

interface BookModule {
  id: string;
  title: string;
  subtitle: string;
  status: LibraryCardStatus;
  icon: string;
  accentColor: string;
  features: LibraryCardFeature[];
  primaryAction: LibraryCardAction;
  secondaryAction?: LibraryCardAction;
}

const MODULES: BookModule[] = [
  {
    id: "positional-techniques",
    title: "Técnicas del juego posicional",
    subtitle:
      "44 técnicas estratégicas para mejorar la comprensión posicional. Bronznik & Terekhin.",
    status: "building",
    icon: "book",
    accentColor: "var(--amber)",
    features: [
      { icon: "bolt", label: "Ideas clave" },
      { icon: "target", label: "Posiciones modelo" },
      { icon: "puzzle", label: "Ejercicios interactivos" },
      { icon: "chart", label: "Progreso por técnica" },
      { icon: "refresh", label: "Repetición tipo Woodpecker" },
    ],
    primaryAction: {
      label: "Abrir biblioteca",
      href: "/library/books/positional-techniques",
      icon: "book",
    },
    secondaryAction: {
      label: "Ver plan",
      href: "/library/strategy",
      icon: "arrowRight",
    },
  },
  {
    id: "igor-smirnov",
    title: "Igor Smirnov",
    subtitle:
      "Cursos, principios y métodos de entrenamiento organizados por temas.",
    status: "coming_soon",
    icon: "star",
    accentColor: "#7A9EA8",
    features: [
      { icon: "target", label: "Cálculo" },
      { icon: "bolt", label: "Ataque" },
      { icon: "layers", label: "Defensa" },
      { icon: "clock", label: "Pensamiento práctico" },
      { icon: "flame", label: "Toma de decisiones" },
      { icon: "star", label: "Repertorio mental" },
    ],
    primaryAction: {
      label: "Abrir cursos",
      href: "/library/igor-smirnov",
      icon: "arrowRight",
    },
    secondaryAction: {
      label: "Ver estructura",
      href: "/library/igor-smirnov",
      icon: "grid",
    },
  },
  {
    id: "my-collections",
    title: "Mis colecciones",
    subtitle:
      "Crea tu propia biblioteca de estudio con posiciones, ideas y ejercicios.",
    status: "future",
    icon: "layers",
    accentColor: "#7D9E82",
    features: [
      { icon: "plus", label: "Crear colección" },
      { icon: "upload", label: "Importar material" },
      { icon: "book", label: "Tus posiciones" },
      { icon: "puzzle", label: "Ejercicios propios" },
    ],
    primaryAction: {
      label: "Crear colección",
      href: "/library/books",
      icon: "plus",
    },
    secondaryAction: {
      label: "Importar material",
      href: "/library/books",
      icon: "upload",
    },
  },
];

const STATS = [
  { icon: "library", label: "Módulos", value: "3" },
  { icon: "bolt", label: "En construcción", value: "1" },
  { icon: "clock", label: "Próximamente", value: "2" },
  { icon: "puzzle", label: "Ejercicios totales", value: "—" },
];

export function LibraryDashboard() {
  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1200, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow">Módulos de estudio</div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginTop: 6,
            marginBottom: 10,
          }}
        >
          Biblioteca Dinámica
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 560, lineHeight: 1.6 }}>
          Libros y cursos ajedrecísticos convertidos en módulos interactivos de aprendizaje. Estudio
          profundo, ejercicios, progreso y repetición espaciada.
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-2 rounded-[12px] px-5 py-4 mb-8 flex-wrap"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--bg-2)", color: "var(--text-3)" }}
            >
              <Icon name={s.icon} size={15} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--text)",
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</div>
            </div>
            {i < STATS.length - 1 && (
              <div style={{ width: 1, height: 28, background: "var(--line)", marginLeft: 10 }} />
            )}
          </div>
        ))}
        <div className="flex-1" />
        <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "right" }}>
          <div>Más módulos en camino</div>
          <div style={{ color: "var(--text-2)", fontWeight: 600, marginTop: 2 }}>
            Contenido en construcción
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {MODULES.map((m, i) => (
          <LibraryCard key={m.id} {...m} delay={i * 80} />
        ))}
      </div>

      {/* Openings stand-by note */}
      <div
        className="flex items-center gap-3 mt-10 rounded-[12px] p-4"
        style={{
          background: "rgba(200,169,107,0.04)",
          border: "1px solid rgba(200,169,107,0.12)",
        }}
      >
        <Icon name="bolt" size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-2)" }}>Aperturas Pecker</strong> está temporalmente en
          stand-by. El módulo de repertorios sigue accesible en{" "}
          <Link href="/openings" style={{ color: "var(--amber)", textDecoration: "none" }}>
            /openings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
