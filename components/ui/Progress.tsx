import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-1
  green?: boolean;
  animate?: boolean;
  className?: string;
}

export function Progress({ value, green, animate, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className={cn("progress", className)}>
      <div
        className={cn("progress-bar", green && "green", animate && "animate-bar-fill")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
