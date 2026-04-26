import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

import { BACKEND_URL } from "@/lib/config"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const res = await fetch(`${BACKEND_URL}/api/physical/meetings/${id}/qr`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
