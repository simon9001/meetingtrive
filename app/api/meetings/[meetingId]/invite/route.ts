import { NextRequest, NextResponse } from "next/server"

import { BACKEND_URL } from "@/lib/config"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params
  const body = await req.json()

  const res = await fetch(`${BACKEND_URL}/api/meetings/${meetingId}/invite`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body:    JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
