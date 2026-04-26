import { getSession } from "@/lib/session"
import { attendanceApi, staffApi } from "@/lib/api-client"
import { SignAttendanceClient } from "./sign-attendance-client"

export default async function SignAttendancePage() {
  const session = await getSession()
  const userId = (session?.user as any)?.id ?? ""
  
  const { pending } = await attendanceApi.pending(userId)
  const { profile } = await staffApi.me(userId)

  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="page-header">
        <div>
          <div style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.5px" }}>Sign Attendance</div>
          <div style={{ fontSize: "13px", color: "var(--s-text2)", marginTop: "4px" }}>
            Sign or review attendance for meetings you attended
          </div>
        </div>
      </div>

      <SignAttendanceClient 
        pending={pending} 
        signatureLibrary={profile.signatureLibrary} 
        userId={userId}
      />
    </div>
  )
}
