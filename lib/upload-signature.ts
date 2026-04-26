export async function uploadSignatureToCloudinary(dataUrl: string): Promise<string> {
  const res = await fetch("/api/cloudinary/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: dataUrl, folder: "signatures" }),
  })
  if (!res.ok) throw new Error("Signature upload failed")
  const { url } = await res.json() as { url: string }
  return url
}
