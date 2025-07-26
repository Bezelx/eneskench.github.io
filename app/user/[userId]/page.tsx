"use client"

import { useState } from "react"
import { Search, Upload, ArrowLeft, Tag, Download, X, Camera, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { use } from "react"
import { TaggingModal } from "@/components/tagging-modal"
import { useMedia } from "@/hooks/use-media"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const quickAccessUsers = [
  { id: "bas", name: "Bas", initials: "BA" },
  { id: "sha", name: "Sha", initials: "SH" },
  { id: "nate", name: "Nate", initials: "NA" },
  { id: "simon", name: "Simon", initials: "SI" },
  { id: "felaw", name: "Felaw", initials: "FE" },
]

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function UserPage({ params }: PageProps) {
  const { userId } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedMedia, setExpandedMedia] = useState<any | null>(null)
  const [taggingMedia, setTaggingMedia] = useState<any>(null)

  const { media, loading, updateTags } = useMedia()
  const { toast } = useToast()

  const user = quickAccessUsers.find((u) => u.id === userId)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User not found</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800 hover:from-gray-600 hover:via-slate-500 hover:to-red-700 text-white">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        console.log("Files selected:", Array.from(files))
        // Handle file upload logic here
      }
    }
    input.click()
  }

  const handleMediaClick = (media: any) => {
    setExpandedMedia(media)
  }

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

  // Filter media that has this user's tag
  const userMedia = media.filter((mediaItem) => mediaItem.tags.includes(userId))

  const filteredMedia = userMedia.filter((mediaItem) =>
    mediaItem.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-red-950">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4 text-white" />
            </Button>
          </Link>
          <Button
            onClick={handleUpload}
            variant="outline"
            size="icon"
            className="bg-transparent border-gray-600 hover:bg-gray-800"
          >
            <Upload className="h-4 w-4 text-white" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-r from-gray-700 via-slate-600 to-red-800 text-white text-sm">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        </div>
        <div className="w-20"></div> {/* Spacer for centering */}
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={`Search ${user.name}'s media`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 animate-pulse">
                <div className="aspect-square bg-gray-700"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              {userMedia.length === 0 ? `No media tagged with ${user.name} yet` : "No media found matching your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((mediaItem) => (
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
                        <Camera className="h-8 w-8 text-gray-500 opacity-30 mx-auto mb-1" />
                        <div className="text-gray-500 text-xs font-medium">Image</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Video className="h-8 w-8 text-gray-500 opacity-30 mx-auto mb-1" />
                        <div className="text-gray-500 text-xs font-medium">Video</div>
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
                      console.log("Download media:", mediaItem.id, "Name:", mediaItem.name)
                      // Handle download logic here
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
              {/* Custom dark placeholder for fullscreen */}
              <div className="w-[800px] h-[600px] bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900 flex items-center justify-center rounded-lg">
                {expandedMedia.type === "image" ? (
                  <div className="text-center">
                    <Camera className="h-24 w-24 text-gray-500 opacity-20 mx-auto mb-4" />
                    <div className="text-gray-400 text-xl font-medium">Image Preview</div>
                    <div className="text-gray-500 text-sm mt-2">Click to view full resolution</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Video className="h-24 w-24 text-gray-500 opacity-20 mx-auto mb-4" />
                    <div className="text-gray-400 text-xl font-medium">Video Preview</div>
                    <div className="text-gray-500 text-sm mt-2">Click to play video</div>
                  </div>
                )}
              </div>
              {expandedMedia.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-4">
                    <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[12px] border-y-transparent ml-1"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-medium">{expandedMedia.name}</h3>
              <p className="text-gray-400 text-sm mt-1">
                by {expandedMedia.uploadedBy} • {expandedMedia.uploadedAt}
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
