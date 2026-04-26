const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

async function apiFetch<T>(
  path: string,
  opts: RequestInit & { apiKey?: boolean } = {}
): Promise<T> {
  const { apiKey = true, ...init } = opts
  const isServer = typeof window === "undefined"
  
  // If we are on the server, we can call the backend directly with the internal API key
  if (isServer) {
    const headers = new Headers(init.headers)
    headers.set("Content-Type", "application/json")
    if (apiKey) headers.set("X-API-Key", API_KEY)
    
    const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
      throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  } 
  
  // If we are on the client and need an API key, we must proxy through our local API
  if (apiKey) {
    const res = await fetch(`${path}`, { ...init })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
      throw new Error(body?.error ?? `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  }

  // Client-side public requests (like sign-in portal)
  const res = await fetch(`${BACKEND_URL}${path}`, { ...init })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
    throw new Error(body?.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const meetingsApi = {
  list: (orgId: string, creatorId?: string) =>
    apiFetch<{ meetings: Meeting[] }>(
      `/api/meetings?orgId=${orgId}${creatorId ? `&creatorId=${creatorId}` : ""}`
    ),

  my: (orgId: string, userId: string) =>
    apiFetch<{ meetings: Meeting[] }>(`/api/meetings/my?orgId=${orgId}&userId=${userId}`),

  get: (id: string) => apiFetch<{ meeting: MeetingDetail }>(`/api/meetings/${id}`),

  create: (payload: CreateMeetingPayload) =>
    apiFetch<{ meeting: Meeting }>("/api/meetings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  setStatus: (id: string, status: string) =>
    apiFetch<{ meeting: Meeting }>(`/api/meetings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  end: (id: string) =>
    apiFetch<{ success: boolean; notificationsSent: number }>(`/api/meetings/${id}/end`, {
      method: "POST",
    }),

  addParticipant: (
    meetingId: string,
    payload: {
      userId?: string
      guestName?: string
      guestDesignation?: string
      guestDepartment?: string
      meetingDayId?: string
      thresholdMet?: boolean
    }
  ) =>
    apiFetch<{ participant: Participant; signInToken: string }>(
      `/api/meetings/${meetingId}/participants/add`,
      { method: "POST", body: JSON.stringify(payload) }
    ),

  resendLinks: (id: string) =>
    fetch(`/api/internal/meetings/${id}/resend-links`, { method: "POST" }).then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json() as Promise<{ success: boolean; notificationsSent: number }>
    }),
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export const attendanceApi = {
  pending: (userId: string) =>
    apiFetch<{ pending: PendingSignature[] }>(`/api/pending?userId=${userId}`),
}

// ─── Physical / QR ────────────────────────────────────────────────────────────

export const physicalApi = {
  generateQR: (meetingId: string, venueLat: number, venueLng: number) =>
    apiFetch<{ qrToken: string; qrDataUrl: string; expiresAt: string; signInUrl: string }>(
      `/api/physical/meetings/${meetingId}/qr`,
      { method: "POST", body: JSON.stringify({ venueLat, venueLng }) }
    ),

  validateQR: (meetingId: string, qrToken: string, lat: number, lng: number) =>
    apiFetch<{
      valid: boolean
      meetingTitle: string
      venueName?: string
      organisationName: string
      staffIdGateEnabled: boolean
      geoFenceRadiusM: number
    }>(`/api/physical/${meetingId}/${qrToken}?lat=${lat}&lng=${lng}`, { apiKey: false }),

  submitSignature: (
    meetingId: string,
    qrToken: string,
    payload: {
      qrToken: string
      signatureDataUrl: string
      attendeeLat: number
      attendeeLng: number
      saveToLibrary?: boolean
      deviceFingerprint?: string
      staffId?: string
      guestName?: string
      guestDesignation?: string
      guestDepartment?: string
    }
  ) =>
    apiFetch<{ success: boolean; participantId: string; signedAt: string; signatureHash: string }>(
      `/api/physical/${meetingId}/${qrToken}/submit`,
      { method: "POST", body: JSON.stringify(payload), apiKey: false }
    ),
}

// ─── Sign-in portal ───────────────────────────────────────────────────────────

export const signInApi = {
  getParticipant: (token: string) =>
    apiFetch<{ participant: SignInParticipant }>(`/api/sign-in/${token}`, { apiKey: false }),

  verifyStaff: (token: string, staffId: string) =>
    apiFetch<{
      verified: boolean
      profile: {
        fullName: string
        designation: string
        department: string
        email: string
        signatureLibrary: string[]
      } | null
    }>(`/api/sign-in/${token}/verify-staff`, {
      method: "POST",
      body: JSON.stringify({ staffId }),
      apiKey: false,
    }),

  submit: (
    token: string,
    payload: {
      signatureDataUrl: string
      saveToLibrary?: boolean
      deviceFingerprint?: string
      fullName?: string
      designation?: string
      department?: string
    }
  ) =>
    apiFetch<{ success: boolean; signedAt: string; signatureHash: string }>(
      `/api/sign-in/${token}/submit`,
      { method: "POST", body: JSON.stringify(payload), apiKey: false }
    ),
}

// ─── Staff directory ──────────────────────────────────────────────────────────

export const staffApi = {
  lookupById: (orgId: string, staffId: string) =>
    apiFetch<{ staff: StaffRecord }>(`/api/staff/lookup?orgId=${orgId}&staffId=${staffId}`, {
      apiKey: false,
    }),

  search: (orgId: string, q: string) =>
    apiFetch<{ results: StaffRecord[] }>(`/api/staff/lookup?orgId=${orgId}&q=${encodeURIComponent(q)}`, {
      apiKey: false,
    }),

  me: (userId: string) =>
    apiFetch<{ profile: UserProfile }>(`/api/staff/me?userId=${userId}`),

  updateMe: (userId: string, data: Partial<UserProfile>) =>
    apiFetch<{ profile: UserProfile }>(`/api/staff/me?userId=${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsApi = {
  downloadPDF:  (meetingId: string) => `/api/reports/${meetingId}/pdf`,
  downloadDOCX: (meetingId: string) => `/api/reports/${meetingId}/docx`,
  downloadCSV:  (meetingId: string) => `/api/reports/${meetingId}/csv`,
}

// ─── Invite ───────────────────────────────────────────────────────────────────

export const inviteApi = {
  send: (
    meetingId: string,
    participants: InviteParticipant[]
  ) =>
    fetch(`/api/meetings/${meetingId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants }),
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      return r.json() as Promise<{ invited: { email: string; sent: boolean; error?: string }[] }>
    }),
}

