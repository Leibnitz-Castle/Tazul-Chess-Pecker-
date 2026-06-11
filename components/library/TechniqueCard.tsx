import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface TechniqueCardProps {
  techniqueNumber: number;
  title: string;
  examplesCount: number;
  difficulty?: string | null;
  tags?: string[];
  href: string;
  locked?: boolean;
  className?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#7DB892",
  medium: "#C8A96B",
  hard: "#E07070",
};

export function TechniqueCard({
  techniqueNumber,
  title,
  examplesCount,
  difficulty,
  tags,
  href,
  locked = false,
  className,
}: TechniqueCardProps) {
  const dotColor = difficulty ? DIFFICULTY_COLORS[difficulty] ?? "var(--text-3)" : "var(--amber)";

  return (
    <Link
      href={locked ? "#" : href}
      className={cn(
        "group block rounded-[12px] p-4 transition-all duration-200",
        "bg-bg-card border border-border-subtle",
        !locked && "hover:border-amber/30 hover:bg-[rgba(200,169,107,0.04)] cursor-pointer",
        locked && "opacity-50 cursor-default",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Technique number */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-[8px] flex items-center justify-center"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--line)",
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: "var(--text-2)",
          }}
        >
          {techniqueNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Difficulty dot */}
            <span
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ background: dotColor }}
            />
            <span
              className="truncate"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}
            >
              {title}
            </span>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 mb-2">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10,
                    color: "var(--text-3)",
                    background: "var(--bg-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: "var(--text-3)" }}
          >
            <Icon name="puzzle" size={11} />
            <span>{examplesCount} examples</span>
          </div>
        </div>

        {!locked && (
          <Icon
            name="arrowRight"
            size={14}
            style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 2, transition: "color 200ms" }}
            className="group-hover:text-amber"
          />
        )}
      </div>
    </Link>
  );
}
