"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home, Dumbbell, ListChecks, CalendarCheck2, BarChart3,
  LogOut, Flame, User, ChevronDown,
} from "lucide-react";
import { type ReactNode } from "react";
import Image from "next/image";
import logo from "@/assets/logo-trans.png";

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  highlight?: boolean;
}

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/exercises", label: "Exercise", icon: Dumbbell },
  { to: "/today", label: "Today", icon: CalendarCheck2, highlight: true },
  { to: "/plans", label: "Plans", icon: ListChecks },
  { to: "/stats", label: "Stats", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off">
        <div className="flex items-center gap-2" style={{ color: "#888" }}>
          <Flame className="h-5 w-5 animate-pulse" style={{ color: "#C41230" }} />
          <span className="text-sm font-medium">Memuat...</span>
        </div>
      </div>
    );
  }

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <div className="flex min-h-screen w-full bg-off">
      <aside
        className="hidden md:flex md:w-64 md:flex-col"
        style={{ background: "#fff", borderRight: "1.5px solid rgba(0,0,0,0.07)" }}
      >
        <div className="flex h-16 items-center gap-2.5 px-6" style={{ borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}>
          <Image src={logo} alt="Logo" width={32} height={32} className="rounded-lg" />
          <div>
            <div className="font-display text-lg" style={{ color: "#0F0A0B" }}>DailyFit</div>
            <div className="text-[9px] uppercase tracking-[3px]" style={{ color: "#bbb" }}>Stay Strong</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: active ? "#C41230" : "transparent",
                  color: active ? "#fff" : "rgba(15,10,11,0.5)",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0F0A0B"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = active ? "#C41230" : "transparent"; e.currentTarget.style.color = active ? "#fff" : "rgba(15,10,11,0.5)"; }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-0.5" style={{ borderTop: "1.5px solid rgba(0,0,0,0.07)" }}>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{
              background: isActive("/profile") ? "#C41230" : "transparent",
              color: isActive("/profile") ? "#fff" : "rgba(15,10,11,0.5)",
            }}
            onMouseEnter={(e) => { if (!isActive("/profile")) { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#0F0A0B"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = isActive("/profile") ? "#C41230" : "transparent"; e.currentTarget.style.color = isActive("/profile") ? "#fff" : "rgba(15,10,11,0.5)"; }}
          >
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: isActive("/profile") ? "rgba(255,255,255,0.2)" : "rgba(196,18,48,0.1)",
                color: isActive("/profile") ? "#fff" : "#C41230",
              }}
            >
              {initials}
            </div>
            <span className="truncate">{session?.user?.name ?? "Profile"}</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            style={{ color: "rgba(15,10,11,0.4)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(196,18,48,0.06)"; e.currentTarget.style.color = "#C41230"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(15,10,11,0.4)"; }}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header
          className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between px-4 backdrop-blur"
          style={{ background: "rgba(246,244,241,0.92)", borderBottom: "1.5px solid rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: "#C41230" }}>
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-display text-lg" style={{ color: "#0F0A0B" }}>DailyFit</span>
          </div>

          <div className="relative group">
            <button
              className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#C41230" }}>
                {initials}
              </div>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: "rgba(15,10,11,0.3)" }} />
            </button>
            <div
              className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl overflow-hidden opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50"
              style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
            >
              <Link href="/profile"
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition"
                style={{ color: "#0F0A0B" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F4F1")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <User className="h-4 w-4" style={{ color: "#888" }} />
                My Profile
              </Link>
              <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "0 12px" }} />
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition"
                style={{ color: "#C41230" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,18,48,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-28 md:pb-0">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* ── Mobile Floating Bottom Nav ── */}
        <div className="md:hidden fixed bottom-5 inset-x-4 z-30">
          <nav
            className="rounded-2xl"
            style={{
              background: "rgba(15,10,11,0.92)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="grid grid-cols-5 px-1 py-1.5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);

                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all active:scale-95"
                    style={{
                      background: active ? "#C41230" : "transparent",
                    }}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors"
                      style={{ color: active ? "#fff" : "rgba(255,255,255,0.35)" }}
                    />
                    <span
                      className="text-[9px] font-semibold tracking-wide leading-none"
                      style={{ color: active ? "#fff" : "rgba(255,255,255,0.35)" }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}