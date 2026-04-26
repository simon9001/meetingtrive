import { meetingsApi, reportsApi } from "@/lib/api-client"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { FileDown, FileText, Table2 } from "lucide-react"
import Link from "next/link"

export default async function ReportPage({
  params,
}: {
  params: Promise<{ meetingId: string }>
}) {
  const { meetingId } = await params

  let meeting
  try {
    const res = await meetingsApi.get(meetingId)
    meeting = res.meeting
  } catch {
    notFound()
  }

  if (!meeting) notFound()

  const signedCount = meeting.participants.filter((p: any) => p.signedAt).length
  const totalCount = meeting.participants.length

  const dateRange =
    meeting.sessionType === "MULTI_DAY" && meeting.days && meeting.days.length > 0
      ? `${format(new Date(meeting.days[0].date), "dd MMM")} – ${format(new Date(meeting.days[meeting.days.length - 1].date), "dd MMM yyyy")}`
      : format(new Date(meeting.startDatetime), "dd MMM yyyy")

  return (
    <div style={{ maxWidth: "680px" }}>

      {/* Back */}
      <Link
        href={`/meetings/${meetingId}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 500, color: "var(--s-text2)", textDecoration: "none", marginBottom: "24px" }}
      >
        ← Back to meeting
      </Link>

      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.4px", color: "var(--s-text)", marginBottom: "6px" }}>
          Export Attendance Register
        </h1>
        <p style={{ fontSize: "13px", color: "var(--s-text2)" }}>
          Download the official attendance document for <strong>{meeting.title}</strong>.
        </p>
      </div>

      {/* Summary card */}
      <div className="s-card" style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "16px" }}>
          MEETING SUMMARY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Meeting",      value: meeting.title },
            { label: "Organisation", value: meeting.organisation.name },
            { label: "Date(s)",      value: dateRange },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.04em" }}>{label}</span>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--s-border)" }}>
            <span style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.04em" }}>Signatures collected</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-1px", color: "var(--s-accent)" }}>{signedCount}</span>
              <span style={{ fontSize: "13px", color: "var(--s-text3)" }}>/ {totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if no signatures */}
      {signedCount === 0 && (
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-start",
          background: "var(--s-amber-light)", border: "1px solid #E8D0A0",
          borderRadius: "var(--s-radius)", padding: "12px 16px", marginBottom: "16px",
        }}>
          <span style={{ color: "var(--s-amber)", fontFamily: "var(--s-mono)", fontSize: "11px", letterSpacing: "0.06em", flexShrink: 0, marginTop: "1px" }}>!</span>
          <p style={{ fontSize: "13px", color: "var(--s-amber)", fontWeight: 500, margin: 0 }}>
            No signatures collected yet. The report will be empty until participants sign in.
          </p>
        </div>
      )}

      {/* Download format cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "4px" }}>
          CHOOSE FORMAT
        </div>

        <DownloadCard
          href={reportsApi.downloadPDF(meetingId)}
          icon={FileText}
          title="PDF Report"
          subtitle="A4 Landscape · Print-ready"
          description="Official attendance register with embedded signatures, organisation logo, and audit footer."
          ext="PDF"
          badgeClass="s-badge-red"
        />
        <DownloadCard
          href={reportsApi.downloadDOCX(meetingId)}
          icon={FileDown}
          title="Word Document"
          subtitle="DOCX · Editable"
          description="Editable Word document with signatures as embedded images. Compatible with Microsoft Word and Google Docs."
          ext="DOCX"
          badgeClass="s-badge-blue"
        />
        <DownloadCard
          href={reportsApi.downloadCSV(meetingId)}
          icon={Table2}
          title="Spreadsheet Data"
          subtitle="CSV · Raw data"
          description="Attendance data without signatures — for HR systems, spreadsheets, or further analysis."
          ext="CSV"
          badgeClass="s-badge-green"
        />
      </div>
    </div>
  )
}

function DownloadCard({
  href, icon: Icon, title, subtitle, description, ext, badgeClass,
}: {
  href: string
  icon: React.ElementType
  title: string
  subtitle: string
  description: string
  ext: string
  badgeClass: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="report-download-card"
    >
      <div style={{
        width: "44px", height: "44px", borderRadius: "var(--s-radius)",
        background: "var(--s-surface2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon style={{ width: "20px", height: "20px", color: "var(--s-accent)" }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-text)" }}>{title}</span>
          <span className={`s-badge ${badgeClass}`}>{ext}</span>
        </div>
        <p style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", letterSpacing: "0.04em", margin: "0 0 4px" }}>{subtitle}</p>
        <p style={{ fontSize: "12px", color: "var(--s-text2)", lineHeight: 1.5, margin: 0 }}>{description}</p>
      </div>

      <div style={{ flexShrink: 0 }}>
        <div className="s-btn s-btn-secondary s-btn-sm" style={{ pointerEvents: "none" }}>
          <FileDown style={{ width: "13px", height: "13px" }} />
          Download
        </div>
      </div>
    </a>
  )
}
