import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

import { BACKEND_URL } from "@/lib/config"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const res = await fetch(`${BACKEND_URL}/api/staff/${id}/suspend`, {
    method:  "PATCH",
    headers: { "X-API-Key": API_KEY },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
