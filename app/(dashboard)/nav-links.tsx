"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const sections = [
  {
    label: "Main",
    items: [
      { href: "/app",      label: "Dashboard" },
      { href: "/meetings/create", label: "Schedule Meeting" },
      { href: "/meetings", label: "My Meetings" },
    ],
  },
  {
    label: "Attendance",
    items: [
      { href: "/app/sign-attendance", label: "Sign Attendance" },
      { href: "/app/register", label: "Download Register" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/app/profile", label: "My Profile" },
    ],
  },
]

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/")

  const linkStyle = (active: boolean) => ({
    display: "flex", alignItems: "center",
    padding: "9px 12px", borderRadius: "8px",
    marginBottom: "2px", textDecoration: "none",
    fontSize: "13px", fontWeight: active ? 500 : 400,
    color: active ? "#fff" : "rgba(255,255,255,0.65)",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    transition: "background 0.12s, color 0.12s",
  } as const)

  return (
    <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column" }}>
      {sections.map(({ label, items }) => (
        <div key={label}>
          <div style={{
            fontFamily: "var(--s-mono)", fontSize: "10px",
            color: "rgba(255,255,255,0.32)",
            padding: "10px 12px 5px",
            letterSpacing: "0.08em",
          }}>
            {label}
          </div>
          {items.map(({ href, label: itemLabel }) => (
            <Link key={href} href={href} style={linkStyle(isActive(href))}>
              {itemLabel}
            </Link>
          ))}
        </div>
      ))}

      {isAdmin && (
        <div>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.32)", padding: "10px 12px 5px", letterSpacing: "0.08em" }}>
            Settings
          </div>
          <Link href="/admin" style={linkStyle(pathname === "/admin")}>
            Admin Portal
          </Link>
        </div>
      )}
    </nav>
  )
}
