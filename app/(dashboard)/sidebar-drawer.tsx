"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@/components/auth/sign-out-button"

const sections = [
  {
    label: "Main",
    items: [
      { href: "/app",      label: "Dashboard" },
      { href: "/meetings", label: "My Meetings" },
    ],
  },
  {
    label: "Attendance",
    items: [
      { href: "/meetings/create", label: "Schedule Meeting" },
    ],
  },
]

interface Props {
  isAdmin: boolean
  initials: string
  displayName: string
  role: string
}

export function SidebarDrawer({ isAdmin, initials, displayName, role }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/")

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center",
    padding: "9px 12px", borderRadius: "8px",
    marginBottom: "2px", textDecoration: "none",
    fontSize: "13px", fontWeight: active ? 500 : 400,
    color: active ? "#fff" : "rgba(255,255,255,0.65)",
    background: active ? "rgba(255,255,255,0.15)" : "transparent",
    transition: "background 0.12s, color 0.12s",
  })

  return (
    <>
      {/* Hamburger button — shown in mobile header by parent */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "36px", height: "36px", border: "none",
          background: "rgba(255,255,255,0.12)", borderRadius: "8px",
          color: "#fff", cursor: "pointer", flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "260px",
        background: "var(--s-accent)",
        zIndex: 51,
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>

        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.3px" }}>
              AttendSync
            </div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginTop: "2px" }}>
              ATTENDANCE PLATFORM
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "28px", border: "none",
              background: "rgba(255,255,255,0.1)", borderRadius: "6px",
              color: "rgba(255,255,255,0.8)", cursor: "pointer",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
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
              <div style={{
                fontFamily: "var(--s-mono)", fontSize: "10px",
                color: "rgba(255,255,255,0.32)",
                padding: "10px 12px 5px",
                letterSpacing: "0.08em",
              }}>
                Settings
              </div>
              <Link href="/admin" style={linkStyle(pathname === "/admin")}>
                Admin Portal
              </Link>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", gap: "10px",
          flexShrink: 0,
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: "12px", color: "#fff", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.38)" }}>
              {role}
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </>
  )
}
