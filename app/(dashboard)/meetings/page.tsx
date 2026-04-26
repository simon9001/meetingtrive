import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { meetingsApi } from "@/lib/api-client"
import Link from "next/link"
import { MeetingsList } from "./meetings-list"

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId ?? ""
  const { meetings } = await meetingsApi.list(orgId)

  return (
    <div style={{ maxWidth: "920px" }}>
      <div className="page-header">
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.4px", color: "var(--s-text)" }}>
            My Meetings
          </div>
          <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
            Meetings you scheduled or were invited to
          </div>
        </div>
        <Link href="/meetings/create" className="s-btn s-btn-primary s-btn-sm">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Schedule Meeting
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "var(--s-surface)", borderRadius: "var(--s-radius-lg)",
          border: "1px solid var(--s-border)",
        }}>
          <div style={{ fontSize: "13px", color: "var(--s-text3)", marginBottom: "14px" }}>
            No meetings scheduled yet.
          </div>
          <Link href="/meetings/create" className="s-btn s-btn-primary s-btn-sm">
            Schedule your first meeting
          </Link>
        </div>
      ) : (
        <MeetingsList meetings={meetings as any} />
      )}
    </div>
  )
}
