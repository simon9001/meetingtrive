"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, StopCircle, Mail } from "lucide-react"
import type { Meeting } from "@/lib/api-client"

export function MeetingActions({ meeting }: { meeting: Meeting }) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const router = useRouter()

  const endMeeting = async () => {
    if (!confirm("End this meeting and send sign-in links to qualifying participants?")) return
    setLoading("end"); setError(null)
    try {
      const res  = await fetch(`/api/internal/meetings/${meeting.id}/end`, { method: "POST" })
      const data = await res.json() as { notificationsSent?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed")
      router.refresh()
      alert(`Meeting ended. ${data.notificationsSent ?? 0} sign-in link(s) sent.`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally { setLoading(null) }
  }

  const resendLinks = async () => {
    if (!confirm("Resend sign-in links to all participants who have not yet signed in?")) return
    setLoading("resend"); setError(null)
    try {
      const res  = await fetch(`/api/internal/meetings/${meeting.id}/resend-links`, { method: "POST" })
      const data = await res.json() as { notificationsSent?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed")
      router.refresh()
      alert(`Links resent successfully. ${data.notificationsSent ?? 0} sign-in link(s) sent.`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally { setLoading(null) }
  }

  const generateQR = async () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return }
    setLoading("qr"); setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res  = await fetch(`/api/internal/meetings/${meeting.id}/qr`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ venueLat: pos.coords.latitude, venueLng: pos.coords.longitude }),
          })
          const data = await res.json() as { error?: string }
          if (!res.ok) throw new Error(data.error ?? "Failed")
          router.push(`/meetings/${meeting.id}/qr`)
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Unknown error")
          setLoading(null)
        }
      },
      (err) => { setError(`GPS error: ${err.message}`); setLoading(null) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (meeting.status === "CLOSED") return null

  const busy = loading !== null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
      {error && (
        <p style={{ fontSize: "11px", color: "var(--s-accent2)", margin: 0 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>

        {(meeting.status === "SCHEDULED" || meeting.status === "ACTIVE") && (
          <button
            className="s-btn s-btn-sm s-btn-danger"
            onClick={endMeeting}
            disabled={busy}
          >
            {loading === "end"
              ? <span className="loading loading-spinner loading-xs" />
              : <StopCircle style={{ width: "13px", height: "13px" }} />}
            {loading === "end" ? "Ending…" : "End Meeting"}
          </button>
        )}

        {(meeting.status === "ACTIVE" || meeting.status === "ENDED") && (
          <button
            className="s-btn s-btn-sm s-btn-secondary"
            onClick={resendLinks}
            disabled={busy}
          >
            {loading === "resend"
              ? <span className="loading loading-spinner loading-xs" />
              : <Mail style={{ width: "13px", height: "13px" }} />}
            {loading === "resend" ? "Sending…" : "Resend Links"}
          </button>
        )}

        {meeting.type === "PHYSICAL" && (meeting.status === "ACTIVE" || meeting.status === "SCHEDULED") && (
          <button
            className="s-btn s-btn-sm s-btn-primary"
            onClick={generateQR}
            disabled={busy}
          >
            {loading === "qr"
              ? <span className="loading loading-spinner loading-xs" />
              : <QrCode style={{ width: "13px", height: "13px" }} />}
            {loading === "qr" ? "Getting GPS…" : "Generate QR"}
          </button>
        )}

        {meeting.type === "PHYSICAL" && meeting.qrToken && (
          <a href={`/meetings/${meeting.id}/qr`} className="s-btn s-btn-sm s-btn-secondary">
            <QrCode style={{ width: "13px", height: "13px" }} />
            View QR
          </a>
        )}
      </div>
    </div>
  )
}
