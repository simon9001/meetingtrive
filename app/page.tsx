import Link from "next/link"

export default function HomePage() {
  return (
    <div style={{ fontFamily: "var(--s-sans)", background: "var(--s-bg)", color: "var(--s-text)" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(245,243,238,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--s-border)",
        padding: "0 1.5rem",
        height: "54px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "26px", height: "26px", borderRadius: "6px",
            background: "var(--s-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.3px" }}>AttendSync</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a href="#features" style={{ fontSize: "13px", color: "var(--s-text2)", textDecoration: "none" }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: "13px", color: "var(--s-text2)", textDecoration: "none" }}>How it works</a>
          <Link href="/sign-in" style={{
            background: "var(--s-accent)", color: "white",
            borderRadius: "var(--s-radius)", padding: "7px 16px",
            fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>
            Access Portal →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: "80px 1.5rem 64px", background: "var(--s-bg)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "center" }}>

            {/* Left — copy */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                background: "var(--s-accent-light)", border: "1px solid #B8D8CC",
                borderRadius: "9999px", padding: "5px 12px", marginBottom: "24px",
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--s-accent)" }} />
                <span style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-accent)", letterSpacing: "0.06em" }}>
                  YOUR ATTENDANCE PLATFORM
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(1.9rem, 4vw, 3rem)", fontWeight: 700,
                lineHeight: 1.1, letterSpacing: "-1.2px",
                marginBottom: "16px", color: "var(--s-text)",
              }}>
                Your attendance records,<br />
                <span style={{ color: "var(--s-accent)" }}>done properly.</span>
              </h1>

              <p style={{
                fontSize: "14px", lineHeight: 1.75,
                color: "var(--s-text2)", marginBottom: "28px",
              }}>
                A dedicated platform for managing meeting attendance — GPS-verified sign-ins,
                digital signatures, and instant audit-ready exports. Built around your workflow,
                not the other way around.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link href="/sign-in" style={{
                  background: "var(--s-accent)", color: "white",
                  borderRadius: "var(--s-radius)", padding: "10px 22px",
                  fontSize: "13px", fontWeight: 500, textDecoration: "none",
                  display: "inline-block",
                }}>
                  Go to your workspace →
                </Link>
                <a href="#how-it-works" style={{
                  background: "var(--s-surface)", color: "var(--s-text)",
                  border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
                  padding: "10px 20px", fontSize: "13px", textDecoration: "none",
                  display: "inline-block",
                }}>
                  See how it works
                </a>
              </div>

              {/* Subtle trust indicators — no aggregate numbers */}
              <div style={{ display: "flex", gap: "20px", marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--s-border)" }}>
                {[
                  { label: "GPS-verified sign-ins" },
                  { label: "Audit-ready exports" },
                  { label: "No paper. No manual work." },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--s-accent-light)", border: "1px solid #B8D8CC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <path d="M1 3.5l1.8 1.8 3-3.3" stroke="var(--s-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--s-text2)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock UI */}
            <div style={{
              background: "#0f1117", borderRadius: "10px", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {/* Window chrome */}
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "#13151c",
              }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c }} />
                ))}
                <span style={{ marginLeft: "10px", fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
                  Attendance Register
                </span>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "#4ade80", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: "9999px" }}>
                    LIVE
                  </span>
                </div>
              </div>

              {/* Layout */}
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr" }}>
                {/* Sidebar */}
                <div style={{ background: "#0d0f16", borderRight: "1px solid rgba(255,255,255,0.06)", padding: "12px 8px" }}>
                  <div style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em", padding: "0 6px", marginBottom: "12px" }}>
                    NAVIGATION
                  </div>
                  {[
                    { label: "Dashboard", active: false },
                    { label: "Meetings",  active: true },
                    { label: "Reports",   active: false },
                  ].map((item) => (
                    <div key={item.label} style={{
                      padding: "6px 8px", borderRadius: "5px", marginBottom: "2px",
                      background: item.active ? "rgba(30,74,61,0.4)" : "transparent",
                      color: item.active ? "#6ee7b7" : "rgba(255,255,255,0.28)",
                      fontSize: "11px", fontWeight: item.active ? 500 : 400,
                    }}>
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.82)", marginBottom: "4px" }}>
                    Board Meeting — Q4 Review
                  </div>
                  <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.28)", marginBottom: "12px" }}>
                    Physical · Conference Room A
                  </div>

                  <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "9999px", marginBottom: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "65%", background: "linear-gradient(90deg, #1E4A3D, #4ade80)", borderRadius: "9999px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>13 / 20 signed</span>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "#4ade80" }}>65%</span>
                  </div>

                  <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 60px", padding: "6px 10px", background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>NAME</span>
                      <span style={{ fontFamily: "var(--s-mono)", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>STATUS</span>
                    </div>
                    {[
                      { name: "D. Kamau",  signed: true },
                      { name: "A. Ochieng",signed: true },
                      { name: "M. Hassan", signed: false },
                      { name: "P. Mwangi", signed: false },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "1fr 60px",
                        padding: "7px 10px", alignItems: "center",
                        borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>{row.name}</span>
                        <span style={{
                          fontFamily: "var(--s-mono)", fontSize: "9px", padding: "2px 6px",
                          borderRadius: "9999px", textAlign: "center",
                          background: row.signed ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                          color: row.signed ? "#4ade80" : "rgba(255,255,255,0.2)",
                        }}>
                          {row.signed ? "✓" : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "72px 1.5rem", background: "var(--s-surface)", borderTop: "1px solid var(--s-border)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-accent)", letterSpacing: "0.08em", marginBottom: "10px" }}>
              WHAT YOUR PLATFORM INCLUDES
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.8px", color: "var(--s-text)" }}>
              Everything your team needs<br />to run accountable meetings.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {[
              { icon: "📋", title: "Digital Attendance Register", desc: "Capture legally-binding e-signatures from participants on any device — no paper, no printing." },
              { icon: "📍", title: "GPS Geo-fencing",             desc: "For physical meetings, attendees must be physically present within the venue to sign in." },
              { icon: "🔐", title: "Secure QR Sign-in",           desc: "Display a QR code at your venue. Tokens are single-use and expire automatically." },
              { icon: "📊", title: "One-click Exports",           desc: "Download your attendance register as PDF, Word, or CSV — audit-ready, with embedded signatures." },
              { icon: "🌐", title: "Virtual Meeting Support",     desc: "Manage attendance for Teams, Zoom, Google Meet, and custom conference links." },
              { icon: "🛡️", title: "Tamper-Evident Records",     desc: "Every signature is cryptographically hashed. Your records can withstand any audit." },
            ].map((f) => (
              <div key={f.title} style={{
                padding: "20px 22px",
                borderRadius: "var(--s-radius-lg)",
                border: "1px solid var(--s-border)",
                background: "var(--s-surface)",
              }}>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>{f.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "5px", color: "var(--s-text)" }}>{f.title}</div>
                <div style={{ fontSize: "12px", lineHeight: 1.65, color: "var(--s-text2)" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "72px 1.5rem", background: "var(--s-bg)", borderTop: "1px solid var(--s-border)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-accent)", letterSpacing: "0.08em", marginBottom: "10px" }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.8px", color: "var(--s-text)" }}>
              A meeting register in 3 steps.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px" }}>
            {[
              { n: "1", title: "Schedule the meeting",   desc: "Enter the meeting details, set your attendance rules, and choose virtual or physical. Done in under 2 minutes." },
              { n: "2", title: "Participants sign in",    desc: "Share the link or display the QR on screen. Participants sign with a digital signature — no app needed." },
              { n: "3", title: "Download your register", desc: "Export a complete, audit-ready attendance register with embedded signatures as PDF or DOCX." },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", gap: "16px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "var(--s-radius)",
                  background: "var(--s-accent)", color: "white", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--s-mono)", fontSize: "14px", fontWeight: 600,
                }}>
                  {step.n}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px", color: "var(--s-text)" }}>{step.title}</div>
                  <div style={{ fontSize: "12px", lineHeight: 1.65, color: "var(--s-text2)" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "72px 1.5rem", background: "var(--s-accent)" }}>
        <div style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: "16px" }}>
            YOUR WORKSPACE IS READY
          </div>
          <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.8px", color: "white", marginBottom: "12px" }}>
            Ready when you are.
          </h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "28px", lineHeight: 1.7 }}>
            Your organisation&apos;s attendance management system is live and waiting. Sign in to your workspace to get started.
          </p>
          <Link href="/sign-in" style={{
            background: "white", color: "var(--s-accent)",
            borderRadius: "var(--s-radius)", padding: "11px 28px",
            fontSize: "13px", fontWeight: 600, textDecoration: "none",
            display: "inline-block",
          }}>
            Sign in to your workspace →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--s-text)", padding: "28px 1.5rem" }}>
        <div style={{
          maxWidth: "860px", margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "5px", background: "var(--s-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 5.5l2.5 2.5 5.5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.2px" }}>AttendSync</span>
            <span style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.2)", marginLeft: "4px" }}>© 2026</span>
          </div>
          <nav style={{ display: "flex", gap: "18px" }}>
            {[
              { label: "Portal",       href: "/sign-in" },
              { label: "Features",     href: "#features" },
              { label: "How it works", href: "#how-it-works" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "rgba(255,255,255,0.28)", textDecoration: "none", letterSpacing: "0.04em" }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  )
}
