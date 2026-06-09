import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type ButtonVariant = "amber" | "outline" | "ghost" | "danger" | "green";
type ButtonSize = "lg" | "sm" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  amber: "bg-amber text-[#1E1812] shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_1px_2px_rgba(0,0,0,.28)] hover:bg-amber-bright hover:shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_3px_10px_rgba(0,0,0,.3)]",
  outline: "bg-bg-panel text-text-main shadow-[inset_0_0_0_1px_#3B342D] hover:bg-bg-elevated hover:shadow-[inset_0_0_0_1px_#4a4138]",
  ghost: "bg-transparent text-text-secondary hover:bg-bg-panel hover:text-text-main",
  danger: "bg-error text-[#F6E9E7] hover:brightness-110",
  green: "bg-success text-[#EAF3EC] hover:brightness-110",
};

const sizeClasses: Record<string, string> = {
  default: "h-10 px-4 text-sm rounded-[10px]",
  lg: "h-12 px-[22px] text-[15px] rounded-[14px]",
  sm: "h-8 px-3 text-[13px] rounded-[6px]",
  icon: "w-10 h-10 p-0 rounded-[10px]",
  "icon-sm": "w-8 h-8 p-0 rounded-[6px]",
};

export function Button({
  variant = "outline",
  size,
  icon,
  iconRight,
  loading,
  block,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const isIconOnly = !children;
  const sizeKey = isIconOnly ? (size === "sm" ? "icon-sm" : "icon") : size ?? "default";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap cursor-pointer",
        variantClasses[variant],
        sizeClasses[sizeKey],
        block && "w-full",
        className
      )}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? (
        <span className="w-[15px] h-[15px] rounded-full border-2 border-white/25 border-t-current animate-spin inline-block" />
      ) : (
        icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />
      )}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}
