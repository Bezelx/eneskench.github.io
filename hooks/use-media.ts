"use client"

import { useState, useEffect } from "react"

interface MediaItem {
  id: string
  name: string
  type: "image" | "video"
  url: string
  size: number
  uploadedAt: string
  uploadedBy: string
  tags: string[]
}

export function useMedia() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media")
      const data = await response.json()
      setMedia(data.media)
    } catch (error) {
      console.error("Failed to fetch media:", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadFiles = async (files: File[]) => {
    try {
      // Step 1: Ask backend for presigned URLs
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const { files: presigned } = await res.json()

      // Step 2: Upload directly to R2
      await Promise.all(
        presigned.map(async (file, index) => {
          await fetch(file.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: files[index],
          })
          file.originalFile = files[index] // Attach original file if needed
        })
      )

      // Step 3: Save metadata to DB
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: presigned }),
      })

      await fetchMedia()
      return presigned
    } catch (error) {
      console.error("Upload failed:", error)
      throw error
    }
    
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.files) {
        // Save to media store
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: data.files }),
        })

        // Refresh media list
        await fetchMedia()
        return data.files
      }
    } catch (error) {
      console.error("Upload failed:", error)
      throw error
    }
  }

  const deleteMedia = async (ids: string[]) => {
    try {
      await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })

      await fetchMedia()
    } catch (error) {
      console.error("Delete failed:", error)
      throw error
    }
  }

  const updateTags = async (mediaId: string, tags: string[]) => {
    try {
      await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, tags }),
      })

      // Refresh media list
      await fetchMedia()
    } catch (error) {
      console.error("Tag update failed:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  return {
    media,
    loading,
    uploadFiles,
    deleteMedia,
    updateTags,
    refetch: fetchMedia,
  }
}
