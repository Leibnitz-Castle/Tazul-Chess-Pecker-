"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

interface SidebarSection {
  id: string;
  label: string;
  href: string;
  icon?: string;
  status?: "done" | "active" | "locked";
  count?: number;
}

interface LibrarySidebarPanelProps {
  bookTitle: string;
  bookHref: string;
  sections: SidebarSection[];
}

export function LibrarySidebarPanel({
  bookTitle,
  bookHref,
  sections,
}: LibrarySidebarPanelProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        width: 240,
        background: "var(--bg-2)",
        borderRight: "1px solid var(--line)",
        padding: "20px 12px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Link
        href={bookHref}
        className="flex items-center gap-2 mb-5 px-2 group"
        style={{ color: "var(--text-3)" }}
      >
        <Icon name="arrowLeft" size={14} />
        <span style={{ fontSize: 12, fontWeight: 600 }} className="group-hover:text-text-main transition-colors">
          {bookTitle}
        </span>
      </Link>

      <div
        className="flex items-center gap-2 px-2 mb-4"
        style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}
      >
        <Icon name="layers" size={14} style={{ color: "var(--text-3)" }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Secciones
        </span>
        <Badge variant="default" style={{ marginLeft: "auto" }}>{sections.length}</Badge>
      </div>

      <nav className="flex flex-col gap-[2px]">
        {sections.map((s) => {
          const active = pathname === s.href || pathname.startsWith(s.href + "/");
          const locked = s.status === "locked";
          return (
            <Link
              key={s.id}
              href={locked ? "#" : s.href}
              className={cn(
                "flex items-center gap-3 h-[38px] px-3 rounded-[8px] text-[13px] font-[550] relative transition-all duration-[140ms]",
                active
                  ? "text-text-main bg-[rgba(200,169,107,0.07)] shadow-[inset_0_0_0_1px_rgba(200,169,107,0.12)]"
                  : locked
                  ? "text-text-muted cursor-not-allowed opacity-50"
                  : "text-text-secondary hover:text-text-main hover:bg-bg-card"
              )}
            >
              {active && (
                <span
                  className="absolute rounded-r-[3px] bg-amber"
                  style={{ left: -12, top: 7, bottom: 7, width: 2.5 }}
                />
              )}
              {s.icon ? (
                <Icon
                  name={s.icon}
                  size={15}
                  style={{ color: active ? "var(--amber)" : undefined, flexShrink: 0 }}
                />
              ) : (
                <span
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 18,
                    height: 18,
                    background: s.status === "done" ? "rgba(200,169,107,0.18)" : "var(--bg)",
                    border: "1px solid var(--line)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.status === "done" ? "var(--amber)" : "var(--text-3)",
                  }}
                >
                  {s.status === "done" ? (
                    <Icon name="check" size={10} />
                  ) : (
                    s.count ?? ""
                  )}
                </span>
              )}
              <span className="truncate flex-1">{s.label}</span>
              {locked && <Icon name="chevRight" size={13} style={{ flexShrink: 0, opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
