import { redirect } from "next/navigation"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const res = await fetch(`${BACKEND_URL}/api/meetings/proxy/${token}`, {
    headers: {
      "user-agent": request.headers.get("user-agent") ?? "",
      "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
    },
  })

  if (!res.ok) {
    return new Response("Meeting not found", { status: 404 })
  }

  const { originalLink } = await res.json() as { originalLink: string }
  redirect(originalLink)
}
