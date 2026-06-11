"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type LibraryCardStatus = "building" | "coming_soon" | "future";

export interface LibraryCardFeature {
  icon: string;
  label: string;
}

export interface LibraryCardAction {
  label: string;
  href: string;
  icon?: string;
}

interface LibraryCardProps {
  title: string;
  subtitle: string;
  status: LibraryCardStatus;
  accentColor?: string;
  icon: string;
  features: LibraryCardFeature[];
  primaryAction: LibraryCardAction;
  secondaryAction?: LibraryCardAction;
  progress?: number;
  delay?: number;
  className?: string;
}

const STATUS_CONFIG: Record<
  LibraryCardStatus,
  { label: string; variant: "amber" | "default" | "green" }
> = {
  building: { label: "En construcción", variant: "amber" },
  coming_soon: { label: "Próximamente", variant: "default" },
  future: { label: "Futuro", variant: "default" },
};

export function LibraryCard({
  title,
  subtitle,
  status,
  accentColor = "var(--amber)",
  icon,
  features,
  primaryAction,
  secondaryAction,
  progress,
  delay = 0,
  className,
}: LibraryCardProps) {
  const cfg = STATUS_CONFIG[status];
  const isActive = status === "building";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[16px] overflow-hidden animate-card-in",
        "bg-bg-card border border-border-subtle",
        isActive &&
          "transition-all duration-200 hover:border-amber/40 hover:-translate-y-[3px] hover:shadow-amber",
        className
      )}
      style={{ animationDelay: `${delay}ms` } as React.CSSProperties}
    >
      {/* Accent spine */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ background: accentColor, opacity: isActive ? 0.85 : 0.28 }}
      />

      <div className="flex flex-col gap-5 p-6 pl-8 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{
              background: isActive ? "rgba(200,169,107,0.09)" : "var(--bg-2)",
              color: isActive ? accentColor : "var(--text-3)",
              border: `1px solid ${isActive ? "rgba(200,169,107,0.20)" : "var(--line)"}`,
            }}
          >
            <Icon name={icon} size={20} />
          </div>
          <Badge variant={cfg.variant} dot>
            {cfg.label}
          </Badge>
        </div>

        {/* Title & subtitle */}
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 8,
              color: isActive ? "var(--text)" : "var(--text-2)",
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--text-3)", lineHeight: 1.55 }}>
            {subtitle}
          </p>
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-[7px]">
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Progreso</span>
              <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)" }}>
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="h-[4px] rounded-full" style={{ background: "var(--bg-2)" }}>
              <div
                className="h-full rounded-full animate-bar-fill"
                style={{ width: `${progress * 100}%`, background: accentColor }}
              />
            </div>
          </div>
        )}

        {/* Feature tags */}
        <div className="flex flex-wrap gap-[6px]">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-[6px] h-[27px] px-[10px] rounded-full"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line)",
                fontSize: 11.5,
                color: "var(--text-3)",
              }}
            >
              <Icon name={f.icon} size={12} />
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--line)" }} />

      {/* Actions */}
      <div className="flex items-center gap-3 p-5 pl-8">
        <Link href={primaryAction.href} className="flex-1">
          <Button
            variant={isActive ? "amber" : "outline"}
            size="sm"
            icon={primaryAction.icon}
            block
            disabled={!isActive}
          >
            {primaryAction.label}
          </Button>
        </Link>
        {secondaryAction && (
          <Link href={secondaryAction.href}>
            <Button variant="ghost" size="sm" icon={secondaryAction.icon} disabled={!isActive}>
              {secondaryAction.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
