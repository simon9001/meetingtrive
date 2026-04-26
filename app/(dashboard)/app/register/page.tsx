import { getSession } from "@/lib/session"
import { meetingsApi } from "@/lib/api-client"
import { RegisterClient } from "./register-client"

export default async function RegisterPage() {
  const session = await getSession()
  const user = session?.user as any
  const userId = user?.id ?? ""
  const orgId = user?.orgId ?? ""

  const { meetings } = await meetingsApi.my(orgId, userId)
  // Filter for meetings that have ended or are closed
  const pastMeetings = meetings.filter(m => m.status === "ENDED" || m.status === "CLOSED")

  return (
    <div style={{ maxWidth: "960px" }}>
      <div className="page-header">
        <div>
          <div style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.5px" }}>Attendance Register</div>
          <div style={{ fontSize: "13px", color: "var(--s-text2)", marginTop: "4px" }}>
            Preview and download the signed register (only signed attendees appear)
          </div>
        </div>
      </div>

      <RegisterClient meetings={pastMeetings} />
    </div>
  )
}
