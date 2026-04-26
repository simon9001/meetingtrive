// ─── Domain types shared across the frontend ─────────────────────────────────
// Keep in sync with lib/api-client.ts type exports.

export type {
  Meeting,
  MeetingDetail,
  MeetingDay,
  Participant,
  SignInParticipant,
  StaffRecord,
  CreateMeetingPayload,
} from "@/lib/api-client"

// ─── Session extension ────────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  role: "ADMIN" | "COORDINATOR" | "ATTENDEE"
  orgId: string
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type MeetingStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "CLOSED"
export type MeetingType = "VIRTUAL" | "PHYSICAL"
export type SessionType = "SINGLE" | "MULTI_DAY"
export type Platform = "TEAMS" | "MEET" | "ZOOM" | "CUSTOM" | "NONE"
