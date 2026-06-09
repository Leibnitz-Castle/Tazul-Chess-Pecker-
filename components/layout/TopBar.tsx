"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/practice": "Practice",
  "/openings": "Openings",
  "/elite-warehouse": "Elite Warehouse",
  "/profile": "Profile",
  "/design-system": "Design System",
};

export function TopBar() {
  const pathname = usePathname();

  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Pecker";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between sticky top-0 z-30 border-b border-border-soft"
      style={{
        height: "var(--topbar-h)",
        background: "rgba(22,19,17,.82)",
        backdropFilter: "blur(12px)",
        padding: "0 28px",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[17px] font-bold tracking-[-0.02em] hidden md:block">{title}</span>
        <div className="block md:hidden">
          <Logo size={18} wordmark={false} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-[10px] text-text-secondary hover:bg-bg-panel hover:text-text-main transition-colors">
          <Icon name="search" size={16} />
        </button>
        <div
          className="flex items-center gap-[6px] h-8 px-3 rounded-full border"
          style={{
            background: "var(--amber-ghost)",
            borderColor: "rgba(200,169,107,.32)",
            color: "var(--amber-bright)",
            fontWeight: 650,
            fontSize: 13,
          }}
        >
          <Icon name="flame" size={13} fill />
          <span>7 days</span>
        </div>
        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
          <Avatar name="A" size={32} />
          <span className="hidden md:block text-[13.5px] font-semibold">Player</span>
        </Link>
      </div>
    </header>
  );
}
