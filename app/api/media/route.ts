import { NextResponse } from "next/server"

// Start with empty store - only show uploaded media
let mediaStore: any[] = []

export async function GET() {
  // Sort by upload date (most recent first)
  const sortedMedia = [...mediaStore].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  )
  return NextResponse.json({ media: sortedMedia })
}

export async function POST(request: Request) {
  const { files } = await request.json()

  // Add new files to the beginning of the array (most recent first)
  mediaStore.unshift(...files)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const { ids } = await request.json()
  mediaStore = mediaStore.filter((item) => !ids.includes(item.id))
  return NextResponse.json({ success: true })
}

export async function PUT(request: Request) {
  const { mediaId, tags } = await request.json()

  // Find and update the media item with new tags
  const mediaIndex = mediaStore.findIndex((item) => item.id === mediaId)
  if (mediaIndex !== -1) {
    mediaStore[mediaIndex] = {
      ...mediaStore[mediaIndex],
      tags: tags,
    }
  }

  return NextResponse.json({ success: true })
}
