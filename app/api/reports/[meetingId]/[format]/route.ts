import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

const ALLOWED_FORMATS = new Set(["pdf", "docx", "csv"])

const CONTENT_TYPES: Record<string, string> = {
  pdf:  "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  csv:  "text/csv",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ meetingId: string; format: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { meetingId, format } = await params

  if (!ALLOWED_FORMATS.has(format)) {
    return NextResponse.json({ error: "Invalid format." }, { status: 400 })
  }

  const upstream = await fetch(
    `${BACKEND_URL}/api/reports/${encodeURIComponent(meetingId)}/${format}`,
    { headers: { "X-API-Key": API_KEY } }
  )

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => ({ error: "Failed to generate report." }))
    return NextResponse.json(body, { status: upstream.status })
  }

  const buffer = await upstream.arrayBuffer()

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":        CONTENT_TYPES[format],
      "Content-Disposition": upstream.headers.get("Content-Disposition") ??
        `attachment; filename="report.${format}"`,
    },
  })
}
