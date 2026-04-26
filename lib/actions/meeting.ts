"use server"

import { revalidatePath } from "next/cache"
import { meetingsApi } from "@/lib/api-client"
import { meetingSchema, type MeetingFormValues } from "@/lib/validators/meeting"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createMeeting(values: MeetingFormValues) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error("Unauthorized")

  const validatedFields = meetingSchema.parse(values)
  const user = session.user as any

  const { meeting } = await meetingsApi.create({
    title: validatedFields.title,
    description: validatedFields.description,
    type: validatedFields.type,
    platform: validatedFields.platform ?? "NONE",
    originalLink: validatedFields.meetingLink || undefined,
    sessionType: validatedFields.sessionType,
    startDatetime: validatedFields.startDatetime.toISOString(),
    endDatetime: validatedFields.endDatetime.toISOString(),
    venueName: validatedFields.venueName,
    venueLat: validatedFields.venueLat,
    venueLng: validatedFields.venueLng,
    geoFenceRadiusM: validatedFields.geoFenceRadiusM,
    attendanceThresholdMinutes: validatedFields.attendanceThresholdMinutes,
    staffIdGateEnabled: validatedFields.staffIdGateEnabled,
    creatorId: user.id,
    orgId: user.orgId,
    days: validatedFields.days?.map((d) => ({
      dayNumber: d.dayNumber,
      label: d.label ?? undefined,
      date: d.date.toISOString(),
    })),
  })

  revalidatePath("/meetings")
  return { id: meeting.id }
}
