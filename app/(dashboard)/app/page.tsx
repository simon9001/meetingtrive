import { getSession } from "@/lib/session"
import { meetingsApi, attendanceApi } from "@/lib/api-client"
import Link from "next/link"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await getSession()
  const user = session?.user as any
  const userId = user?.id ?? ""
  const orgId = user?.orgId ?? ""
  
  const { meetings } = await meetingsApi.my(orgId, userId)
  const { pending } = await attendanceApi.pending(userId)

  const totalMeetings = meetings.length
  const totalAttendees = meetings.reduce((sum, m) => sum + (m._count?.participants ?? 0), 0)
  const signedCount = meetings.filter(m => m.status === "CLOSED").length
  const completionPct = totalMeetings > 0 ? Math.round((signedCount / totalMeetings) * 100) : 0

  const stats = [
    { label: "MEETINGS THIS MONTH", value: totalMeetings, sub: `${meetings.filter(m => new Date(m.startDatetime) > new Date(Date.now() - 7*24*3600*1000)).length} this week` },
    { label: "TOTAL ATTENDEES",     value: totalAttendees, sub: "Across all sessions" },
    { label: "SIGNED ATTENDANCE",   value: `${completionPct}%`, sub: `${totalAttendees} signed`, accent: true },
    { label: "PENDING SIGNATURES",  value: pending.length, sub: "Reminders sent", warn: pending.length > 0 },
  ]

  const recentMeetings = meetings.slice(0, 6)

  const statusMap: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: "Upcoming", cls: "s-badge s-badge-blue" },
    ACTIVE:    { label: "Live",     cls: "s-badge s-badge-green" },
    ENDED:     { label: "Pending",  cls: "s-badge s-badge-amber" },
    CLOSED:    { label: "Closed",   cls: "s-badge s-badge-gray" },
  }

  return (
    <div style={{ maxWidth: "920px", width: "100%" }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.4px", color: "var(--s-text)" }}>
            Dashboard
          </div>
          <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
            Attendance activity overview
          </div>
        </div>
        <Link href="/meetings/create" className="s-btn s-btn-primary s-btn-sm">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Meeting
        </Link>
      </div>

      {/* Stats */}
      <div className="s-stat-grid">
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "var(--s-surface)",
            border: "1px solid var(--s-border)",
            borderRadius: "var(--s-radius-lg)",
            padding: "16px 18px",
          }}>
            <div className="s-mono-label" style={{ marginBottom: "8px" }}>{s.label}</div>
            <div style={{
              fontSize: "24px", fontWeight: 600, letterSpacing: "-0.5px", lineHeight: 1,
              color: s.accent ? "var(--s-accent)" : s.warn ? "var(--s-accent2)" : "var(--s-text)",
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--s-text2)", marginTop: "4px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent meetings */}
      <div style={{
        background: "var(--s-surface)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-radius-lg)",
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--s-text)" }}>Recent Meetings</div>
          <Link href="/meetings" className="s-btn s-btn-secondary s-btn-sm">View all</Link>
        </div>

        {recentMeetings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--s-text3)", fontSize: "13px" }}>
            No meetings yet.{" "}
            <Link href="/meetings/create" style={{ color: "var(--s-accent)", fontWeight: 500, textDecoration: "none" }}>
              Create one →
            </Link>
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
                {recentMeetings.map((m) => {
                  const s = statusMap[m.status] ?? statusMap.SCHEDULED
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500, maxWidth: "200px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {m.title}
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text2)", whiteSpace: "nowrap" }}>
                        {format(new Date(m.startDatetime), "dd MMM yyyy")}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--s-text2)" }}>
                        {m.type === "VIRTUAL" ? (m.platform ?? "Virtual") : "Physical"}
                      </td>
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
    </div>
  )
}
