import { NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(req: Request) {
  try {
    const { data, folder } = await req.json() as { data: string; folder?: "signatures" | "logos" | "avatars" }
    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 })
    const result = await uploadToCloudinary(data, folder ?? "signatures")
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
