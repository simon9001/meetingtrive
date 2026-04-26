"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

interface Props {
  variant?: "dark" | "light"
}

export function SignOutButton({ variant = "dark" }: Props) {
  const [loading, setLoading] = useState(false)
  const isDark = variant === "dark"

  const handleSignOut = async () => {
    setLoading(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      title="Sign out"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "30px", height: "30px", borderRadius: "6px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "var(--s-border2)"}`,
        background: "transparent",
        color: isDark ? "rgba(255,255,255,0.55)" : "var(--s-text3)",
        cursor: loading ? "not-allowed" : "pointer",
        flexShrink: 0,
        opacity: loading ? 0.6 : 1,
        transition: "background 0.15s, color 0.15s, opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        if (loading) return
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.1)" : "var(--s-surface2)"
        e.currentTarget.style.color      = isDark ? "#fff" : "var(--s-accent2)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color      = isDark ? "rgba(255,255,255,0.55)" : "var(--s-text3)"
      }}
    >
      {loading
        ? <span className="loading loading-spinner loading-xs" style={{ width: "12px", height: "12px" }} />
        : <LogOut style={{ width: "13px", height: "13px" }} />}
    </button>
  )
}
