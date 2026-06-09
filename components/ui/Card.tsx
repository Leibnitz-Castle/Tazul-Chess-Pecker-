import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  pad?: boolean;
  children: React.ReactNode;
}

export function Card({ hover, pad = true, className, children, style, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border-subtle rounded-[14px] relative",
        pad && "p-6",
        hover && "cursor-pointer transition-all duration-[160ms] ease-out hover:border-amber/40 hover:shadow-amber hover:-translate-y-[3px]",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeadProps {
  title: string;
  icon?: string;
  action?: React.ReactNode;
}

export function CardHead({ title, icon, action }: CardHeadProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: "var(--text-3)" }}><Icon name={icon} size={15} /></span>}
        <span className="text-[13px] font-[650] tracking-[0.01em] text-text-main">{title}</span>
      </div>
      {action}
    </div>
  );
}
