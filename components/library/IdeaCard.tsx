import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

type IdeaType = "principle" | "technique" | "plan" | "warning" | "example";

interface IdeaCardProps {
  type?: IdeaType;
  title: string;
  body: string;
  tags?: string[];
  positionFen?: string;
  className?: string;
}

const TYPE_CONFIG: Record<
  IdeaType,
  { icon: string; label: string; accent: string; bg: string; border: string }
> = {
  principle: {
    icon: "star",
    label: "Principio",
    accent: "var(--amber)",
    bg: "rgba(200,169,107,0.06)",
    border: "rgba(200,169,107,0.18)",
  },
  technique: {
    icon: "bolt",
    label: "Técnica",
    accent: "#7A9EA8",
    bg: "rgba(122,158,168,0.06)",
    border: "rgba(122,158,168,0.20)",
  },
  plan: {
    icon: "arrowRight",
    label: "Plan",
    accent: "#7D9E82",
    bg: "rgba(125,158,130,0.06)",
    border: "rgba(125,158,130,0.20)",
  },
  warning: {
    icon: "x",
    label: "Cuidado",
    accent: "#C9817A",
    bg: "rgba(164,77,69,0.08)",
    border: "rgba(164,77,69,0.22)",
  },
  example: {
    icon: "target",
    label: "Ejemplo",
    accent: "var(--text-2)",
    bg: "var(--bg-2)",
    border: "var(--line)",
  },
};

export function IdeaCard({ type = "principle", title, body, tags, className }: IdeaCardProps) {
  const cfg = TYPE_CONFIG[type];

  return (
    <div
      className={cn("rounded-[12px] p-4 flex gap-3", className)}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div
        className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 mt-[1px]"
        style={{ background: cfg.border, color: cfg.accent }}
      >
        <Icon name={cfg.icon} size={14} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-[6px]">
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: cfg.accent, textTransform: "uppercase" }}>
            {cfg.label}
          </span>
          {title && (
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{title}</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{body}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-[5px] mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
