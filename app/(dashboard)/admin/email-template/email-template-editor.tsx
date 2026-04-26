"use client"

import { useState, useEffect } from "react"
import { emailTemplateApi } from "@/lib/api-client"
import type { Organisation } from "@/lib/api-client"

interface Props {
  organisations: Organisation[]
}

export function EmailTemplateEditor({ organisations }: Props) {
  const [orgId,   setOrgId]   = useState(organisations[0]?.id ?? "")
  const [subject, setSubject] = useState("")
  const [html,    setHtml]    = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [preview, setPreview] = useState(false)
  const [status,  setStatus]  = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [msg,     setMsg]     = useState("")

  useEffect(() => {
    if (!orgId) return
    setStatus("idle")
    emailTemplateApi.get(orgId).then(d => {
      setSubject(d.subjectTemplate)
      setHtml(d.htmlTemplate)
      setIsCustom(d.isCustom)
    }).catch(() => {})
  }, [orgId])

  const save = async () => {
    setStatus("saving")
    try {
      await emailTemplateApi.save(orgId, { subjectTemplate: subject, htmlTemplate: html })
      setStatus("saved"); setIsCustom(true)
      setMsg("Template saved.")
      setTimeout(() => setStatus("idle"), 2500)
    } catch (e: any) {
      setStatus("error"); setMsg(e.message)
    }
  }

  const reset = async () => {
    if (!confirm("Reset to the default template?")) return
    setStatus("saving")
    try {
      await emailTemplateApi.reset(orgId)
      const d = await emailTemplateApi.get(orgId)
      setSubject(d.subjectTemplate); setHtml(d.htmlTemplate); setIsCustom(false)
      setStatus("saved"); setMsg("Reset to default.")
      setTimeout(() => setStatus("idle"), 2500)
    } catch (e: any) {
      setStatus("error"); setMsg(e.message)
    }
  }

  const previewHtml = html
    .replace(/\{\{participantName\}\}/g, "Jane Doe")
    .replace(/\{\{meetingTitle\}\}/g, "Q2 Strategy Review")
    .replace(/\{\{meetingDate\}\}/g, "21 Apr 2026, 09:00")
    .replace(/\{\{joinUrl\}\}/g, "https://attend.example.com/join/preview")
    .replace(/\{\{#if joinUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, "$1")

  const inputStyle: React.CSSProperties = {
    width: "100%", height: "38px", padding: "0 10px",
    border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
    background: "var(--s-surface)", color: "var(--s-text)", fontSize: "13px",
    outline: "none", boxSizing: "border-box",
  }

  return (
    <div>
      {/* Org selector */}
      {organisations.length > 1 && (
        <div className="s-card" style={{ marginBottom: "16px" }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "8px" }}>
            ORGANISATION
          </div>
          <select
            value={orgId}
            onChange={e => setOrgId(e.target.value)}
            style={{ ...inputStyle, height: "38px" }}
          >
            {organisations.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="s-card">
        {/* Status badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em" }}>
            INVITATION EMAIL TEMPLATE
          </div>
          <span className={`s-badge ${isCustom ? "s-badge-green" : "s-badge-gray"}`}>
            {isCustom ? "Custom" : "Default"}
          </span>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--s-text2)", marginBottom: "6px" }}>Subject line</div>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="You're invited: {{meetingTitle}}"
            style={inputStyle}
          />
        </div>

        {/* HTML editor / preview toggle */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--s-text2)" }}>HTML body</div>
            <button
              onClick={() => setPreview(p => !p)}
              className="s-btn s-btn-secondary s-btn-sm"
            >
              {preview ? "Edit HTML" : "Preview"}
            </button>
          </div>

          {preview ? (
            <div style={{
              border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
              minHeight: "360px", background: "#fff", overflow: "hidden",
            }}>
              <iframe
                srcDoc={previewHtml}
                style={{ width: "100%", height: "360px", border: "none" }}
                sandbox="allow-same-origin"
                title="Email preview"
              />
            </div>
          ) : (
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              spellCheck={false}
              style={{
                width: "100%", minHeight: "360px", padding: "12px",
                border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
                background: "var(--s-surface2)", color: "var(--s-text)",
                fontSize: "12px", fontFamily: "var(--s-mono)", lineHeight: 1.6,
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Feedback */}
        {status !== "idle" && msg && (
          <div style={{
            fontSize: "12px", marginBottom: "12px",
            color: status === "error" ? "#c0392b" : "var(--s-accent)",
          }}>
            {msg}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          {isCustom && (
            <button
              className="s-btn s-btn-secondary"
              onClick={reset}
              disabled={status === "saving"}
            >
              {status === "saving"
                ? <><span className="loading loading-spinner loading-xs" /> Resetting…</>
                : "Reset to Default"}
            </button>
          )}
          <button
            className="s-btn s-btn-primary"
            onClick={save}
            disabled={status === "saving" || !subject || !html}
          >
            {status === "saving"
              ? <><span className="loading loading-spinner loading-xs" /> Saving…</>
              : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  )
}
