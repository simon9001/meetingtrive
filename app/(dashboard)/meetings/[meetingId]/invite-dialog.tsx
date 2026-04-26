"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { inviteApi } from "@/lib/api-client"
import type { StaffRecord, InviteParticipant, MeetingDay } from "@/lib/api-client"

import { BACKEND_URL } from "@/lib/config"

interface Props {
  meetingId: string
  orgId: string
  isInternal: boolean
  days?: MeetingDay[]
}

interface Selected extends InviteParticipant {
  _key: string
}

export function InviteButton(props: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="s-btn s-btn-primary s-btn-sm" onClick={() => setOpen(true)}>
        + Invite
      </button>
      {open && <InviteDialog {...props} onClose={() => setOpen(false)} />}
    </>
  )
}

function InviteDialog({ meetingId, orgId, isInternal, days, onClose }: Props & { onClose: () => void }) {
  const [query,      setQuery]      = useState("")
  const [results,    setResults]    = useState<StaffRecord[]>([])
  const [selected,   setSelected]   = useState<Selected[]>([])
  const [searching,  setSearching]  = useState(false)
  const [sending,    setSending]    = useState(false)
  const [sent,       setSent]       = useState<{ email: string; sent: boolean; error?: string }[] | null>(null)
  const [showDrop,   setShowDrop]   = useState(false)
  const [guestEmail, setGuestEmail] = useState("")
  const [guestName,  setGuestName]  = useState("")
  const [guestDes,   setGuestDes]   = useState("")
  const [guestDay,   setGuestDay]   = useState("")
  const [guestError, setGuestError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced staff search
  useEffect(() => {
    if (query.length < 2) { setResults([]); setShowDrop(false); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/staff/lookup?orgId=${encodeURIComponent(orgId)}&q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
        setShowDrop(true)
      } catch { setResults([]) }
      setSearching(false)
    }, 250)
    return () => { clearTimeout(t); setSearching(false) }
  }, [query, orgId])

  const addFromDB = useCallback((staff: StaffRecord) => {
    if (selected.some(s => s.userId === staff.id || s.email === staff.email)) return
    setSelected(prev => [...prev, {
      _key: staff.id, userId: staff.id,
      email: staff.email, name: staff.fullName,
      designation: staff.designation, department: staff.department,
    }])
    setQuery(""); setShowDrop(false); inputRef.current?.focus()
  }, [selected])

  const addGuest = () => {
    if (!guestEmail || !guestName) { setGuestError("Email and name are required."); return }
    if (selected.some(s => s.email === guestEmail)) { setGuestError("Already added."); return }
    setGuestError("")
    setSelected(prev => [...prev, {
      _key: guestEmail, email: guestEmail, name: guestName,
      designation: guestDes || undefined, meetingDayId: guestDay || undefined,
    }])
    setGuestEmail(""); setGuestName(""); setGuestDes(""); setGuestDay("")
  }

  const remove = (key: string) => setSelected(prev => prev.filter(s => s._key !== key))

  const sendInvites = async () => {
    if (!selected.length) return
    setSending(true)
    try {
      const res = await inviteApi.send(meetingId, selected.map(({ _key, ...rest }) => rest))
      setSent(res.invited)
    } catch (e: any) {
      setSent([{ email: "—", sent: false, error: e.message }])
    }
    setSending(false)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "36px", padding: "0 10px",
    border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
    background: "var(--s-surface)", color: "var(--s-text)", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
  }

  const sentCount   = sent?.filter(r => r.sent).length ?? 0
  const failedCount = sent?.filter(r => !r.sent).length ?? 0

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: "var(--s-surface)", borderRadius: "var(--s-radius-lg)",
        border: "1px solid var(--s-border)", width: "min(540px, 95vw)",
        maxHeight: "90vh", overflowY: "auto", padding: "24px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--s-text)", letterSpacing: "-0.3px" }}>Invite Participants</div>
            <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
              Search staff by name or email, or add a guest manually.
            </div>
          </div>
          <button onClick={onClose} disabled={sending} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--s-text3)", fontSize: "20px", lineHeight: 1, padding: "2px 6px",
          }}>×</button>
        </div>

        {/* ── Results view ── */}
        {sent ? (
          <div>
            <div style={{
              display: "flex", gap: "12px", marginBottom: "16px",
              padding: "14px 16px", borderRadius: "var(--s-radius)",
              background: failedCount === 0 ? "rgba(30,74,61,0.07)" : "rgba(200,82,42,0.07)",
              border: `1px solid ${failedCount === 0 ? "rgba(30,74,61,0.18)" : "rgba(200,82,42,0.18)"}`,
            }}>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--s-accent)", letterSpacing: "-1px" }}>{sentCount}</div>
              <div style={{ fontSize: "13px", color: "var(--s-text2)", lineHeight: 1.5 }}>
                invitation{sentCount !== 1 ? "s" : ""} sent
                {failedCount > 0 && <span style={{ color: "var(--s-accent2)", marginLeft: "8px" }}>· {failedCount} failed</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
              {sent.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 14px", borderRadius: "var(--s-radius)",
                  background: r.sent ? "rgba(30,74,61,0.05)" : "rgba(200,82,42,0.05)",
                  border: `1px solid ${r.sent ? "rgba(30,74,61,0.12)" : "rgba(200,82,42,0.12)"}`,
                }}>
                  <span style={{ fontSize: "13px", color: r.sent ? "var(--s-accent)" : "var(--s-accent2)", fontWeight: 600, width: "14px" }}>
                    {r.sent ? "✓" : "✗"}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--s-text)", flex: 1 }}>{r.email}</span>
                  {r.error && <span style={{ fontSize: "11px", color: "var(--s-accent2)" }}>{r.error}</span>}
                </div>
              ))}
            </div>
            <button className="s-btn s-btn-secondary" style={{ width: "100%" }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* ── Search ── */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "8px" }}>
                SEARCH STAFF
              </div>
              <div style={{ position: "relative" }}>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => results.length > 0 && setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="Start typing a name or email…"
                  style={inputStyle}
                  disabled={sending}
                />
                {/* Search spinner */}
                {searching && (
                  <span className="loading loading-spinner loading-xs" style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    color: "var(--s-text3)",
                  }} />
                )}

                {/* Dropdown */}
                {showDrop && results.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
                    background: "var(--s-surface)", border: "1px solid var(--s-border2)",
                    borderRadius: "var(--s-radius)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    maxHeight: "220px", overflowY: "auto",
                  }}>
                    {results.map(r => (
                      <button
                        key={r.id}
                        onMouseDown={() => addFromDB(r)}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "10px 14px", border: "none", background: "none",
                          cursor: "pointer", borderBottom: "1px solid var(--s-border)",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--s-surface2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text)" }}>{r.fullName}</div>
                        <div style={{ fontSize: "11px", color: "var(--s-text3)", marginTop: "1px" }}>
                          {r.email}{r.designation ? ` · ${r.designation}` : ""}{r.department ? ` · ${r.department}` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showDrop && results.length === 0 && query.length >= 2 && !searching && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 10,
                    background: "var(--s-surface)", border: "1px solid var(--s-border2)",
                    borderRadius: "var(--s-radius)", padding: "12px 14px",
                    fontSize: "12px", color: "var(--s-text3)",
                  }}>
                    No staff found — add as a guest below.
                  </div>
                )}
              </div>
            </div>

            {/* ── Guest form ── */}
            <details style={{ marginBottom: "20px" }}>
              <summary style={{
                fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)",
                letterSpacing: "0.08em", cursor: "pointer",
                listStyle: "none", display: "flex", alignItems: "center", gap: "6px",
                userSelect: "none",
              }}>
                ADD GUEST (NOT IN STAFF DIRECTORY) <span style={{ fontSize: "14px" }}>+</span>
              </summary>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--s-text2)", marginBottom: "4px" }}>Email *</div>
                    <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} disabled={sending} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--s-text2)", marginBottom: "4px" }}>Full Name *</div>
                    <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Jane Doe" style={inputStyle} disabled={sending} />
                  </div>
                </div>
                {!isInternal && (
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--s-text2)", marginBottom: "4px" }}>Designation</div>
                    <input value={guestDes} onChange={e => setGuestDes(e.target.value)} placeholder="e.g. Engineer" style={inputStyle} disabled={sending} />
                  </div>
                )}
                {days && days.length > 0 && (
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--s-text2)", marginBottom: "4px" }}>Meeting Day</div>
                    <select value={guestDay} onChange={e => setGuestDay(e.target.value)} style={{ ...inputStyle, height: "36px" }} disabled={sending}>
                      <option value="">All days</option>
                      {days.map(d => <option key={d.id} value={d.id}>Day {d.dayNumber}{d.label ? ` — ${d.label}` : ""}</option>)}
                    </select>
                  </div>
                )}
                {guestError && <div style={{ fontSize: "12px", color: "var(--s-accent2)" }}>{guestError}</div>}
                <button className="s-btn s-btn-secondary s-btn-sm" onClick={addGuest} disabled={sending} style={{ alignSelf: "flex-start" }}>
                  Add Guest
                </button>
              </div>
            </details>

            {/* ── Selected chips ── */}
            {selected.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  SELECTED ({selected.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selected.map(s => (
                    <span key={s._key} style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "4px 10px", borderRadius: "20px",
                      background: "rgba(30,74,61,0.1)", border: "1px solid rgba(30,74,61,0.2)",
                      fontSize: "12px", color: "var(--s-accent)",
                    }}>
                      {s.name}
                      {!sending && (
                        <button onClick={() => remove(s._key)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--s-accent)", fontSize: "15px", lineHeight: 1, padding: 0,
                        }}>×</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Send overlay while sending ── */}
            {sending && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "10px", padding: "16px", marginBottom: "16px",
                background: "rgba(30,74,61,0.06)", borderRadius: "var(--s-radius)",
                border: "1px solid rgba(30,74,61,0.15)",
              }}>
                <span className="loading loading-spinner loading-md" style={{ color: "var(--s-accent)" }} />
                <span style={{ fontSize: "13px", color: "var(--s-accent)", fontWeight: 500 }}>
                  Sending {selected.length} invitation{selected.length !== 1 ? "s" : ""}…
                </span>
              </div>
            )}

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="s-btn s-btn-secondary" onClick={onClose} disabled={sending}>Cancel</button>
              <button
                className="s-btn s-btn-primary"
                onClick={sendInvites}
                disabled={sending || selected.length === 0}
              >
                {sending
                  ? <><span className="loading loading-spinner loading-xs" /> Sending…</>
                  : `Send ${selected.length ? `${selected.length} ` : ""}Invite${selected.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
