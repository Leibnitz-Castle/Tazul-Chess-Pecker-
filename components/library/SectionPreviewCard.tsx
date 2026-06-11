import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type SectionStatus = "available" | "locked" | "completed" | "in_progress";

interface SectionPreviewCardProps {
  sectionNumber: number;
  title: string;
  description: string;
  status: SectionStatus;
  exerciseCount: number;
  completedCount?: number;
  tags?: string[];
  href: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  SectionStatus,
  { label: string; variant: "amber" | "default" | "green" | "red" }
> = {
  available: { label: "Disponible", variant: "default" },
  locked: { label: "Bloqueado", variant: "default" },
  completed: { label: "Completado", variant: "green" },
  in_progress: { label: "En progreso", variant: "amber" },
};

export function SectionPreviewCard({
  sectionNumber,
  title,
  description,
  status,
  exerciseCount,
  completedCount,
  tags,
  href,
  className,
}: SectionPreviewCardProps) {
  const cfg = STATUS_CONFIG[status];
  const locked = status === "locked";
  const progress = completedCount !== undefined && exerciseCount > 0
    ? completedCount / exerciseCount
    : undefined;

  return (
    <div
      className={cn(
        "rounded-[14px] p-5 flex gap-4 bg-bg-card border border-border-subtle",
        !locked && "transition-all duration-200 hover:border-amber/30",
        locked && "opacity-60",
        className
      )}
    >
      {/* Section number badge */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center"
        style={{
          background: status === "completed" ? "rgba(78,138,98,0.12)" : "var(--bg-2)",
          border: `1px solid ${status === "completed" ? "rgba(78,138,98,0.24)" : "var(--line)"}`,
          color: status === "completed" ? "#7DB892" : "var(--text-3)",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {status === "completed" ? <Icon name="check" size={16} /> : sectionNumber}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5, marginBottom: 10 }}>
          {description}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-[5px] mb-3">
            {tags.map((tag) => (
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-3)" }}>
              <Icon name="puzzle" size={12} />
              {exerciseCount} ejercicios
            </span>
            {progress !== undefined && (
              <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)" }}>
                {completedCount}/{exerciseCount}
              </span>
            )}
          </div>
          <Link href={locked ? "#" : href}>
            <Button variant={locked ? "ghost" : "outline"} size="sm" icon={locked ? undefined : "arrowRight"} disabled={locked}>
              {locked ? "Bloqueado" : "Abrir"}
            </Button>
          </Link>
        </div>

        {/* Progress strip */}
        {progress !== undefined && (
          <div className="mt-3 h-[3px] rounded-full" style={{ background: "var(--bg-2)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${progress * 100}%`, background: "var(--amber)" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
