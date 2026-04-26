import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { meetingsApi } from "@/lib/api-client"
import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { MeetingActions } from "./meeting-actions"
import { CopyButton } from "./copy-button"
import { InviteButton } from "./invite-dialog"

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string }>
}) {
  const { meetingId } = await params
  await getServerSession(authOptions)

  let meeting
  try {
    const res = await meetingsApi.get(meetingId)
    meeting = res.meeting
  } catch {
    notFound()
  }

  if (!meeting) notFound()

  const signedCount = meeting.participants.filter((p: any) => p.signedAt).length
  const totalCount = meeting.participants.length
  const pct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0

  return (
    <div style={{ maxWidth: "900px" }}>

      {/* Back */}
      <Link href="/meetings" style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        fontSize: "13px", color: "var(--s-text2)", textDecoration: "none",
        marginBottom: "20px",
      }}>
        ← All Meetings
      </Link>

      {/* Header card */}
      <div style={{
        background: "var(--s-surface)",
        border: "1px solid var(--s-border)",
        borderRadius: "var(--s-radius-lg)",
        overflow: "hidden",
        marginBottom: "20px",
      }}>
        <div style={{ height: "4px", background: "var(--s-accent)" }} />
        <div style={{ padding: "24px" }}>
          <div className="meeting-header-inner" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: "18px", fontWeight: 600, color: "var(--s-text)", letterSpacing: "-0.4px", marginBottom: "6px" }}>
                {meeting.title}
              </h1>
              {meeting.description && (
                <p style={{ fontSize: "13px", color: "var(--s-text2)", marginBottom: "10px" }}>{meeting.description}</p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <StatusBadge status={meeting.status} />
                <span className="s-badge s-badge-blue">
                  {meeting.type === "VIRTUAL"
                    ? `Virtual · ${meeting.platform ?? ""}`
                    : `Physical · ${meeting.venueName ?? "Venue"}`}
                </span>
                {meeting.sessionType === "MULTI_DAY" && (
                  <span className="s-badge s-badge-amber">
                    {meeting.days?.length ?? 0}-Day Event
                  </span>
                )}
              </div>
            </div>
            <MeetingActions meeting={meeting as any} />
          </div>

          {/* Meta row */}
          <div className="meeting-meta-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: "14px", marginTop: "20px", paddingTop: "16px",
            borderTop: "1px solid var(--s-border)",
          }}>
            <MetaItem label="DATE" value={format(new Date(meeting.startDatetime), "dd MMM yyyy")} />
            <MetaItem
              label="TIME"
              value={`${format(new Date(meeting.startDatetime), "HH:mm")} – ${format(new Date(meeting.endDatetime), "HH:mm")}`}
            />
            <MetaItem label="THRESHOLD" value={`${meeting.attendanceThresholdMinutes} min`} />
            <MetaItem label="ATTENDANCE" value={`${signedCount} / ${totalCount}`} />
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em" }}>
                  SIGN-OFF RATE
                </span>
                <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-accent)", fontWeight: 500 }}>
                  {pct}%
                </span>
              </div>
              <div className="s-progress-track">
                <div className="s-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {/* Proxy link */}
          {meeting.proxyLink && (
            <div style={{
              marginTop: "16px", padding: "12px 16px",
              background: "var(--s-surface2)", borderRadius: "var(--s-radius)",
              border: "1px solid var(--s-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  PROXY JOIN LINK
                </div>
                <div style={{ fontFamily: "var(--s-mono)", fontSize: "12px", color: "var(--s-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {meeting.proxyLink}
                </div>
              </div>
              <CopyButton text={meeting.proxyLink} />
            </div>
          )}
        </div>
      </div>

      {/* Multi-day schedule */}
      {meeting.sessionType === "MULTI_DAY" && meeting.days && meeting.days.length > 0 && (
        <div className="s-card" style={{ marginBottom: "20px" }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "14px" }}>
            PROGRAMME SCHEDULE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {meeting.days.map((d: any) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 14px", borderRadius: "var(--s-radius)",
                background: "var(--s-surface2)",
              }}>
                <span className="s-badge s-badge-green" style={{ flexShrink: 0 }}>Day {d.dayNumber}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text)" }}>
                  {format(new Date(d.date), "EEEE, dd MMM yyyy")}
                </span>
                {d.label && (
                  <span style={{ fontSize: "12px", color: "var(--s-text2)" }}>{d.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="s-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.08em" }}>
              PARTICIPANTS
            </span>
            <span className="s-badge s-badge-gray">{signedCount}/{totalCount}</span>
          </div>
          <div className="meeting-actions-bar">
            <InviteButton
              meetingId={meetingId}
              orgId={meeting.organisation.id}
              isInternal={meeting.staffIdGateEnabled}
              days={meeting.days}
            />
            <Link href={`/meetings/${meetingId}/qr`} className="s-btn s-btn-secondary s-btn-sm">
              QR Code
            </Link>
            <Link href={`/meetings/${meetingId}/report`} className="s-btn s-btn-secondary s-btn-sm">
              Report
            </Link>
          </div>
        </div>

        {meeting.participants.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--s-text3)", fontSize: "13px" }}>
            No participants yet. They appear here after signing in.
          </div>
        ) : (
          <div className="s-table-wrap">
            <table className="s-table participants-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Signed</th>
                  {meeting.sessionType === "MULTI_DAY" && <th>Day</th>}
                  <th>Signature</th>
                </tr>
              </thead>
              <tbody>
                {meeting.participants.map((p: any, i: number) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--s-text3)", fontFamily: "var(--s-mono)", fontSize: "12px" }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--s-text)", fontSize: "13px" }}>
                        {p.user?.fullName ?? p.guestName ?? "—"}
                      </div>
                      {p.user?.staffId && (
                        <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", marginTop: "2px" }}>
                          {p.user.staffId}
                        </div>
                      )}
                    </td>
                    <td style={{ color: "var(--s-text2)", fontSize: "12px" }}>
                      {p.user?.designation ?? p.guestDesignation ?? "—"}
                    </td>
                    <td>
                      {p.signedAt ? (
                        <span className="s-badge s-badge-green">
                          {format(new Date(p.signedAt), "dd MMM, HH:mm")}
                        </span>
                      ) : (
                        <span className="s-badge s-badge-gray">Pending</span>
                      )}
                    </td>
                    {meeting.sessionType === "MULTI_DAY" && (
                      <td style={{ color: "var(--s-text2)", fontSize: "12px" }}>
                        {p.meetingDay?.label ?? (p.meetingDay ? `Day ${p.meetingDay.dayNumber}` : "—")}
                      </td>
                    )}
                    <td>
                      {p.signatureImageUrl ? (
                        <img src={p.signatureImageUrl} alt="Signature" style={{ height: "32px", width: "auto", objectFit: "contain", display: "block" }} />
                      ) : (
                        <span style={{ color: "var(--s-text3)", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-text)" }}>{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: "s-badge s-badge-blue",
    ACTIVE:    "s-badge s-badge-green",
    ENDED:     "s-badge s-badge-amber",
    CLOSED:    "s-badge s-badge-gray",
  }
  const labels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    ACTIVE:    "Live",
    ENDED:     "Ended",
    CLOSED:    "Closed",
  }
  return (
    <span className={map[status] ?? "s-badge s-badge-gray"}>
      {labels[status] ?? status}
    </span>
  )
}
