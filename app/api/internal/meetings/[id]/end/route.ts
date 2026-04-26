import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${BACKEND_URL}/api/meetings/${id}/end`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
  })

  const data = await res.json()
  return Response.json(data, { status: res.status })
}
