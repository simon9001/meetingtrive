import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

import { BACKEND_URL } from "@/lib/config"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { orgId } = await params

  // Admins may only fetch their own org
  const sessionOrgId = (session.user as any).orgId
  if (sessionOrgId !== orgId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const res = await fetch(`${BACKEND_URL}/api/organisations/${orgId}/users`, {
    headers: { "X-API-Key": API_KEY },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
