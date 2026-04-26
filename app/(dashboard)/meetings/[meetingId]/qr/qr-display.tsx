"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { format, formatDistanceToNow } from "date-fns"
import { MapPin, Clock, Download, RefreshCw, QrCode, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  meeting: { id: string; title: string; venueName?: string; geoFenceRadiusM: number }
  qrUrl: string
  expiresAt: string | null
}

export function QRDisplay({ meeting, qrUrl, expiresAt }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "H",
      width: 480,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then(setQrDataUrl)
  }, [qrUrl])

  useEffect(() => {
    if (!expiresAt) return
    const check = () => setExpired(new Date() > new Date(expiresAt))
    check()
    const id = setInterval(check, 10_000)
    return () => clearInterval(id)
  }, [expiresAt])

  const download = () => {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `attendsync-qr-${meeting.id}.png`
    a.click()
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--s-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>

      {/* Back link */}
      <div style={{ width: "100%", maxWidth: "520px", marginBottom: "16px" }}>
        <Link
          href={`/meetings/${meeting.id}`}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "var(--s-text2)", textDecoration: "none" }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to meeting
        </Link>
      </div>

      {/* Main card */}
      <div style={{
        width: "100%", maxWidth: "520px",
        background: "var(--s-surface)",
        borderRadius: "var(--s-radius-lg)",
        border: "1px solid var(--s-border)",
        overflow: "hidden",
      }}>
        <div style={{ height: "4px", background: "var(--s-accent)" }} />

        {/* Header */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid var(--s-border)",
          background: expired ? "var(--s-accent2-light)" : "var(--s-surface2)",
        }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "6px" }}>
            PHYSICAL SIGN-IN QR CODE
          </div>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--s-text)", marginBottom: "8px" }}>{meeting.title}</p>
          {meeting.venueName && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--s-text3)", fontFamily: "var(--s-mono)" }}>
              <MapPin style={{ width: "12px", height: "12px" }} />
              <span>{meeting.venueName}</span>
              <span>·</span>
              <span>{meeting.geoFenceRadiusM}m geo-fence</span>
            </div>
          )}
        </div>

        {/* QR area */}
        <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {expired ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--s-accent2-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <QrCode style={{ width: "32px", height: "32px", color: "var(--s-accent2)" }} />
              </div>
              <p style={{ fontWeight: 700, color: "var(--s-accent2)", fontSize: "17px", marginBottom: "8px" }}>QR Code Expired</p>
              <p style={{ color: "var(--s-text3)", fontSize: "13px", marginBottom: "20px" }}>Generate a new QR token to continue.</p>
              <Link
                href={`/meetings/${meeting.id}`}
                className="s-btn s-btn-primary"
              >
                <RefreshCw style={{ width: "14px", height: "14px" }} />
                Generate New QR
              </Link>
            </div>
          ) : qrDataUrl ? (
            <>
              <div style={{
                padding: "20px",
                background: "var(--s-surface)",
                borderRadius: "var(--s-radius)",
                border: "2px solid var(--s-border2)",
              }}>
                <img
                  src={qrDataUrl}
                  alt="Attendance QR Code"
                  style={{ display: "block", width: "240px", height: "240px", borderRadius: "6px" }}
                />
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-text2)", marginBottom: "4px" }}>
                  Scan to sign in
                </p>
                <p style={{ fontSize: "11px", color: "var(--s-text3)", fontFamily: "var(--s-mono)", wordBreak: "break-all", maxWidth: "280px" }}>
                  {qrUrl}
                </p>
              </div>
            </>
          ) : (
            <div style={{ width: "240px", height: "240px", background: "var(--s-surface2)", borderRadius: "var(--s-radius)", animation: "pulse 1.5s ease-in-out infinite" }} />
          )}
        </div>

        {/* Expiry banner */}
        {expiresAt && !expired && (
          <div style={{
            margin: "0 28px 20px",
            padding: "10px 14px",
            background: "var(--s-amber-light)",
            border: "1px solid #E8D0A0",
            borderRadius: "var(--s-radius)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Clock style={{ width: "14px", height: "14px", color: "var(--s-amber)", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--s-amber)", fontFamily: "var(--s-mono)" }}>
              Expires {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
            </span>
            <span style={{ fontSize: "12px", color: "var(--s-text3)", marginLeft: "auto", fontFamily: "var(--s-mono)" }}>
              {format(new Date(expiresAt), "HH:mm")}
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "0 28px 24px", display: "flex", gap: "10px" }}>
          <button
            onClick={download}
            disabled={!qrDataUrl || expired}
            className="s-btn s-btn-primary"
            style={{
              flex: 1, opacity: !qrDataUrl || expired ? 0.4 : 1,
              cursor: !qrDataUrl || expired ? "not-allowed" : "pointer",
              justifyContent: "center",
            }}
          >
            <Download style={{ width: "14px", height: "14px" }} />
            Download PNG
          </button>
          <Link
            href={`/meetings/${meeting.id}`}
            className="s-btn s-btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            Back to Meeting
          </Link>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--s-border)", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <ShieldCheck style={{ width: "12px", height: "12px", color: "var(--s-accent)" }} />
          <span style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em" }}>
            GPS-VERIFIED · SECURE
          </span>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "12px", color: "var(--s-text3)", textAlign: "center", maxWidth: "400px", lineHeight: 1.6 }}>
        Project on screen or print. Attendees scan and their GPS location is verified server-side before they can sign.
      </p>
    </div>
  )
}
