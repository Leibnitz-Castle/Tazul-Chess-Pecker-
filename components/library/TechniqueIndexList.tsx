import Link from "next/link";

interface TechniqueRow {
  id: string;
  techniqueNumber: number;
  examplesCount: number;
}

interface TechniqueIndexListProps {
  techniques: TechniqueRow[];
  bookId: string;
  limit?: number;
}

export function TechniqueIndexList({ techniques, bookId, limit }: TechniqueIndexListProps) {
  const list = limit ? techniques.slice(0, limit) : techniques;

  if (list.length === 0) {
    return (
      <div
        style={{
          padding: "40px 0",
          textAlign: "center",
          color: "var(--text-3)",
          fontSize: 14,
        }}
      >
        Todavía no hay técnicas importadas.
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 80px 100px",
          padding: "8px 16px",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-2)",
        }}
      >
        {["#", "Técnica", "Ejemplos", "Estado"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-3)",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {list.map((tech, i) => (
        <Link
          key={tech.id}
          href={`/library/books/${bookId}/techniques/${tech.id}`}
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 80px 100px",
            padding: "10px 16px",
            textDecoration: "none",
            background: i % 2 === 0 ? "var(--surface)" : "rgba(255,255,255,0.01)",
            borderBottom: i < list.length - 1 ? "1px solid var(--line)" : "none",
            alignItems: "center",
            transition: "background 0.1s",
          }}
          className="hover:bg-[rgba(200,169,107,0.04)]"
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(tech.techniqueNumber).padStart(2, "0")}
          </span>

          <span
            style={{
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            Técnica {tech.techniqueNumber}
          </span>

          <span
            style={{
              fontSize: 12,
              color: "var(--text-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {tech.examplesCount} ej.
          </span>

          <span
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--line)",
                flexShrink: 0,
              }}
            />
            No estudiada
          </span>
        </Link>
      ))}
    </div>
  );
}
