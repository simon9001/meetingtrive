import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
const API_KEY = process.env.INTERNAL_API_KEY ?? ""

async function proxy(method: string, orgId: string, body?: unknown) {
  const res = await fetch(`${BACKEND}/api/email-templates/${orgId}`, {
    method,
    headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  return proxy("GET", orgId)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  return proxy("PUT", orgId, await req.json())
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  return proxy("DELETE", orgId)
}
