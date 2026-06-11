import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Progress } from "@/components/ui/Progress";

interface BookProgressCardProps {
  title: string;
  totalSections: number;
  completedSections: number;
  totalExercises: number;
  completedExercises: number;
  accuracy?: number;
  accentColor?: string;
  className?: string;
}

export function BookProgressCard({
  title,
  totalSections,
  completedSections,
  totalExercises,
  completedExercises,
  accuracy,
  accentColor = "var(--amber)",
  className,
}: BookProgressCardProps) {
  const sectionProgress = totalSections > 0 ? completedSections / totalSections : 0;
  const exerciseProgress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  return (
    <div
      className={cn(
        "rounded-[14px] p-5 flex flex-col gap-4",
        "bg-bg-card border border-border-subtle",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(200,169,107,0.09)", color: accentColor }}
        >
          <Icon name="book" size={17} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>
            {completedSections}/{totalSections} secciones
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Secciones</span>
            <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)" }}>
              {Math.round(sectionProgress * 100)}%
            </span>
          </div>
          <Progress value={sectionProgress} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Ejercicios</span>
            <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)" }}>
              {completedExercises}/{totalExercises}
            </span>
          </div>
          <Progress value={exerciseProgress} />
        </div>
      </div>

      {accuracy !== undefined && (
        <div
          className="flex items-center justify-between rounded-[8px] px-3 py-2"
          style={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
        >
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>Precisión</span>
          <span
            className="mono tnum"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: accuracy >= 0.75 ? "#7DB892" : accuracy >= 0.5 ? "var(--amber)" : "#C9817A",
            }}
          >
            {Math.round(accuracy * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
