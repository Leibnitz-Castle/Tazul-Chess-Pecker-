import Link from "next/link";

interface TechniqueItem {
  id: string;
  techniqueNumber: number;
  title: string;
  examplesCount: number;
}

interface BookIndexPanelProps {
  bookTitle: string;
  author: string;
  techniques: TechniqueItem[];
  bookId: string;
  activeTechniqueId?: string;
}

export function BookIndexPanel({
  bookTitle,
  author,
  techniques,
  bookId,
  activeTechniqueId,
}: BookIndexPanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.4,
            marginBottom: 3,
          }}
        >
          {bookTitle}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>{author}</div>
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--line)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--text-3)",
          }}
        >
          Índice — {techniques.length} técnicas
        </div>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "6px 0" }}>
        {techniques.map((tech) => {
          const isActive = tech.id === activeTechniqueId;
          return (
            <Link
              key={tech.id}
              href={`/library/books/${bookId}/techniques/${tech.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px 7px 0",
                paddingLeft: isActive ? 12 : 14,
                textDecoration: "none",
                background: isActive ? "rgba(200,169,107,0.07)" : "transparent",
                borderLeft: isActive ? "2px solid var(--amber)" : "2px solid transparent",
                borderRadius: "0 6px 6px 0",
                transition: "background 0.1s",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: isActive ? "var(--amber)" : "var(--text-3)",
                  minWidth: 26,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(tech.techniqueNumber).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: isActive ? "var(--text)" : "var(--text-2)",
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}
              >
                Técnica {tech.techniqueNumber}
              </span>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isActive ? "var(--amber)" : "var(--line)",
                  flexShrink: 0,
                  opacity: isActive ? 0.7 : 0.5,
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
