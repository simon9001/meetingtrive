"use client"

import { usePathname } from "next/navigation"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { SidebarDrawer } from "./sidebar-drawer"

const breadcrumbMap: Record<string, string> = {
  "/app":             "Dashboard",
  "/meetings":        "My Meetings",
  "/meetings/create": "Schedule Meeting",
  "/admin":           "Admin Portal",
  "/profile":         "Profile",
}

function getLabel(pathname: string): string {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname]
  if (pathname.startsWith("/meetings/") && pathname.endsWith("/report")) return "Export Report"
  if (pathname.startsWith("/meetings/") && pathname.endsWith("/qr"))     return "QR Code"
  if (pathname.match(/^\/meetings\/[^/]+$/))                              return "Meeting Details"
  return "AttendSync"
}

interface Props {
  isAdmin: boolean
  initials: string
  displayName: string
  role: string
}

export function TopBar({ isAdmin, initials, displayName, role }: Props) {
  const pathname = usePathname()
  const label    = getLabel(pathname)

  return (
    /* Mobile only — breadcrumb + sign out. Hidden on desktop (lg:hidden). */
    <header
      className="flex lg:hidden"
      style={{
        position: "sticky", top: 0, zIndex: 30,
        alignItems: "center",
        padding: "0 14px", height: "50px",
        background: "var(--s-accent)",
        gap: "10px",
      }}
    >
      {/* Hamburger */}
      <SidebarDrawer
        isAdmin={isAdmin}
        initials={initials}
        displayName={displayName}
        role={role}
      />

      {/* Breadcrumb — current page name */}
      <span style={{
        flex: 1, fontSize: "13px", fontWeight: 500, color: "#fff",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {label}
      </span>

      {/* Sign out — far right */}
      <SignOutButton variant="dark" />
    </header>
  )
}
