import { notFound } from "next/navigation";
import { getSeriesById, getActiveCycle } from "@/lib/db";
import { SeriesPracticeClient } from "@/components/practice/SeriesPracticeClient";

interface PageProps {
  params: { id: string };
}

export default async function SeriesPracticePage({ params }: PageProps) {
  let data;
  try {
    data = await getSeriesById(params.id);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Database not ready</div>
        <p className="text-text-secondary" style={{ fontSize: 14 }}>
          Run <code className="mono">npm run db:seed</code> to import exercises.
        </p>
      </div>
    );
  }

  if (!data) notFound();

  const { series, activeCycle, currentExercise, solvedInCycle, progress } = data;

  if (!currentExercise) {
    // All exercises done — redirect to summary
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Series complete!</div>
        <a
          href={`/practice/series/${params.id}/summary`}
          className="text-amber font-semibold"
          style={{ fontSize: 14 }}
        >
          View cycle summary →
        </a>
      </div>
    );
  }

  const cycleStats = activeCycle
    ? {
        solvedCount: activeCycle.solvedCount,
        correctCount: activeCycle.correctCount,
        incorrectCount: activeCycle.incorrectCount,
        accuracy: activeCycle.accuracy,
        averageTimeMs: activeCycle.averageTimeMs,
        bestStreak: activeCycle.bestStreak,
      }
    : {
        solvedCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        averageTimeMs: 0,
        bestStreak: 0,
      };

  return (
    <SeriesPracticeClient
      seriesId={series.id}
      seriesTitle={series.title}
      cycleNumber={activeCycle?.cycleNumber ?? 1}
      initialExercise={currentExercise}
      initialProgress={progress}
      initialCycleStats={cycleStats}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const data = await getSeriesById(params.id);
    if (!data) return { title: "Training — Pecker Chess" };
    return { title: `${data.series.title} — Pecker Chess` };
  } catch {
    return { title: "Training — Pecker Chess" };
  }
}
