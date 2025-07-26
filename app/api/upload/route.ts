import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      const blob = await put(file.name, file, {
        access: "public",
      })

      return {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for display
        type: file.type.startsWith("image/") ? "image" : "video",
        url: blob.url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Current User", // In a real app, get from auth
        tags: [],
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
