"use client"

import { useState } from "react"
import { format } from "date-fns"
import { signInApi, PendingSignature } from "@/lib/api-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
  pending: PendingSignature[]
  signatureLibrary: string[]
  userId: string
}

export function SignAttendanceClient({ pending, signatureLibrary, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const savedSig = signatureLibrary[0] // Use the first signature as default

  const handleQuickSign = async (token: string, meetingId: string) => {
    if (!savedSig) {
      toast.error("Please set up a signature in your profile first.")
      router.push("/app/profile")
      return
    }

    setLoading(meetingId)
    try {
      await signInApi.submit(token, {
        signatureDataUrl: savedSig,
        saveToLibrary: false,
      })
      toast.success("Attendance signed successfully!")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to sign attendance")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {signatureLibrary.length > 0 && (
        <div style={{
          background: "var(--s-accent-light)",
          color: "var(--s-accent)",
          padding: "12px 16px",
          borderRadius: "var(--s-radius)",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          border: "1px solid #9FE1CB"
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8 7v5M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          You have a saved signature. It will be auto-applied when you sign.
        </div>
      )}

      <div className="s-card">
        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>Pending Signatures</div>
        
        {pending.length === 0 ? (
          <div style={{ color: "var(--s-text3)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
            No pending signatures — you're all caught up!
          </div>
        ) : (
          <div className="divide-y divide-[var(--s-border)]">
            {pending.map((p) => (
              <div key={p.id} className="sign-pending-item">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.meetingTitle}</div>
                  <div style={{ fontSize: "12px", color: "var(--s-text3)", fontFamily: "var(--s-mono)", marginTop: "2px" }}>
                    {format(new Date(p.meetingDate), "dd MMM yyyy")} • {p.meetingType}
                  </div>
                </div>
                <button
                  className="s-btn s-btn-primary s-btn-sm sign-btn"
                  onClick={() => handleQuickSign(p.signInToken, p.meetingId)}
                  disabled={loading === p.meetingId}
                  style={{ flexShrink: 0 }}
                >
                  {loading === p.meetingId ? "Signing..." : "Sign Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="s-card">
        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>Your Saved Signature</div>
        <div style={{
          border: "1.5px dashed var(--s-border2)",
          borderRadius: "var(--s-radius)",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF8",
          overflow: "hidden"
        }}>
          {savedSig ? (
            <img src={savedSig} alt="Saved signature" style={{ maxHeight: "80px" }} />
          ) : (
            <div style={{ fontSize: "12px", color: "var(--s-text3)", fontFamily: "var(--s-mono)" }}>
              No signature saved yet
            </div>
          )}
        </div>
        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <button className="s-btn s-btn-secondary s-btn-sm" onClick={() => router.push("/app/profile")}>
            {savedSig ? "Update Signature" : "Create Signature"}
          </button>
        </div>
        <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "12px" }}>
          Your signature is saved and will be reused automatically for future meetings.
        </div>
      </div>
    </div>
  )
}
