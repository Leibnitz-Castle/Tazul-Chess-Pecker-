import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { getTrainingItems } from "@/lib/db";

interface PageProps {
  searchParams: {
    chapter?: string;
    difficulty?: string;
    side_to_move?: string;
    source?: string;
    page?: string;
  };
}

const DIFFICULTY_BADGE: Record<string, React.ReactNode> = {
  easy: <Badge variant="green">easy</Badge>,
  intermediate: (
    <span className="inline-flex items-center h-[22px] px-[9px] rounded-full text-[11.5px] font-semibold border" style={{ background: "rgba(196,138,65,0.14)", color: "#D4A44E", borderColor: "rgba(196,138,65,0.30)" }}>intermediate</span>
  ),
  advanced: <Badge variant="red">advanced</Badge>,
};

export default async function WoodpeckerListPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1);
  const limit = 30;
  const offset = (page - 1) * limit;

  const filters = {
    chapter: searchParams.chapter,
    difficulty: searchParams.difficulty as "easy" | "intermediate" | "advanced" | undefined,
    side_to_move: searchParams.side_to_move as "w" | "b" | undefined,
    source_name: searchParams.source,
    limit,
    offset,
  };

  let items: Awaited<ReturnType<typeof getTrainingItems>>["items"] = [];
  let totalCount = 0;

  try {
    const result = await getTrainingItems(filters);
    items = result.items;
    totalCount = result.total;
  } catch {
    // DB not ready yet — show empty state
  }

  const totalPages = Math.ceil(totalCount / limit);
  const currentChapter = searchParams.chapter ?? "All chapters";

  return (
    <div className="animate-fade-in" style={{ padding: 28, maxWidth: 1480, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3">
          <Link href="/practice" className="text-text-muted hover:text-text-main transition-colors">
            <Icon name="arrowLeft" size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {currentChapter}
            </h1>
            <p className="text-text-secondary" style={{ fontSize: 13, marginTop: 2 }}>
              {totalCount.toLocaleString()} exercises
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <Link href={`/practice/woodpecker/${items[0].id}`}>
            <Button variant="amber" icon="bolt">Start from first</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 20 }}>
        {["All", "easy", "intermediate", "advanced"].map((d) => (
          <Link
            key={d}
            href={`/practice/woodpecker?${new URLSearchParams({ ...(searchParams.chapter ? { chapter: searchParams.chapter } : {}), ...(d !== "All" ? { difficulty: d } : {}) }).toString()}`}
          >
            <button
              className="inline-flex items-center gap-[7px] px-[14px] py-2 rounded-full text-[13px] font-[550] border cursor-pointer transition-all"
              style={{
                background: (searchParams.difficulty === d || (d === "All" && !searchParams.difficulty))
                  ? "rgba(200,169,107,0.10)"
                  : "var(--surface-2)",
                color: (searchParams.difficulty === d || (d === "All" && !searchParams.difficulty))
                  ? "var(--amber-bright)"
                  : "var(--text-2)",
                borderColor: (searchParams.difficulty === d || (d === "All" && !searchParams.difficulty))
                  ? "rgba(200,169,107,0.48)"
                  : "var(--line)",
              }}
            >
              {d}
            </button>
          </Link>
        ))}
        <Link
          href={`/practice/woodpecker?${new URLSearchParams({ ...(searchParams.chapter ? { chapter: searchParams.chapter } : {}), ...(searchParams.difficulty ? { difficulty: searchParams.difficulty } : {}), side_to_move: searchParams.side_to_move === "w" ? "" : "w" }).toString()}`}
        >
          <button
            className="inline-flex items-center gap-[7px] px-[14px] py-2 rounded-full text-[13px] font-[550] border cursor-pointer transition-all"
            style={{
              background: searchParams.side_to_move === "w" ? "rgba(200,169,107,0.10)" : "var(--surface-2)",
              color: searchParams.side_to_move === "w" ? "var(--amber-bright)" : "var(--text-2)",
              borderColor: searchParams.side_to_move === "w" ? "rgba(200,169,107,0.48)" : "var(--line)",
            }}
          >
            White to move
          </button>
        </Link>
        <Link
          href={`/practice/woodpecker?${new URLSearchParams({ ...(searchParams.chapter ? { chapter: searchParams.chapter } : {}), ...(searchParams.difficulty ? { difficulty: searchParams.difficulty } : {}), side_to_move: searchParams.side_to_move === "b" ? "" : "b" }).toString()}`}
        >
          <button
            className="inline-flex items-center gap-[7px] px-[14px] py-2 rounded-full text-[13px] font-[550] border cursor-pointer transition-all"
            style={{
              background: searchParams.side_to_move === "b" ? "rgba(200,169,107,0.10)" : "var(--surface-2)",
              color: searchParams.side_to_move === "b" ? "var(--amber-bright)" : "var(--text-2)",
              borderColor: searchParams.side_to_move === "b" ? "rgba(200,169,107,0.48)" : "var(--line)",
            }}
          >
            Black to move
          </button>
        </Link>
      </div>

      {/* Exercise list */}
      {items.length === 0 ? (
        <Card style={{ padding: "48px 32px", textAlign: "center", maxWidth: 480, margin: "40px auto" }}>
          <div
            style={{ width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--amber-ghost)", color: "var(--amber)", margin: "0 auto 16px" }}
          >
            <Icon name="puzzle" size={22} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No exercises yet</div>
          <p className="text-text-secondary" style={{ fontSize: 14, marginBottom: 20 }}>
            The database needs to be seeded. Run <code className="mono" style={{ fontSize: 12 }}>npm run db:seed</code> to import the Woodpecker exercises.
          </p>
        </Card>
      ) : (
        <>
          <div
            className="stagger"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}
          >
            {items.map((item) => (
              <Link key={item.id} href={`/practice/woodpecker/${item.id}`}>
                <Card hover className="animate-card-in h-full">
                  <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                    {item.difficulty ? DIFFICULTY_BADGE[item.difficulty] : <Badge>{item.source_name === "The Woodpecker Method" ? "WM1" : "WM2"}</Badge>}
                    <span
                      className="w-3 h-3 rounded-[3px] border"
                      style={{
                        background: item.side_to_move === "w" ? "#f8f5ee" : "#26201a",
                        borderColor: "var(--line)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-2)" }}>
                    Exercise #{item.exercise_number}
                  </div>
                  <div
                    className="mono text-text-muted"
                    style={{ fontSize: 10.5, wordBreak: "break-all", lineHeight: 1.4 }}
                  >
                    {item.fen.split(" ")[0]}
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                    {item.tags.map((t) => (
                      <Badge key={t} style={{ fontSize: 10 }}>{t}</Badge>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3" style={{ marginTop: 28 }}>
              {page > 1 && (
                <Link href={`/practice/woodpecker?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
                  <Button variant="outline" icon="prev" size="sm">Previous</Button>
                </Link>
              )}
              <span className="text-text-muted" style={{ fontSize: 13 }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/practice/woodpecker?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
                  <Button variant="outline" iconRight="next" size="sm">Next</Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
