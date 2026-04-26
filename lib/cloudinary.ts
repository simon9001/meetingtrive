import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadToCloudinary(
  dataUrl: string,
  folder: "signatures" | "logos" | "avatars" = "signatures"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: `attendsync/${folder}`,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export { cloudinary }

//this is critical my g

