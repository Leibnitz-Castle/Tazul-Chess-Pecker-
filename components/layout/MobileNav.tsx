"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

const ITEMS = [
  { id: "dashboard", label: "Home", icon: "home", href: "/dashboard" },
  { id: "practice", label: "Practice", icon: "practice", href: "/practice" },
  { id: "profile", label: "Profile", icon: "profile", href: "/profile" },
  { id: "design-system", label: "System", icon: "grid", href: "/design-system" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
      style={{
        height: 62,
        background: "rgba(20,17,15,.94)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid var(--line-soft)",
        padding: "0 6px",
        justifyContent: "space-around",
        alignItems: "stretch",
      }}
    >
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center justify-center gap-[3px] flex-1"
            style={{
              color: active ? "var(--amber)" : "var(--text-3)",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <Icon name={item.icon} size={21} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
