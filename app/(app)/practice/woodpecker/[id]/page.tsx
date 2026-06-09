import { notFound } from "next/navigation";
import { PuzzlePlayer } from "@/components/practice/PuzzlePlayer";
import { getTrainingItemById } from "@/lib/db";

interface PageProps {
  params: { id: string };
}

export default async function PuzzlePage({ params }: PageProps) {
  let item;
  try {
    item = await getTrainingItemById(params.id);
  } catch {
    // DB not ready — show placeholder
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Database not ready</div>
        <p className="text-text-secondary" style={{ fontSize: 14 }}>
          Run <code className="mono">npm run db:seed</code> to import exercises.
        </p>
      </div>
    );
  }

  if (!item) notFound();

  return <PuzzlePlayer item={item} />;
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const item = await getTrainingItemById(params.id);
    if (!item) return { title: "Puzzle — Pecker Chess" };
    return {
      title: `Exercise #${item.exercise_number} · ${item.chapter ?? item.source_name} — Pecker Chess`,
    };
  } catch {
    return { title: "Puzzle — Pecker Chess" };
  }
}
