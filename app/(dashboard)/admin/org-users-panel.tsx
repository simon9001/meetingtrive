"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrgUser {
  id:          string
  staffId:     string | null
  fullName:    string
  email:       string
  designation: string | null
  department:  string | null
  role:        string
  isActive:    boolean
  status:      "active" | "pending" | "suspended"
  createdAt:   string
}

interface Props { orgId: string; initialUsers?: OrgUser[] }

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", height: "36px", padding: "0 10px",
  border: "1px solid var(--s-border2)", borderRadius: "var(--s-radius)",
  background: "var(--s-surface)", color: "var(--s-text)", fontSize: "13px",
  outline: "none", boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontSize: "11px", color: "var(--s-text2)", marginBottom: "4px", display: "block",
}

const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", ATTENDEE: "Attendee", COORDINATOR: "Coordinator" }

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "s-badge-green" },
  pending:   { label: "Pending",   cls: "s-badge-gray"  },
  suspended: { label: "Suspended", cls: "s-badge-amber" },
}

// ─── Tiny SVG icons ───────────────────────────────────────────────────────────

const IconEdit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconPause   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
const IconPlay    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
const IconMail    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
const IconKey     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
const IconTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconSpinner = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>

function ActionBtn({
  onClick, title, color = "var(--s-text2)", loading = false, children,
}: {
  onClick: () => void; title: string; color?: string; loading?: boolean; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      style={{
        background: "none", border: "1px solid var(--s-border2)", borderRadius: "6px",
        padding: "4px 6px", cursor: loading ? "default" : "pointer",
        color: loading ? "var(--s-text3)" : color,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.1s, border-color 0.1s",
      }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--s-surface2)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none" }}
    >
      {loading ? <IconSpinner /> : children}
    </button>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function OrgUsersPanel({ orgId, initialUsers }: Props) {
  const [users,     setUsers]    = useState<OrgUser[]>(initialUsers ?? [])
  const [loading,   setLoading]  = useState(!initialUsers)
  const [showForm,  setShowForm] = useState(false)
  const [filter,    setFilter]   = useState("")

  // Per-row states
  const [editingUser,   setEditingUser]   = useState<OrgUser | null>(null)
  const [deletingId,    setDeletingId]    = useState<string | null>(null)
  const [busyId,        setBusyId]        = useState<string | null>(null)
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/organisations/${orgId}/users`)
      const data = await res.json() as { users: OrgUser[] }
      setUsers(data.users ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [orgId])

  // Skip initial fetch if server already provided the data
  useEffect(() => {
    if (initialUsers !== undefined) return
    fetchUsers()
  }, [fetchUsers]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter(u => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return (
      u.fullName.toLowerCase().includes(q)    ||
      u.email.toLowerCase().includes(q)       ||
      (u.staffId?.toLowerCase().includes(q) ?? false) ||
      (u.designation?.toLowerCase().includes(q) ?? false)
    )
  })

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSuspendToggle = async (u: OrgUser) => {
    setBusyId(u.id)
    try {
      const res  = await fetch(`/api/staff/${u.id}/suspend`, { method: "PATCH" })
      const data = await res.json() as { status?: string; error?: string }
      if (!res.ok) { showToast(data.error ?? "Action failed.", false); return }
      showToast(data.status === "active" ? `${u.fullName} re-activated.` : `${u.fullName} suspended.`)
      fetchUsers()
    } catch { showToast("Network error.", false) }
    finally  { setBusyId(null) }
  }

  const handleResendInvite = async (u: OrgUser) => {
    setBusyId(u.id)
    try {
      const res  = await fetch(`/api/staff/${u.id}/resend-invite`, { method: "POST" })
      const data = await res.json() as { error?: string }
      if (!res.ok) { showToast(data.error ?? "Failed to resend.", false); return }
      showToast(`Invitation re-sent to ${u.email}.`)
    } catch { showToast("Network error.", false) }
    finally  { setBusyId(null) }
  }

  const handleResetPassword = async (u: OrgUser) => {
    setBusyId(u.id)
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: u.email }),
      })
      if (!res.ok) { showToast("Failed to send reset email.", false); return }
      showToast(`Password reset email sent to ${u.email}.`)
    } catch { showToast("Network error.", false) }
    finally  { setBusyId(null) }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      const res  = await fetch(`/api/staff/${id}`, { method: "DELETE" })
      const data = await res.json() as { error?: string }
      if (!res.ok) { showToast(data.error ?? "Delete failed.", false); return }
      showToast("User removed.")
      setDeletingId(null)
      fetchUsers()
    } catch { showToast("Network error.", false) }
    finally  { setBusyId(null) }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{
      background: "var(--s-surface)",
      border: "1px solid var(--s-border)",
      borderRadius: "var(--s-radius-lg)",
      padding: "16px 20px",
      position: "relative",
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          padding: "10px 16px", borderRadius: "var(--s-radius)",
          background: toast.ok ? "#1E4A3D" : "#C8522A", color: "white",
          fontSize: "13px", fontWeight: 500,
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          animation: "fadeIn 0.15s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--s-text)" }}>Users</span>
          <span className="s-badge s-badge-gray">{users.length}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search users…"
            style={{ ...inputStyle, width: "200px" }}
          />
          <button
            className="s-btn s-btn-primary s-btn-sm"
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {/* Add-user form */}
      {showForm && (
        <AddUserForm orgId={orgId} onCreated={() => { setShowForm(false); fetchUsers() }} />
      )}

      {/* Edit modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); fetchUsers(); showToast("User updated.") }}
          onError={(msg) => showToast(msg, false)}
        />
      )}

      {/* Users table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", gap: "10px", alignItems: "center" }}>
          <span className="loading loading-spinner loading-md" style={{ color: "var(--s-accent)" }} />
          <span style={{ fontSize: "13px", color: "var(--s-text3)" }}>Loading users…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--s-text3)", fontSize: "13px" }}>
          {filter ? "No users match your search." : "No users yet. Add the first one above."}
        </div>
      ) : (
        <div className="s-table-wrap">
          <table className="s-table users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Staff ID</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isBusy    = busyId === u.id
                const isDeleting = deletingId === u.id
                const badge     = STATUS_BADGE[u.status] ?? STATUS_BADGE.active

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: "13px", color: "var(--s-text)" }}>{u.fullName}</div>
                      {u.department && (
                        <div style={{ fontSize: "11px", color: "var(--s-text3)", marginTop: "1px" }}>{u.department}</div>
                      )}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--s-text2)" }}>{u.email}</td>
                    <td style={{ fontFamily: "var(--s-mono)", fontSize: "12px", color: "var(--s-text3)" }}>
                      {u.staffId ?? "—"}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--s-text2)" }}>{u.designation ?? "—"}</td>
                    <td>
                      <span className={`s-badge ${u.role === "ADMIN" ? "s-badge-amber" : "s-badge-blue"}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`s-badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td style={{ fontFamily: "var(--s-mono)", fontSize: "11px", color: "var(--s-text3)", whiteSpace: "nowrap" }}>
                      {format(new Date(u.createdAt), "dd MMM yyyy")}
                    </td>
                    <td>
                      {isDeleting ? (
                        /* Delete confirmation inline */
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "11px", color: "var(--s-accent2)", fontWeight: 500 }}>Delete?</span>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={isBusy}
                            style={{
                              padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                              background: "#C8522A", color: "white", border: "none",
                              borderRadius: "5px", cursor: "pointer",
                            }}
                          >
                            {isBusy ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            disabled={isBusy}
                            style={{
                              padding: "3px 8px", fontSize: "11px",
                              background: "var(--s-surface2)", color: "var(--s-text)", border: "1px solid var(--s-border2)",
                              borderRadius: "5px", cursor: "pointer",
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                          {/* Edit */}
                          <ActionBtn onClick={() => setEditingUser(u)} title="Edit user" loading={isBusy}>
                            <IconEdit />
                          </ActionBtn>

                          {/* Suspend / Activate — only for non-pending users */}
                          {u.status !== "pending" && (
                            <ActionBtn
                              onClick={() => handleSuspendToggle(u)}
                              title={u.status === "active" ? "Suspend user" : "Re-activate user"}
                              color={u.status === "active" ? "var(--s-text2)" : "#1E4A3D"}
                              loading={isBusy}
                            >
                              {u.status === "active" ? <IconPause /> : <IconPlay />}
                            </ActionBtn>
                          )}

                          {/* Resend invite — only for pending users */}
                          {u.status === "pending" && (
                            <ActionBtn
                              onClick={() => handleResendInvite(u)}
                              title="Resend invitation email"
                              color="#1E4A3D"
                              loading={isBusy}
                            >
                              <IconMail />
                            </ActionBtn>
                          )}

                          {/* Reset password — for active or suspended (has completed invite) */}
                          {u.status !== "pending" && (
                            <ActionBtn
                              onClick={() => handleResetPassword(u)}
                              title="Send password reset email"
                              loading={isBusy}
                            >
                              <IconKey />
                            </ActionBtn>
                          )}

                          {/* Delete */}
                          <ActionBtn
                            onClick={() => setDeletingId(u.id)}
                            title="Delete user"
                            color="#C8522A"
                            loading={isBusy}
                          >
                            <IconTrash />
                          </ActionBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Add-user inline form ─────────────────────────────────────────────────────

function AddUserForm({ orgId: _orgId, onCreated }: { orgId: string; onCreated: () => void }) {
  const [form,   setForm]   = useState({ staffId: "", fullName: "", email: "", designation: "", department: "", role: "ATTENDEE" })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staffId || !form.fullName || !form.email) { setError("Staff ID, full name and email are required."); return }
    setSaving(true); setError("")
    try {
      const res  = await fetch("/api/staff", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? "Failed to create user."); return }
      onCreated()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: "20px", padding: "16px", background: "var(--s-surface2)", borderRadius: "var(--s-radius)", border: "1px solid var(--s-border)" }}>
      <div style={{ fontFamily: "var(--s-mono)", fontSize: "10px", color: "var(--s-text3)", letterSpacing: "0.08em", marginBottom: "14px" }}>
        NEW USER — an invitation email will be sent automatically
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: "10px" }}>
        {[
          { label: "Staff ID *",    field: "staffId",     placeholder: "EMP-001" },
          { label: "Full Name *",   field: "fullName",    placeholder: "Jane Doe" },
          { label: "Email *",       field: "email",       placeholder: "jane@org.com", type: "email" },
          { label: "Designation",   field: "designation", placeholder: "e.g. Engineer" },
          { label: "Department",    field: "department",  placeholder: "e.g. ICT" },
        ].map(({ label, field, placeholder, type }) => (
          <div key={field}>
            <div style={labelStyle}>{label}</div>
            <input value={(form as any)[field]} onChange={set(field)} placeholder={placeholder} type={type ?? "text"} style={inputStyle} disabled={saving} />
          </div>
        ))}
        <div>
          <div style={labelStyle}>Role</div>
          <select value={form.role} onChange={set("role")} style={{ ...inputStyle }} disabled={saving}>
            <option value="ATTENDEE">Attendee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      {error && <div style={{ fontSize: "12px", color: "var(--s-accent2)", marginBottom: "10px" }}>{error}</div>}
      <button type="submit" className="s-btn s-btn-primary s-btn-sm" disabled={saving}>
        {saving ? <><span className="loading loading-spinner loading-xs" /> Creating…</> : "Create User & Send Invite"}
      </button>
    </form>
  )
}

// ─── Edit-user modal ──────────────────────────────────────────────────────────

function EditUserModal({
  user, onClose, onSaved, onError,
}: {
  user: OrgUser
  onClose: () => void
  onSaved: () => void
  onError: (msg: string) => void
}) {
  const [form,   setForm]   = useState({
    fullName:    user.fullName,
    staffId:     user.staffId    ?? "",
    designation: user.designation ?? "",
    department:  user.department  ?? "",
    role:        user.role,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName) { setError("Full name is required."); return }
    setSaving(true); setError("")
    try {
      const res  = await fetch(`/api/staff/${user.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName:    form.fullName    || undefined,
          staffId:     form.staffId     || undefined,
          designation: form.designation || null,
          department:  form.department  || null,
          role:        form.role,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? "Update failed."); return }
      onSaved()
    } catch {
      onError("Network error.")
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Overlay */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
    >
      <div style={{
        background: "var(--s-surface)", borderRadius: "var(--s-radius-lg)",
        border: "1px solid var(--s-border)", padding: "24px",
        width: "100%", maxWidth: "520px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--s-text)" }}>Edit User</div>
            <div style={{ fontSize: "11px", color: "var(--s-text3)", marginTop: "2px" }}>{user.email}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--s-text3)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.fullName} onChange={set("fullName")} style={inputStyle} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Staff ID</label>
              <input value={form.staffId} onChange={set("staffId")} placeholder="EMP-001" style={inputStyle} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role} onChange={set("role")} style={{ ...inputStyle }} disabled={saving}>
                <option value="ATTENDEE">Attendee</option>
                <option value="COORDINATOR">Coordinator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Designation</label>
              <input value={form.designation} onChange={set("designation")} placeholder="e.g. Engineer" style={inputStyle} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input value={form.department} onChange={set("department")} placeholder="e.g. ICT" style={inputStyle} disabled={saving} />
            </div>
          </div>

          {/* Email (read-only — changing email requires separate flow) */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email (read-only)</label>
            <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
          </div>

          {error && <div style={{ fontSize: "12px", color: "var(--s-accent2)", marginBottom: "12px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="s-btn s-btn-sm" style={{ background: "var(--s-surface2)" }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="s-btn s-btn-primary s-btn-sm" disabled={saving}>
              {saving ? <><span className="loading loading-spinner loading-xs" /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
