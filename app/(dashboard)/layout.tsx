import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AiAssistant } from "@/components/ai-assistant/ai-assistant"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { NavLinks } from "./nav-links"
import { TopBar } from "./topbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/sign-in")

  const user        = session.user as any
  const initials    = (user?.name ?? user?.email ?? "?")
    .split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("") || "?"
  const displayName = user?.name ?? user?.email ?? ""
  const role        = user?.role?.toLowerCase() ?? "member"
  const isAdmin     = user?.role === "ADMIN"

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--s-bg)" }}>

      {/* ── Desktop Sidebar — hidden on mobile ── */}
      <aside
        className="hidden lg:flex"
        style={{
          width: "220px", flexShrink: 0,
          background: "var(--s-accent)",
          flexDirection: "column",
          position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 40,
        }}
      >
        {/* Brand */}
        <div style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.4px" }}>
            AttendSync
          </div>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "3px", letterSpacing: "0.08em" }}>
            ATTENDANCE PLATFORM
          </div>
        </div>

        {/* Nav links */}
        <NavLinks isAdmin={isAdmin} />

        {/* User row — sign out on the far right */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", gap: "9px",
        }}>
          <div style={{
            width: "26px", height: "26px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: "11px", color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.38)" }}>
              {role}
            </div>
          </div>
          {/* Sign out — far right of user row */}
          <SignOutButton variant="dark" />
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="lg:ml-[220px]" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Mobile-only top bar (breadcrumb + hamburger + sign out) */}
        <TopBar
          isAdmin={isAdmin}
          initials={initials}
          displayName={displayName}
          role={role}
        />

        <main className="dashboard-main">
          {children}
        </main>
      </div>

      <AiAssistant />
    </div>
  )
}
