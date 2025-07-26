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
