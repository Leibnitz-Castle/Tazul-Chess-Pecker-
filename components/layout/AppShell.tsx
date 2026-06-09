import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden md:flex">
        <AppSidebar />
      </div>
      <main className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        <TopBar />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
