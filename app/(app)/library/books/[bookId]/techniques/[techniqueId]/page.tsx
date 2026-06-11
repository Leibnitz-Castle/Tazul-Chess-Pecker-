import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { TechniqueBoardPanel } from "@/components/library/TechniqueBoardPanel";
import { StudyNotebookPanel } from "@/components/library/StudyNotebookPanel";
import { getLibraryTechnique, getAdjacentTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string; techniqueId: string };
}

const STRUCTURAL_TITLE_RE = /^Technique\s+\d+$/i;

function hasRealTitle(title: string): boolean {
  return !STRUCTURAL_TITLE_RE.test(title.trim());
}

export async function generateMetadata({ params }: PageProps) {
  const technique = await getLibraryTechnique(params.techniqueId);
  if (!technique) return { title: "Técnica — Biblioteca" };
  const displayTitle = hasRealTitle(technique.title)
    ? `${technique.title} — ${technique.book.title}`
    : `Técnica ${technique.techniqueNumber} — ${technique.book.title}`;
  return { title: displayTitle };
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const technique = await getLibraryTechnique(params.techniqueId);
  if (!technique) notFound();

  const { prev, next } = await getAdjacentTechniques(
    technique.book.id,
    technique.techniqueNumber
  );

  const baseUrl = `/library/books/${params.bookId}`;

  const examplesForBoard = technique.examples.map((ex) => ({
    id: ex.id,
    fenInitial: ex.fenInitial,
    mainlineMoves: ex.mainlineMoves,
    mainlineLength: ex.mainlineLength,
    eco: ex.eco,
    orderIndex: ex.orderIndex,
  }));

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column" }}>
      {/* Page header */}
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Breadcrumb */}
        <div className="eyebrow flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <Link href="/library" className="hover:text-amber transition-colors">
            Biblioteca
          </Link>
          <span>/</span>
          <Link href={baseUrl} className="hover:text-amber transition-colors truncate max-w-[160px]">
            {technique.book.title}
          </Link>
          <span>/</span>
          <Link
            href={`${baseUrl}/techniques`}
            className="hover:text-amber transition-colors"
          >
            Técnicas
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-2)" }}>
            Técnica {String(technique.techniqueNumber).padStart(2, "0")}
            {hasRealTitle(technique.title) && (
              <> — {technique.title}</>
            )}
          </span>
        </div>

        {/* Prev / Next navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {prev ? (
            <Link href={`${baseUrl}/techniques/${prev.id}`}>
              <Button variant="outline" size="sm" icon="arrowLeft">
                #{prev.techniqueNumber}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" icon="arrowLeft" disabled>
              —
            </Button>
          )}
          {next ? (
            <Link href={`${baseUrl}/techniques/${next.id}`}>
              <Button variant="outline" size="sm" iconRight="arrowRight">
                #{next.techniqueNumber}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" iconRight="arrowRight" disabled>
              —
            </Button>
          )}
        </div>
      </div>

      {/* Technique title bar */}
      <div
        style={{
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: "1px solid var(--line)",
          background: "rgba(200,169,107,0.02)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 6,
            background: "rgba(200,169,107,0.12)",
            color: "var(--amber)",
            border: "1px solid rgba(200,169,107,0.2)",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
          }}
        >
          Técnica {technique.techniqueNumber}
        </span>

        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: hasRealTitle(technique.title) ? "var(--text)" : "var(--text-3)",
            fontStyle: hasRealTitle(technique.title) ? "normal" : "italic",
            flex: 1,
            minWidth: 0,
          }}
        >
          {hasRealTitle(technique.title)
            ? technique.title
            : "Título pendiente de edición propia"}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "var(--text-3)",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          <Icon name="puzzle" size={12} />
          <span>{technique.examples.length} ejemplos</span>
        </div>
      </div>

      {/* 3-zone layout */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left: Example list */}
        <div
          className="hidden md:flex flex-col"
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: "1px solid var(--line)",
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "12px 14px 8px",
              borderBottom: "1px solid var(--line)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-3)",
              flexShrink: 0,
            }}
          >
            Ejemplos ({technique.examples.length})
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {technique.examples.map((ex, i) => (
              <div
                key={ex.id}
                style={{
                  padding: "8px 14px",
                  borderBottom:
                    i < technique.examples.length - 1 ? "1px solid var(--line)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: i === 0 ? 1 : 0.6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-3)",
                    minWidth: 20,
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {ex.eco && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--amber)",
                        fontWeight: 600,
                        fontFamily: "monospace",
                        marginBottom: 1,
                      }}
                    >
                      {ex.eco}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {ex.mainlineLength} jugadas
                  </div>
                </div>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: i === 0 ? "var(--amber)" : "var(--line)",
                    flexShrink: 0,
                    opacity: i === 0 ? 0.7 : 0.4,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center: Board */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 20px",
            gap: 0,
          }}
        >
          <div style={{ width: "100%", maxWidth: 460 }}>
            <TechniqueBoardPanel
              examples={examplesForBoard}
              techniqueNumber={technique.techniqueNumber}
            />
          </div>
        </div>

        {/* Right: Study notebook */}
        <div
          className="hidden lg:block"
          style={{
            width: 256,
            flexShrink: 0,
            borderLeft: "1px solid var(--line)",
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            padding: "18px 16px",
          }}
        >
          <StudyNotebookPanel techniqueNumber={technique.techniqueNumber} />
        </div>
      </div>
    </div>
  );
}