// ─── Email templates ──────────────────────────────────────────────────────────

export const emailTemplateApi = {
  get: (orgId: string) =>
    fetch(`/api/email-templates/${orgId}`, { method: "GET" }).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<{ subjectTemplate: string; htmlTemplate: string; isCustom: boolean }>
    }),

  save: (orgId: string, data: { subjectTemplate: string; htmlTemplate: string }) =>
    fetch(`/api/email-templates/${orgId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `HTTP ${r.status}`)
      return r.json() as Promise<{ success: boolean }>
    }),

  reset: (orgId: string) =>
    fetch(`/api/email-templates/${orgId}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<{ success: boolean }>
    }),
}

// ─── Organisations ────────────────────────────────────────────────────────────

export const organisationsApi = {
  list: () => apiFetch<{ organisations: Organisation[] }>("/api/organisations"),
  get: (id: string) => apiFetch<{ organisation: OrganisationDetail }>(`/api/organisations/${id}`),
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Organisation {
  id: string
  name: string
  logoUrl?: string
  retentionDays: number
  createdAt: string
  _count?: { users: number; meetings: number }
}

export interface OrganisationDetail extends Organisation {
  _count: { users: number; meetings: number }
}

export interface Meeting {
  id: string
  title: string
  description?: string
  type: "VIRTUAL" | "PHYSICAL"
  platform: string
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CLOSED"
  sessionType: "SINGLE" | "MULTI_DAY"
  startDatetime: string
  endDatetime: string
  venueName?: string
  proxyLink?: string
  qrToken?: string
  qrTokenExpiresAt?: string
  staffIdGateEnabled: boolean
  attendanceThresholdMinutes: number
  geoFenceRadiusM: number
  _count?: { participants: number }
  creator?: { fullName?: string; email?: string }
  days?: MeetingDay[]
}

export interface MeetingDetail extends Meeting {
  organisation: { id: string; name: string; logoUrl?: string }
  participants: Participant[]
}

export interface MeetingDay {
  id: string
  dayNumber: number
  label?: string
  date: string
}

export interface Participant {
  id: string
  meetingId: string
  meetingDayId?: string
  userId?: string
  guestName?: string
  guestDesignation?: string
  thresholdMet: boolean
  signedAt?: string
  signatureImageUrl?: string
  signatureHash?: string
  ipAddress?: string
  gpsLat?: number
  gpsLng?: number
  verifiedInGeofence: boolean
  user?: { fullName?: string; designation?: string; department?: string; staffId?: string }
  meetingDay?: MeetingDay
}

export interface SignInParticipant {
  id: string
  staffIdGateEnabled: boolean
  meetingTitle: string
  meetingType: string
  dayLabel?: string
  organisationName: string
  orgLogoUrl?: string
  prefillName?: string
  prefillDesignation?: string
  prefillDepartment?: string
  prefillEmail?: string
  signatureLibrary: string[]
  expiresAt?: string
}

export interface StaffRecord {
  id: string
  staffId: string
  fullName: string
  designation: string
  department: string
  email: string
}

export interface InviteParticipant {
  userId?: string
  email: string
  name: string
  designation?: string
  department?: string
  meetingDayId?: string
}

export interface CreateMeetingPayload {
  title: string
  description?: string
  type: "VIRTUAL" | "PHYSICAL"
  platform: string
  originalLink?: string
  sessionType: "SINGLE" | "MULTI_DAY"
  startDatetime: string
  endDatetime: string
  venueName?: string
  venueLat?: number
  venueLng?: number
  geoFenceRadiusM: number
  attendanceThresholdMinutes: number
  staffIdGateEnabled: boolean
  creatorId: string
  orgId: string
  days?: { dayNumber: number; label?: string; date: string }[]
}

export interface PendingSignature {
  id: string
  meetingId: string
  meetingTitle: string
  meetingDate: string
  meetingType: string
  signInToken: string
  expiresAt?: string
}

export interface UserProfile {
  id: string
  orgId: string
  staffId?: string
  fullName: string
  designation?: string
  department?: string
  email: string
  image?: string
  role: string
  signatureLibrary: string[]
}

export const authApi = {
  verifyInvite: (token: string) =>
    apiFetch<{ email: string; name: string }>(`/api/auth/verify-invite?token=${token}`, { apiKey: true }),

  completeInvite: (payload: { token: string; password: string }) =>
    apiFetch<{ success: boolean }>("/api/auth/complete-invite", {
      method: "POST",
      body: JSON.stringify(payload),
      apiKey: true,
    }),
}
