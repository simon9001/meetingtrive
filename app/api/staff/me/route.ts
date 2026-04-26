import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

import { BACKEND_URL } from "@/lib/config"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

  const res = await fetch(`${BACKEND_URL}/api/staff/me?userId=${userId}`, {
    method: "GET",
    headers: { "X-API-Key": API_KEY },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

  const body = await req.json()

  const res = await fetch(`${BACKEND_URL}/api/staff/me?userId=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
