import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { staffApi } from "@/lib/api-client"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id ?? ""
  
  const { profile } = await staffApi.me(userId)

  return (
    <div style={{ maxWidth: "600px" }}>
      <div className="page-header">
        <div>
          <div style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.5px" }}>My Profile</div>
          <div style={{ fontSize: "13px", color: "var(--s-text2)", marginTop: "4px" }}>
            Manage your details and saved signature
          </div>
        </div>
      </div>

      <ProfileClient initialProfile={profile} userId={userId} />
    </div>
  )
}
