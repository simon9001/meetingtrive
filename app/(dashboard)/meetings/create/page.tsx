"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { meetingSchema, type MeetingFormValues } from "@/lib/validators/meeting"
import { createMeeting } from "@/lib/actions/meeting"
import Link from "next/link"

// ─── Field helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", height: "38px", padding: "0 12px",
  border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
  fontFamily: "var(--s-sans)", fontSize: "13px",
  background: "var(--s-surface)", color: "var(--s-text)",
  outline: "none", boxSizing: "border-box",
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: "pointer", appearance: "auto" as any,
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--s-text)" }}>{label}</label>
      {children}
      {error && (
        <span style={{ fontSize: "11px", color: "var(--s-accent2)" }}>{error}</span>
      )}
    </div>
  )
}

// ─── Multi-day day labels ─────────────────────────────────────────────────────

function MultiDayLabels({
  startDate, endDate,
  onChange,
}: {
  startDate: Date
  endDate: Date
  onChange: (days: { dayNumber: number; label?: string; date: Date }[]) => void
}) {
  const [labels, setLabels] = React.useState<string[]>([])

  const days = React.useMemo(() => {
    const result: Date[] = []
    const s = new Date(startDate); s.setHours(0, 0, 0, 0)
    const e = new Date(endDate);   e.setHours(0, 0, 0, 0)
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) result.push(new Date(d))
    return result.slice(0, 14)
  }, [startDate, endDate])

  React.useEffect(() => {
    setLabels(Array(days.length).fill(""))
  }, [days.length])

  const update = (i: number, val: string) => {
    const next = [...labels]; next[i] = val; setLabels(next)
    onChange(days.map((d, idx) => ({ dayNumber: idx + 1, label: next[idx] || undefined, date: d })))
  }

  if (days.length <= 1) return null

  return (
    <div style={{ borderTop: "1px solid var(--s-border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em" }}>
        DAY LABELS (OPTIONAL)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="s-badge s-badge-green" style={{ flexShrink: 0, minWidth: "52px", justifyContent: "center" }}>
              Day {i + 1}
            </span>
            <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", width: "64px", flexShrink: 0 }}>
              {format(d, "dd MMM")}
            </span>
            <input
              placeholder={`Label for Day ${i + 1}`}
              value={labels[i] ?? ""}
              onChange={(e) => update(i, e.target.value)}
              style={{ ...inputStyle, height: "32px" }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  { id: "type",     title: "Meeting Type" },
  { id: "details",  title: "Details" },
  { id: "schedule", title: "Schedule" },
  { id: "security", title: "Security" },
  { id: "review",   title: "Review" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateMeetingPage() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "VIRTUAL",
      platform: "NONE",
      meetingLink: "",
      sessionType: "SINGLE",
      startDatetime: new Date(),
      endDatetime: new Date(Date.now() + 3_600_000),
      geoFenceRadiusM: 100,
      attendanceThresholdMinutes: 15,
      staffIdGateEnabled: false,
    },
  })

  const watchType        = form.watch("type")
  const watchSessionType = form.watch("sessionType")
  const watchStaffId     = form.watch("staffIdGateEnabled")

  const onSubmit = async (data: MeetingFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await createMeeting(data)
      if (result.id) router.push(`/meetings/${result.id}`)
    } catch (err: any) {
      alert(err?.message ?? "Failed to create meeting. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const next = (e: React.MouseEvent) => { e.preventDefault(); setCurrentStep((p) => Math.min(p + 1, steps.length - 1)) }
  const prev = (e: React.MouseEvent) => { e.preventDefault(); setCurrentStep((p) => Math.max(p - 1, 0)) }

  // Date helpers
  const startDate = form.watch("startDatetime")
  const endDate   = form.watch("endDatetime")

  const setDate = (field: "startDatetime" | "endDatetime", val: string) => {
    const [y, mo, d] = val.split("-").map(Number)
    const cur = new Date(form.getValues(field))
    cur.setFullYear(y, mo - 1, d)
    form.setValue(field, cur)
  }

  const setTime = (field: "startDatetime" | "endDatetime", val: string) => {
    const [h, m] = val.split(":").map(Number)
    const cur = new Date(form.getValues(field))
    cur.setHours(h, m)
    form.setValue(field, cur)
  }

  const toDateInput  = (d: Date) => format(d, "yyyy-MM-dd")
  const toTimeInput  = (d: Date) => format(d, "HH:mm")

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* Page header */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/meetings" style={{ fontSize: "12px", color: "var(--s-text2)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
          ← Back to meetings
        </Link>
        <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.4px", color: "var(--s-text)" }}>
          Schedule Meeting
        </div>
        <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
          Set up your meeting and attendance flow
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "24px", alignItems: "start" }} className="create-meeting-grid">

        {/* ── Stepper ── */}
        <div style={{
          background: "var(--s-surface)", border: "1px solid var(--s-border)",
          borderRadius: "var(--s-radius-lg)", padding: "12px", position: "sticky", top: "80px",
        }}>
          {steps.map((step, i) => {
            const done   = currentStep > i
            const active = currentStep === i
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => i <= currentStep && setCurrentStep(i)}
                disabled={i > currentStep}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "8px 10px", borderRadius: "8px",
                  border: "none", background: active ? "var(--s-accent-light)" : "transparent",
                  cursor: i > currentStep ? "default" : "pointer",
                  marginBottom: "2px",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 600,
                  background: done ? "var(--s-accent)" : active ? "var(--s-accent)" : "var(--s-surface2)",
                  color: done || active ? "#fff" : "var(--s-text3)",
                  border: `1px solid ${done || active ? "var(--s-accent)" : "var(--s-border)"}`,
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{
                  fontSize: "12px", fontWeight: active ? 500 : 400,
                  color: active ? "var(--s-accent)" : done ? "var(--s-text)" : "var(--s-text3)",
                  whiteSpace: "nowrap",
                }}>
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Form card ── */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div style={{
            background: "var(--s-surface)", border: "1px solid var(--s-border)",
            borderRadius: "var(--s-radius-lg)", overflow: "hidden",
          }}>
            <div style={{ height: "3px", background: "var(--s-accent)" }} />

            {/* Step header */}
            <div style={{ padding: "20px 24px 0" }}>
              <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "4px" }}>
                STEP {currentStep + 1} OF {steps.length}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--s-text)", letterSpacing: "-0.3px" }}>
                {steps[currentStep].title}
              </div>
            </div>

            {/* Step content */}
            <div style={{ padding: "20px 24px", minHeight: "380px" }}>

              {/* ── Step 0: Type ── */}
              {currentStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <Field label="Meeting title" error={form.formState.errors.title?.message}>
                    <input
                      {...form.register("title")}
                      placeholder="e.g. Annual General Meeting 2025"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Description (optional)">
                    <textarea
                      {...form.register("description")}
                      placeholder="Brief agenda or notes…"
                      rows={2}
                      style={{ ...inputStyle, height: "auto", padding: "8px 12px", resize: "vertical" }}
                    />
                  </Field>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--s-text)" }}>Attendance type</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {(["VIRTUAL", "PHYSICAL"] as const).map((t) => {
                        const active = watchType === t
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => form.setValue("type", t)}
                            style={{
                              padding: "16px", borderRadius: "var(--s-radius)",
                              border: `1.5px solid ${active ? "var(--s-accent)" : "var(--s-border)"}`,
                              background: active ? "var(--s-accent-light)" : "var(--s-surface2)",
                              cursor: "pointer", textAlign: "left", transition: "all 0.12s",
                            }}
                          >
                            <div style={{ fontSize: "13px", fontWeight: 600, color: active ? "var(--s-accent)" : "var(--s-text)", marginBottom: "3px" }}>
                              {t === "VIRTUAL" ? "Virtual" : "Physical"}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--s-text2)" }}>
                              {t === "VIRTUAL" ? "Teams, Meet, Zoom or custom link" : "On-site QR code sign-in"}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 1: Details ── */}
              {currentStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {watchType === "VIRTUAL" ? (
                    <>
                      <Field label="Platform">
                        <select
                          style={selectStyle}
                          defaultValue={form.getValues("platform")}
                          onChange={(e) => form.setValue("platform", e.target.value as any)}
                        >
                          <option value="NONE">Select platform…</option>
                          <option value="TEAMS">Microsoft Teams</option>
                          <option value="MEET">Google Meet</option>
                          <option value="ZOOM">Zoom</option>
                          <option value="CUSTOM">Custom / Other</option>
                        </select>
                      </Field>

                      <Field label="Meeting URL">
                        <input
                          {...form.register("meetingLink")}
                          placeholder="https://teams.microsoft.com/..."
                          style={inputStyle}
                        />
                      </Field>

                      <div style={{
                        padding: "10px 14px", borderRadius: "var(--s-radius)",
                        background: "var(--s-accent-light)", border: "1px solid #B8D8CC",
                        fontSize: "12px", color: "var(--s-accent)",
                      }}>
                        AttendSync will proxy this link so attendance is tracked automatically.
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label="Venue name">
                        <input
                          {...form.register("venueName")}
                          placeholder="e.g. Conference Room A, HQ Tower"
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Geo-fence radius">
                        <select
                          style={selectStyle}
                          defaultValue={form.getValues("geoFenceRadiusM").toString()}
                          onChange={(e) => form.setValue("geoFenceRadiusM", parseInt(e.target.value))}
                        >
                          <option value="50">50 m — Precise (single room)</option>
                          <option value="100">100 m — Recommended</option>
                          <option value="250">250 m — Large venue / campus</option>
                        </select>
                      </Field>

                      <div style={{
                        padding: "10px 14px", borderRadius: "var(--s-radius)",
                        background: "var(--s-amber-light)", border: "1px solid #E8D0A0",
                        fontSize: "12px", color: "var(--s-amber)",
                      }}>
                        Attendees must be within the geo-fence when they scan the QR code.
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Step 2: Schedule ── */}
              {currentStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Field label="Start date">
                      <input
                        type="date"
                        style={inputStyle}
                        value={toDateInput(startDate)}
                        onChange={(e) => setDate("startDatetime", e.target.value)}
                      />
                    </Field>
                    <Field label="Start time">
                      <input
                        type="time"
                        style={inputStyle}
                        value={toTimeInput(startDate)}
                        onChange={(e) => setTime("startDatetime", e.target.value)}
                      />
                    </Field>
                    <Field label="End date">
                      <input
                        type="date"
                        style={inputStyle}
                        value={toDateInput(endDate)}
                        onChange={(e) => setDate("endDatetime", e.target.value)}
                      />
                    </Field>
                    <Field label="End time">
                      <input
                        type="time"
                        style={inputStyle}
                        value={toTimeInput(endDate)}
                        onChange={(e) => setTime("endDatetime", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Session type">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {(["SINGLE", "MULTI_DAY"] as const).map((t) => {
                        const active = watchSessionType === t
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => form.setValue("sessionType", t)}
                            style={{
                              padding: "10px 14px", borderRadius: "var(--s-radius)",
                              border: `1.5px solid ${active ? "var(--s-accent)" : "var(--s-border)"}`,
                              background: active ? "var(--s-accent-light)" : "var(--s-surface2)",
                              cursor: "pointer", fontSize: "13px", fontWeight: active ? 500 : 400,
                              color: active ? "var(--s-accent)" : "var(--s-text2)",
                              transition: "all 0.12s",
                            }}
                          >
                            {t === "SINGLE" ? "Single day" : "Multi-day event"}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  {watchSessionType === "MULTI_DAY" && (
                    <MultiDayLabels
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(days) => form.setValue("days", days)}
                    />
                  )}
                </div>
              )}

              {/* ── Step 3: Security ── */}
              {currentStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Field label="Attendance threshold (minutes)">
                    <input
                      type="number"
                      min={1}
                      max={480}
                      {...form.register("attendanceThresholdMinutes", { valueAsNumber: true })}
                      style={{ ...inputStyle, width: "120px" }}
                    />
                    <span style={{ fontSize: "11px", color: "var(--s-text3)" }}>
                      Minimum time present for a valid sign-off
                    </span>
                  </Field>

                  <div style={{
                    padding: "16px", borderRadius: "var(--s-radius)",
                    border: "1px solid var(--s-border)", background: "var(--s-surface2)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                  }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text)", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                        Staff ID Gate
                        <span className="s-badge s-badge-green">Secure</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--s-text2)" }}>
                        Require attendees to verify with their organisational Staff ID
                      </div>
                    </div>
                    <label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px", flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={watchStaffId}
                        onChange={(e) => form.setValue("staffIdGateEnabled", e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: "absolute", inset: 0, borderRadius: "11px", cursor: "pointer",
                        background: watchStaffId ? "var(--s-accent)" : "var(--s-border2)",
                        transition: "background 0.2s",
                      }}>
                        <span style={{
                          position: "absolute", top: "3px",
                          left: watchStaffId ? "21px" : "3px",
                          width: "16px", height: "16px", borderRadius: "50%",
                          background: "#fff", transition: "left 0.2s",
                        }} />
                      </span>
                    </label>
                  </div>

                  <div style={{
                    padding: "10px 14px", borderRadius: "var(--s-radius)",
                    background: "var(--s-accent-light)", border: "1px solid #B8D8CC",
                    fontSize: "12px", color: "var(--s-accent)",
                  }}>
                    Participation data from Teams/Meet is fetched automatically at session end.
                  </div>
                </div>
              )}

              {/* ── Step 4: Review ── */}
              {currentStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{
                    background: "var(--s-surface2)", borderRadius: "var(--s-radius)",
                    border: "1px solid var(--s-border)", overflow: "hidden",
                  }}>
                    {[
                      { label: "Title",     value: form.getValues("title") || "—" },
                      { label: "Type",      value: watchType === "VIRTUAL" ? `Virtual · ${form.getValues("platform")}` : `Physical · ${form.getValues("venueName") || "Venue"}` },
                      { label: "Starts",    value: format(startDate, "dd MMM yyyy, HH:mm") },
                      { label: "Ends",      value: format(endDate, "dd MMM yyyy, HH:mm") },
                      { label: "Session",   value: watchSessionType === "MULTI_DAY" ? "Multi-day event" : "Single day" },
                      { label: "Threshold", value: `${form.getValues("attendanceThresholdMinutes")} min` },
                      { label: "Staff ID gate", value: watchStaffId ? "Enabled" : "Disabled" },
                    ].map(({ label, value }, i) => (
                      <div key={label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 16px",
                        borderBottom: i < 6 ? "1px solid var(--s-border)" : "none",
                      }}>
                        <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.04em" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text)", textAlign: "right", maxWidth: "60%" }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: "12px 16px", borderRadius: "var(--s-radius)",
                    background: "var(--s-accent-light)", border: "1px solid #B8D8CC",
                    fontSize: "12px", color: "var(--s-accent)",
                  }}>
                    Submitting will generate your unique join links and activate the attendance flow.
                  </div>
                </div>
              )}
            </div>

            {/* Footer / navigation */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--s-border)",
              background: "var(--s-surface2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <button
                type="button"
                onClick={prev}
                disabled={currentStep === 0 || isSubmitting}
                className="s-btn s-btn-secondary s-btn-sm"
                style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
              >
                ← Back
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="s-btn s-btn-primary"
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
                >
                  {isSubmitting ? "Creating…" : "Create Meeting"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={next}
                  className="s-btn s-btn-primary s-btn-sm"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
