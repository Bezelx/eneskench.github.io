import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://b4f1cc60e4f2f6c8cfc24588ffdffeb9.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = "media"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadDetails = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`
        const putCommand = new PutObjectCommand({
          Bucket: BUCKET,
          Key: fileName,
          ContentType: file.type,
        })

        const signedUrl = await getSignedUrl(s3, putCommand, { expiresIn: 3600 })

        return {
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: file.type.startsWith("image/") ? "image" : "video",
          size: file.size,
          uploadUrl: signedUrl,
          key: fileName,
        }
      })
    )

    return NextResponse.json({ files: uploadDetails })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
