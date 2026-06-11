"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const NAV = [
  { id: "dashboard", label: "Home", icon: "home", href: "/dashboard" },
  { id: "practice", label: "Practice", icon: "practice", href: "/practice" },
  { id: "library", label: "Biblioteca Dinámica", icon: "library", href: "/library" },
  { id: "warehouse", label: "Elite Warehouse", icon: "warehouse", href: "/elite-warehouse" },
  { id: "profile", label: "Profile", icon: "profile", href: "/profile" },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex-shrink-0 flex flex-col sticky top-0 h-screen border-r border-border-soft"
      style={{ width: "var(--sidebar-w)", background: "var(--bg-2)", padding: "18px 14px" }}
    >
      <div style={{ padding: "4px 8px 22px" }}>
        <Logo size={20} />
      </div>

      <nav className="flex flex-col gap-[3px]">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className={cn(
              "flex items-center gap-3 h-[42px] px-3 rounded-[10px] text-[14px] font-[550] relative transition-all duration-[140ms]",
              isActive(n.href)
                ? "text-text-main bg-[rgba(200,169,107,0.07)] shadow-[inset_0_0_0_1px_rgba(200,169,107,0.12)]"
                : "text-text-secondary hover:text-text-main hover:bg-bg-card"
            )}
          >
            {isActive(n.href) && (
              <span
                className="absolute rounded-r-[3px] bg-amber"
                style={{ left: -14, top: 8, bottom: 8, width: 3 }}
              />
            )}
            <Icon
              name={n.icon}
              size={19}
              style={{ color: isActive(n.href) ? "var(--amber)" : undefined }}
            />
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      <Link
        href="/design-system"
        className={cn(
          "flex items-center gap-3 h-[42px] px-3 rounded-[10px] text-[14px] font-[550] mb-1 transition-all duration-[140ms]",
          pathname === "/design-system"
            ? "text-text-main bg-[rgba(200,169,107,0.07)]"
            : "text-text-secondary hover:text-text-main hover:bg-bg-card"
        )}
      >
        <Icon name="grid" size={19} /> Design System
      </Link>

      <div
        className="rounded-[14px] p-[14px]"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <div className="flex items-center gap-2 mb-[6px]">
          <Icon name="bolt" size={14} style={{ color: "var(--amber)" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>Pecker Pro</span>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 10 }}>
          Unlimited sets, engine analysis, Elite Warehouse.
        </div>
        <Button variant="amber" size="sm" block>
          Upgrade
        </Button>
      </div>
    </aside>
  );
}
