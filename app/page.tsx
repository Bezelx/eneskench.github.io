"use client"

import { useState } from "react"
import { Search, Upload, ExternalLink, Download, Tag, X, Camera, Video, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { UploadProgress } from "@/components/upload-progress"
import { useMedia } from "@/hooks/use-media"
import Link from "next/link"
import { TaggingModal } from "@/components/tagging-modal"

const quickAccessUsers = [
  { id: "bas", name: "Bas", initials: "BA" },
  { id: "sha", name: "Sha", initials: "SH" },
  { id: "nate", name: "Nate", initials: "NA" },
  { id: "simon", name: "Simon", initials: "SI" },
  { id: "felaw", name: "Felaw", initials: "FE" },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedMedia, setExpandedMedia] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState<{ name: string; progress: number }[]>([])
  const [taggingMedia, setTaggingMedia] = useState<any>(null)
  const { media, loading, uploadFiles, updateTags } = useMedia()
  const { toast } = useToast()

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length === 0) return

      // Initialize progress tracking
      const progressFiles = files.map((file) => ({ name: file.name, progress: 0 }))
      setUploadProgress(progressFiles)

      try {
        // Simulate progress (in real implementation, you'd track actual upload progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev.map((file) => ({
              ...file,
              progress: Math.min(file.progress + Math.random() * 30, 95),
            })),
          )
        }, 500)

        await uploadFiles(files)

        clearInterval(progressInterval)
        setUploadProgress((prev) => prev.map((file) => ({ ...file, progress: 100 })))

        setTimeout(() => {
          setUploadProgress([])
          toast({
            title: "Upload successful",
            description: `${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully`,
          })
        }, 1000)
      } catch (error) {
        setUploadProgress([])
        toast({
          title: "Upload failed",
          description: "There was an error uploading your files",
          variant: "destructive",
        })
      }
    }
    input.click()
  }

  const handleMediaClick = (mediaItem: any) => {
    setExpandedMedia(mediaItem)
  }

  const handleDownload = async (mediaItem: any) => {
    try {
      const response = await fetch(mediaItem.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = mediaItem.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      })
    }
  }

  const filteredMedia = media.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        quickAccessUsers
          .find((user) => user.id === tag)
          ?.name.toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
  )

  // Show only the 3 most recent items on home page
  const recentMedia = filteredMedia.slice(0, 3)

  const handleTagsUpdate = async (mediaId: string, tags: string[]) => {
    try {
      await updateTags(mediaId, tags)
      toast({
        title: "Tags updated",
        description: "Media has been tagged successfully",
      })
    } catch (error) {
      toast({
        title: "Tagging failed",
        description: "There was an error updating the tags",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button
          onClick={handleUpload}
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          disabled={uploadProgress.length > 0}
        >
          {uploadProgress.length > 0 ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Upload className="h-4 w-4 text-white" />
          )}
        </Button>

        <Link href="/all-media">
          <Button className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800 hover:from-gray-600 hover:via-slate-500 hover:to-red-700 text-white px-6">
            All Media
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 pb-8">
        {/* Left Side - Recent */}
        <div className="flex-1">
          {/* Title and Search */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Eneskench Summit</h1>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="search by name or tag"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Recent Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Recent</h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-700"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMedia.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No media files yet</h3>
                  <p className="text-gray-400 mb-6">Upload some images or videos to get started</p>
                </div>

                <Button onClick={handleUpload} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recentMedia.map((mediaItem) => (
                  <div
                    key={mediaItem.id}
                    className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors relative"
                  >
                    <div className="relative aspect-square cursor-pointer" onClick={() => handleMediaClick(mediaItem)}>
                      {mediaItem.type === "image" ? (
                        <img
                          src={mediaItem.url || "/placeholder.svg"}
                          alt={mediaItem.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : (
                        <video
                          src={mediaItem.url}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if video fails to load
                            const target = e.target as HTMLVideoElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      )}

                      {/* Fallback placeholder */}
                      <div className="hidden w-full h-full bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900 flex items-center justify-center absolute inset-0">
                        {mediaItem.type === "image" ? (
                          <div className="text-center">
                            <Camera className="h-12 w-12 text-gray-500 opacity-30 mx-auto mb-2" />
                            <div className="text-gray-500 text-sm font-medium">Image</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Video className="h-12 w-12 text-gray-500 opacity-30 mx-auto mb-2" />
                            <div className="text-gray-500 text-sm font-medium">Video</div>
                          </div>
                        )}
                      </div>

                      {mediaItem.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom buttons */}
                    <div className="p-3 flex items-center justify-between">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(mediaItem)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setTaggingMedia(mediaItem)
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2"
                      >
                        <Tag className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Quick Access */}
        <div className="lg:w-80">
          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Access</h3>

            <div className="space-y-3">
              {quickAccessUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800 text-white text-sm">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <UploadProgress files={uploadProgress} />

      {/* Fullscreen Media Modal */}
      {expandedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              onClick={() => setExpandedMedia(null)}
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="relative">
              {expandedMedia.type === "image" ? (
                <img
                  src={expandedMedia.url || "/placeholder.svg"}
                  alt={expandedMedia.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              ) : (
                <video src={expandedMedia.url} controls className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-medium">{expandedMedia.name}</h3>
              <p className="text-gray-400 text-sm mt-1">
                by {expandedMedia.uploadedBy} • {new Date(expandedMedia.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
      <TaggingModal
        isOpen={!!taggingMedia}
        onClose={() => setTaggingMedia(null)}
        mediaItem={taggingMedia}
        onTagsUpdate={handleTagsUpdate}
      />
    </div>
  )
}
