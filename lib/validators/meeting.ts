import * as z from "zod"

export const meetingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  type: z.enum(["VIRTUAL", "PHYSICAL"]),
  platform: z.enum(["TEAMS", "MEET", "ZOOM", "CUSTOM", "NONE"]),
  meetingLink: z.string().url("Invalid meeting link").optional().or(z.literal("")),
  sessionType: z.enum(["SINGLE", "MULTI_DAY"]),
  startDatetime: z.date(),
  endDatetime: z.date(),
  venueName: z.string().optional(),
  venueLat: z.number().optional(),
  venueLng: z.number().optional(),
  geoFenceRadiusM: z.number(),
  attendanceThresholdMinutes: z.number(),
  staffIdGateEnabled: z.boolean(),
  days: z
    .array(
      z.object({
        dayNumber: z.number(),
        label: z.string().optional(),
        date: z.date(),
      })
    )
    .optional(),
})

export type MeetingFormValues = z.input<typeof meetingSchema>
