import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface ShelfModule {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  status: "available" | "coming_soon" | "future";
  href: string;
}

const MODULES: ShelfModule[] = [
  {
    id: "positional-techniques",
    title: "Técnicas del juego posicional",
    subtitle: "Bronznik & Terekhin · 2013",
    meta: "46 técnicas · 446 ejemplos",
    status: "available",
    href: "/library/books/positional-techniques",
  },
  {
    id: "igor-smirnov",
    title: "Igor Smirnov",
    subtitle: "Cursos de entrenamiento",
    status: "coming_soon",
    href: "#",
  },
  {
    id: "my-collections",
    title: "Mis colecciones",
    subtitle: "Material propio",
    status: "future",
    href: "#",
  },
];

const STATUS_LABELS: Record<ShelfModule["status"], string> = {
  available: "Disponible",
  coming_soon: "Próximamente",
  future: "Futuro",
};

export function LibraryDashboard() {
  return (
    <div className="animate-fade-in" style={{ padding: "32px 28px", maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <div className="eyebrow">Módulos de estudio</div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginTop: 6,
            marginBottom: 8,
          }}
        >
          Biblioteca Dinámica
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, maxWidth: 480 }}>
          Estudia libros, cursos y colecciones como módulos interactivos de ajedrez.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {MODULES.map((mod, i) => (
          <ShelfEntry key={mod.id} {...mod} isLast={i === MODULES.length - 1} />
        ))}
      </div>

      <div
        className="flex items-center gap-2 mt-8"
        style={{ fontSize: 12, color: "var(--text-3)" }}
      >
        <Icon name="book" size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <span>
          Módulo activo:{" "}
          <Link
            href="/library/books/positional-techniques"
            style={{ color: "var(--amber)", textDecoration: "none" }}
          >
            Técnicas del juego posicional
          </Link>
          . Más módulos se irán añadiendo.
        </span>
      </div>
    </div>
  );
}

function ShelfEntry({
  title,
  subtitle,
  meta,
  status,
  href,
  isLast,
}: ShelfModule & { isLast: boolean }) {
  const isActive = status === "available";

  const inner = (
    <div
      style={{
        position: "relative",
        padding: "20px 24px 20px 28px",
        background: isActive ? "rgba(200,169,107,0.025)" : "var(--surface)",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        transition: isActive ? "background 0.15s" : undefined,
      }}
      className={isActive ? "group hover:bg-[rgba(200,169,107,0.05)]" : ""}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          borderRadius: "14px 0 0 14px",
          background: "var(--amber)",
          opacity: isActive ? 0.75 : 0.18,
        }}
      />

      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? "rgba(200,169,107,0.10)" : "var(--bg-2)",
          color: isActive ? "var(--amber)" : "var(--text-3)",
          flexShrink: 0,
          border: "1px solid var(--line)",
        }}
      >
        <Icon name="book" size={17} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: isActive ? "var(--text)" : "var(--text-2)",
            marginBottom: 3,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.4 }}>
          {subtitle}
          {meta && (
            <>
              <span style={{ margin: "0 7px", opacity: 0.35 }}>·</span>
              {meta}
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: isActive ? "var(--amber)" : "var(--text-3)",
            opacity: isActive ? 1 : 0.6,
          }}
        >
          {STATUS_LABELS[status]}
        </span>

        {isActive ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--amber)",
              color: "#1E1812",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Entrar
            <Icon name="arrowRight" size={12} />
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              color: "var(--text-3)",
              fontSize: 12,
              opacity: 0.45,
            }}
          >
            —
          </span>
        )}
      </div>
    </div>
  );

  return isActive ? (
    <Link href={href} style={{ display: "block", textDecoration: "none" }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}
