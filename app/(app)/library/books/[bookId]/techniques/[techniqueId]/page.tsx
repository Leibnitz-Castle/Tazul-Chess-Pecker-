import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getLibraryTechnique, getAdjacentTechniques } from "@/lib/library/queries";

interface PageProps {
  params: { bookId: string; techniqueId: string };
}

export default async function TechniqueDetailPage({ params }: PageProps) {
  const technique = await getLibraryTechnique(params.techniqueId);
  if (!technique) notFound();

  const { prev, next } = await getAdjacentTechniques(
    technique.book.id,
    technique.techniqueNumber
  );

  const baseUrl = `/library/books/${params.bookId}`;

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="eyebrow flex items-center gap-2 mb-5 flex-wrap">
        <Link href="/library" className="hover:text-amber transition-colors">
          Biblioteca Dinámica
        </Link>
        <span>/</span>
        <Link href={`${baseUrl}`} className="hover:text-amber transition-colors">
          {technique.book.title}
        </Link>
        <span>/</span>
        <Link href={`${baseUrl}/techniques`} className="hover:text-amber transition-colors">
          Técnicas
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-2)" }}>
          Técnica {technique.techniqueNumber}
        </span>
      </div>

      {/* Technique header */}
      <div
        className="rounded-[16px] p-6 mb-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderLeft: "3px solid var(--amber)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="rounded-[8px] px-2 py-1 mono"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  background: "rgba(200,169,107,0.12)",
                  color: "var(--amber)",
                  border: "1px solid rgba(200,169,107,0.2)",
                }}
              >
                #{technique.techniqueNumber}
              </span>
              {technique.difficulty && (
                <Badge variant="default">{technique.difficulty}</Badge>
              )}
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              {technique.title}
            </h1>
            {technique.tags.length > 0 && (
              <div className="flex flex-wrap gap-[5px] mt-2">
                {technique.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      color: "var(--text-3)",
                      background: "var(--bg-2)",
                      border: "1px solid var(--line)",
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Icon name="puzzle" size={14} style={{ color: "var(--text-3)" }} />
            <span style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 600 }}>
              {technique.examples.length} examples
            </span>
          </div>
        </div>
      </div>

      {/* Examples list */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 14 }}>
          Examples ({technique.examples.length})
        </h2>

        <div className="flex flex-col gap-2">
          {technique.examples.map((ex, i) => (
            <div
              key={ex.id}
              className="rounded-[12px] p-4 flex items-start gap-3"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Index */}
              <div
                className="flex-shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center"
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                {ex.eco && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--amber)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 2,
                    }}
                  >
                    {ex.eco}
                  </span>
                )}
                <div
                  className="mono truncate"
                  style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 3 }}
                  title={ex.fenInitial}
                >
                  {ex.fenInitial}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                  {ex.mainlineLength} moves
                  {ex.mainlineMoves.slice(0, 5).join(" ")}{ex.mainlineLength > 5 ? " …" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div
        className="flex items-center justify-between pt-5"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        {prev ? (
          <Link href={`${baseUrl}/techniques/${prev.id}`}>
            <Button variant="outline" size="sm" icon="arrowLeft">
              #{prev.techniqueNumber}
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <Link href={`${baseUrl}/techniques`}>
          <Button variant="ghost" size="sm">
            Todas las técnicas
          </Button>
        </Link>

        {next ? (
          <Link href={`${baseUrl}/techniques/${next.id}`}>
            <Button variant="outline" size="sm" icon="arrowRight">
              #{next.techniqueNumber}
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
