import { cn } from "@/lib/utils";

type BadgeVariant = "amber" | "green" | "red" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-bg-panel text-text-secondary border-border-subtle",
  amber: "bg-[rgba(200,169,107,0.10)] text-amber-bright border-[rgba(200,169,107,0.28)]",
  green: "bg-[rgba(78,138,98,0.14)] text-[#7DB892] border-[rgba(78,138,98,0.30)]",
  red: "bg-[rgba(164,77,69,0.15)] text-[#C9817A] border-[rgba(164,77,69,0.30)]",
};

export function Badge({ variant = "default", dot, children, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] h-[22px] px-[9px] rounded-full text-[11.5px] font-semibold tracking-[0.01em] border",
        dot && "before:content-[''] before:w-[6px] before:h-[6px] before:rounded-full before:bg-current",
        variantClasses[variant]
      )}
      style={style}
    >
      {children}
    </span>
  );
}

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-[7px] px-[14px] py-2 rounded-full text-[13px] font-[550] border cursor-pointer transition-all duration-[140ms] select-none",
        active
          ? "bg-[rgba(200,169,107,0.10)] text-amber-bright border-[rgba(200,169,107,0.48)]"
          : "bg-bg-panel text-text-secondary border-border-subtle hover:text-text-main hover:border-[#4a4138]"
      )}
    >
      {children}
    </button>
  );
}
