import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { organisationsApi } from "@/lib/api-client"
import { EmailTemplateEditor } from "./email-template-editor"

export default async function EmailTemplatePage() {
  const session = await getSession()
  const user    = session?.user as any
  if (user?.role !== "ADMIN") redirect("/app")

  const { organisations } = await organisationsApi.list()

  return (
    <div style={{ maxWidth: "880px" }}>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--s-text)", letterSpacing: "-0.4px" }}>
            Email Template
          </div>
          <div style={{ fontSize: "12px", color: "var(--s-text2)", marginTop: "3px" }}>
            Customise the invitation email sent to participants. Supports HTML with{" "}
            <code style={{ fontFamily: "var(--s-mono)", fontSize: "11px", background: "var(--s-surface2)", padding: "1px 4px", borderRadius: "3px" }}>
              {"{{placeholder}}"}
            </code>{" "}variables.
          </div>
        </div>
      </div>

      <div className="s-card" style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "14px" }}>
          AVAILABLE PLACEHOLDERS
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {[
            ["{{participantName}}", "Invitee's full name"],
            ["{{meetingTitle}}", "Meeting title"],
            ["{{meetingDate}}", "Meeting date & time"],
            ["{{joinUrl}}", "Proxy join link (virtual meetings)"],
            ["{{#if joinUrl}} … {{/if}}", "Conditional block — only renders if joinUrl exists"],
          ].map(([code, desc]) => (
            <div key={code} style={{
              padding: "6px 12px", background: "var(--s-surface2)",
              borderRadius: "var(--s-radius)", border: "1px solid var(--s-border)",
              display: "flex", gap: "8px", alignItems: "center",
            }}>
              <code style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-accent)", whiteSpace: "nowrap" }}>{code}</code>
              <span style={{ fontSize: "11px", color: "var(--s-text3)" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <EmailTemplateEditor organisations={organisations} />
    </div>
  )
}
