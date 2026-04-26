import { meetingsApi } from "@/lib/api-client"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { QRDisplay } from "./qr-display"

export default async function QRPage({
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

  if (!meeting || !meeting.qrToken) notFound()

  const headersList = await headers()
  const host = headersList.get("host") ?? "localhost:3000"
  const proto = headersList.get("x-forwarded-proto") ?? "http"
  const qrUrl = `${proto}://${host}/physical-sign-in/${meeting.id}/${meeting.qrToken}`

  return (
    <QRDisplay
      meeting={meeting as any}
      qrUrl={qrUrl}
      expiresAt={meeting.qrTokenExpiresAt ?? null}
    />
  )
}
