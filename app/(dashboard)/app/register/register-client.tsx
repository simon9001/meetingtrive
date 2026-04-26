"use client"

import { useState, useEffect } from "react"
import { Meeting, meetingsApi, reportsApi } from "@/lib/api-client"
import { format } from "date-fns"
import { toast } from "sonner"

interface Props {
  meetings: Meeting[]
}

export function RegisterClient({ meetings }: Props) {
  const [selectedId, setSelectedId] = useState("")
  const [meeting, setMeeting] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedId) {
      loadMeeting(selectedId)
    } else {
      setMeeting(null)
    }
  }, [selectedId])

  const loadMeeting = async (id: string) => {
    setLoading(true)
    try {
      const res = await meetingsApi.get(id)
      setMeeting(res.meeting)
    } catch (err: any) {
      toast.error(err.message || "Failed to load meeting details")
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = () => {
    if (!selectedId) return
    window.open(reportsApi.downloadPDF(selectedId), "_blank")
  }

  const signedParticipants = meeting?.participants?.filter((p: any) => p.signedAt) ?? []

  return (
    <div className="space-y-6">
      <div className="s-card" style={{ maxWidth: "500px" }}>
        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "14px" }}>Select Meeting</div>
        <div className="space-y-2">
          <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--s-text2)", display: "block", fontFamily: "var(--s-mono)" }}>Meeting</label>
          <select 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid var(--s-border2)",
              borderRadius: "var(--s-radius)", fontFamily: "var(--s-sans)", fontSize: "13px"
            }}
          >
            <option value="">— choose a meeting —</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                {format(new Date(m.startDatetime), "dd MMM yyyy")} — {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="loading loading-spinner loading-md" style={{ color: "var(--s-accent)" }}></div>
        </div>
      )}

      {meeting && !loading && (
        <div className="space-y-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>Register Preview</div>
            <button className="s-btn s-btn-secondary s-btn-sm" onClick={downloadPdf}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ marginRight: "6px" }}>
                <path d="M6.5 1v8M3 6.5l3.5 3.5L10 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 11.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Download PDF
            </button>
          </div>

          <div style={{
            background: "var(--s-surface)",
            border: "1px solid var(--s-border)",
            borderRadius: "var(--s-radius-lg)",
            overflow: "hidden"
          }}>
            <div style={{ background: "var(--s-accent)", color: "#fff", padding: "20px 24px" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.3px" }}>{meeting.title.toUpperCase()}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "4px", fontFamily: "var(--s-mono)" }}>
                ATTENDANCE REGISTER • DATE: {format(new Date(meeting.startDatetime), "dd MMM yyyy")} • TYPE: {meeting.type}
              </div>
            </div>
            
            <div className="s-table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="s-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>S/N</th>
                    <th>NAME</th>
                    <th>DESIGNATION</th>
                    <th style={{ width: "180px" }}>SIGNATURE</th>
                  </tr>
                </thead>
                <tbody>
                  {signedParticipants.map((p: any, i: number) => (
                    <tr key={p.id}>
                      <td style={{ color: "var(--s-text3)", fontFamily: "var(--s-mono)" }}>{i + 1}.</td>
                      <td style={{ fontWeight: 500 }}>{p.user?.fullName || p.guestName}</td>
                      <td style={{ color: "var(--s-text2)" }}>{p.user?.designation || p.guestDesignation || "Staff"}</td>
                      <td style={{ padding: "8px 14px" }}>
                        <div style={{
                          height: "44px", width: "140px", border: "1px dashed var(--s-border2)",
                          borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                          overflow: "hidden", background: "#FAFAF8"
                        }}>
                          {p.signatureImageUrl ? (
                            <img src={p.signatureImageUrl} alt="sig" style={{ height: "40px", width: "136px", objectFit: "contain" }} />
                          ) : (
                            <span style={{ fontSize: "10px", color: "var(--s-text3)", fontFamily: "var(--s-mono)" }}>
                              Signed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {signedParticipants.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "40px 0", color: "var(--s-text3)" }}>
                        No signed attendees yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Only signed attendees are shown. Unsigned attendees are excluded from the downloaded register.
          </div>
        </div>
      )}
    </div>
  )
}
