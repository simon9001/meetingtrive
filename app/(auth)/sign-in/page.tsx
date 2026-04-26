"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Suspense } from "react"
import Link from "next/link"

function SignInForm() {
  const [email,    setEmail]    = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error,    setError]    = React.useState<string | null>(null)
  const [loading,  setLoading]  = React.useState(false)
  const router      = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/app"

  // Forgot-password inline state
  const [showForgot,      setShowForgot]      = React.useState(false)
  const [forgotEmail,     setForgotEmail]     = React.useState("")
  const [forgotLoading,   setForgotLoading]   = React.useState(false)
  const [forgotSent,      setForgotSent]      = React.useState(false)
  const [forgotError,     setForgotError]     = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError("Invalid email or password. Please try again."); return }
    router.push(callbackUrl)
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { setForgotError("Please enter your email address."); return }
    setForgotLoading(true); setForgotError("")
    try {
      await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail }),
      })
      setForgotSent(true)
    } catch {
      setForgotError("Could not send email. Try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--s-sans)" }}>
      <style>{`
        @media (min-width: 1024px) {
          .signin-panel-left  { display: flex !important; }
          .signin-mobile-only { display: none !important; }
        }
      `}</style>

      {/* ── Left panel — branding ── */}
      <div
        className="signin-panel-left"
        style={{
          display: "none", width: "44%", flexShrink: 0,
          flexDirection: "column", justifyContent: "space-between",
          padding: "40px 48px",
          background: "var(--s-accent)",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Subtle circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "60px", left: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l4 4 8-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 600, fontSize: "16px", letterSpacing: "-0.4px" }}>AttendSync</span>
        </div>

        {/* Middle content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "14px" }}>
            Enterprise attendance,<br />simplified.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.62)", fontSize: "14px", lineHeight: 1.7, maxWidth: "340px", marginBottom: "32px" }}>
            GPS-verified sign-ins, digital signatures, and one-click audit-ready reports — all in your browser.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "No more paper sign-in sheets",
              "Works for virtual and physical meetings",
              "PDF & DOCX export with embedded signatures",
              "Full audit trail with cryptographic hashing",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.78)", fontSize: "13px" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.38)", fontSize: "12px", textDecoration: "none", fontFamily: "var(--s-mono)", letterSpacing: "0.04em" }}>
            ← Back to homepage
          </Link>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", background: "var(--s-bg)", minHeight: "100vh",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Mobile logo */}
          <div className="signin-mobile-only" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "var(--s-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 6.5l3.5 3.5 6.5-6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.3px", color: "var(--s-text)" }}>AttendSync</span>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "6px", color: "var(--s-text)" }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--s-text2)", fontSize: "13px" }}>
              Sign in to your organisation&apos;s workspace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--s-accent2-light)", border: "1px solid #F5C9B8",
              borderRadius: "var(--s-radius)", padding: "10px 14px",
              color: "var(--s-accent2)", fontSize: "13px",
              marginBottom: "20px",
            }}>
              <AlertCircle style={{ width: "14px", height: "14px", flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label htmlFor="email" style={{ fontSize: "12px", fontWeight: 500, color: "var(--s-text)" }}>
                Email address
              </Label>
              <Input
                id="email" type="email"
                placeholder="you@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  height: "40px", borderRadius: "var(--s-radius)",
                  border: "1px solid var(--s-border2)", fontSize: "13px",
                  background: "var(--s-surface)", color: "var(--s-text)",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label htmlFor="password" style={{ fontSize: "12px", fontWeight: 500, color: "var(--s-text)" }}>
                Password
              </Label>
              <Input
                id="password" type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  height: "40px", borderRadius: "var(--s-radius)",
                  border: "1px solid var(--s-border2)", fontSize: "13px",
                  background: "var(--s-surface)", color: "var(--s-text)",
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "42px", borderRadius: "var(--s-radius)",
                background: loading ? "var(--s-text3)" : "var(--s-accent)",
                color: "white", border: "none", fontSize: "13px", fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                fontFamily: "var(--s-sans)", transition: "background 0.15s",
              }}
            >
              {loading
                ? <><Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Signing in…</>
                : "Sign In →"
              }
            </button>

            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => { setShowForgot(v => !v); setForgotSent(false); setForgotError(""); setForgotEmail(email) }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--s-accent)", fontFamily: "var(--s-sans)" }}
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Forgot password panel */}
          {showForgot && (
            <div style={{
              marginTop: "16px", padding: "16px",
              background: "var(--s-surface)", border: "1px solid var(--s-border)",
              borderRadius: "var(--s-radius)",
            }}>
              {forgotSent ? (
                <div style={{ textAlign: "center", fontSize: "13px", color: "var(--s-text2)", lineHeight: 1.6 }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>📧</div>
                  If that email is registered, a reset link has been sent. Check your inbox.
                  <br />
                  <button
                    onClick={() => setShowForgot(false)}
                    style={{ marginTop: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--s-accent)", fontFamily: "var(--s-sans)" }}
                  >
                    Back to sign-in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-text)", marginBottom: "2px" }}>
                    Send a password reset link
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      height: "36px", padding: "0 10px", fontSize: "13px",
                      border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
                      background: "var(--s-bg)", color: "var(--s-text)", outline: "none",
                    }}
                  />
                  {forgotError && <div style={{ fontSize: "12px", color: "var(--s-accent2)" }}>{forgotError}</div>}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      height: "36px", borderRadius: "var(--s-radius)",
                      background: "var(--s-accent)", color: "white", border: "none",
                      fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--s-sans)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}
                  >
                    {forgotLoading ? <><Loader2 style={{ width: "12px", height: "12px" }} className="animate-spin" /> Sending…</> : "Send Reset Email"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Dev credentials */}
          <div style={{
            marginTop: "28px", padding: "12px 14px",
            background: "var(--s-surface)", borderRadius: "var(--s-radius)",
            border: "1px solid var(--s-border)",
          }}>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "5px" }}>
              DEV CREDENTIALS
            </div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "12px", color: "var(--s-text2)" }}>
              admin@attendsync.local / Admin@12345
            </div>
          </div>

          <div className="signin-mobile-only" style={{ textAlign: "center", marginTop: "24px" }}>
            <Link href="/" style={{ fontSize: "12px", color: "var(--s-accent)", fontWeight: 500, textDecoration: "none", fontFamily: "var(--s-mono)" }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--s-bg)" }}>
        <Loader2 style={{ width: "24px", height: "24px", color: "var(--s-accent)" }} className="animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
