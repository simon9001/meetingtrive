import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  if ((session.user as any).role !== "ADMIN") return null
  return session
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body   = await req.json()

  const res = await fetch(`${BACKEND_URL}/api/staff/${id}`, {
    method:  "PUT",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${BACKEND_URL}/api/staff/${id}`, {
    method:  "DELETE",
    headers: { "X-API-Key": API_KEY },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
