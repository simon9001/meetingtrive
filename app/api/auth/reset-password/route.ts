const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY     = process.env.INTERNAL_API_KEY ?? ""

export async function POST(req: Request) {
  const body = await req.json()

  const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
    method:  "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  return Response.json(data, { status: res.status })
}
