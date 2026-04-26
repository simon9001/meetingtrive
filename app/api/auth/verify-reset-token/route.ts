const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")
  if (!token) return Response.json({ error: "Token is required." }, { status: 400 })

  const res = await fetch(`${BACKEND_URL}/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
    headers: { "X-API-Key": API_KEY },
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
