import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { OrgUsersPanel } from "./org-users-panel"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

async function backendGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "X-API-Key": API_KEY },
    cache: "no-store",
  })
  return res.json() as Promise<T>
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")

  const user  = session.user as any
  if (user.role !== "ADMIN") redirect("/meetings")

  const orgId = user.orgId as string

  // Fetch org details and users in parallel — eliminates the second client round-trip
  const [{ organisation }, { users }] = await Promise.all([
    backendGet<{ organisation: any }>(`/api/organisations/${orgId}`),
    backendGet<{ users: any[] }>(`/api/organisations/${orgId}/users`),
  ])

  const stats = [
    { label: "USERS",    value: organisation._count.users },
    { label: "MEETINGS", value: organisation._count.meetings },
  ]

  return (
    <div style={{ maxWidth: "920px" }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.4px", color: "var(--s-text)" }}>
            Admin Portal
          </div>
          <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
            {organisation.name}
          </div>
        </div>
        <Link href="/admin/email-template" className="s-btn s-btn-secondary s-btn-sm">
          Email Template
        </Link>
      </div>

      {/* Stats */}
      <div className="s-stat-grid" style={{ marginBottom: "24px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "var(--s-surface)",
            border: "1px solid var(--s-border)",
            borderRadius: "var(--s-radius-lg)",
            padding: "16px 18px",
          }}>
            <div className="s-mono-label" style={{ marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1, color: "var(--s-text)" }}>
              {s.value}
            </div>
          </div>
        ))}

        {/* Org identity card */}
        <div style={{
          background: "var(--s-accent-light)",
          border: "1px solid #B8D8CC",
          borderRadius: "var(--s-radius-lg)",
          padding: "16px 18px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          {organisation.logoUrl ? (
            <img src={organisation.logoUrl} alt={organisation.name}
              style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
              background: "var(--s-accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff",
            }}>
              {organisation.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-accent)", letterSpacing: "0.08em", marginBottom: "3px" }}>
              YOUR ORGANISATION
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--s-accent)" }}>{organisation.name}</div>
          </div>
        </div>
      </div>

      {/* Users panel — initialUsers pre-fetched server-side, no extra round-trip */}
      <OrgUsersPanel orgId={orgId} initialUsers={users} />
    </div>
  )
}
