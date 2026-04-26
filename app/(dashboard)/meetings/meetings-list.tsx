"use client"

import Link from "next/link"
import { useState } from "react"
import { format } from "date-fns"

type Meeting = {
  id: string
  title: string
  status: string
  type: string
  platform?: string
  startDatetime: string
  sessionType: string
  days?: unknown[]
  _count?: { participants?: number }
}

const statusMap: Record<string, { label: string; cls: string }> = {
  SCHEDULED: { label: "Upcoming", cls: "s-badge s-badge-blue" },
  ACTIVE:    { label: "Live",     cls: "s-badge s-badge-green" },
  ENDED:     { label: "Pending",  cls: "s-badge s-badge-amber" },
  CLOSED:    { label: "Closed",   cls: "s-badge s-badge-gray" },
}

const tabs = [
  { key: "all",      label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "live",     label: "Live" },
  { key: "past",     label: "Past" },
] as const

type TabKey = (typeof tabs)[number]["key"]

export function MeetingsList({ meetings }: { meetings: Meeting[] }) {
  const [query, setQuery] = useState("")
  const [tab, setTab]     = useState<TabKey>("all")

  const filtered = meetings.filter((m) => {
    const matchesQuery = m.title.toLowerCase().includes(query.toLowerCase())
    const matchesTab =
      tab === "all"      ? true :
      tab === "upcoming" ? m.status === "SCHEDULED" :
      tab === "live"     ? m.status === "ACTIVE" :
                           m.status === "ENDED" || m.status === "CLOSED"
    return matchesQuery && matchesTab
  })

  return (
    <div>
      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search meetings…"
        style={{
          width: "100%", height: "38px", padding: "0 12px",
          border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
          fontFamily: "var(--s-sans)", fontSize: "13px",
          background: "var(--s-surface)", color: "var(--s-text)",
          outline: "none", marginBottom: "12px",
          boxSizing: "border-box",
        }}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid var(--s-border)", marginBottom: "16px" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 14px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", border: "none", background: "transparent",
              borderBottom: `2px solid ${tab === t.key ? "var(--s-accent)" : "transparent"}`,
              color: tab === t.key ? "var(--s-accent)" : "var(--s-text2)",
              marginBottom: "-1px", transition: "all 0.15s",
              fontFamily: "var(--s-sans)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 0",
          background: "var(--s-surface)", borderRadius: "var(--s-radius-lg)",
          border: "1px solid var(--s-border)",
        }}>
          <div style={{ fontSize: "13px", color: "var(--s-text3)" }}>No meetings found</div>
        </div>
      ) : (
        <div className="s-table-wrap">
          <table className="s-table">
            <thead>
              <tr>
                <th>Meeting</th>
                <th>Date</th>
                <th>Type</th>
                <th>Signed</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const s = statusMap[m.status] ?? statusMap.SCHEDULED
                const typeLabel = m.type === "VIRTUAL" ? (m.platform ?? "Virtual") : "Physical"
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px", display: "block" }}>
                          {m.title}
                        </span>
                        {m.sessionType === "MULTI_DAY" && (
                          <span className="s-badge s-badge-blue" style={{ flexShrink: 0 }}>
                            {m.days?.length ?? 0}D
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text2)", whiteSpace: "nowrap" }}>
                      {format(new Date(m.startDatetime), "dd MMM yyyy")}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--s-text2)" }}>{typeLabel}</td>
                    <td style={{ fontFamily: "var(--s-mono)", fontSize: "12px" }}>
                      {m._count?.participants ?? 0}
                    </td>
                    <td><span className={s.cls}>{s.label}</span></td>
                    <td>
                      <Link href={`/meetings/${m.id}`} className="s-btn s-btn-secondary s-btn-sm">View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
