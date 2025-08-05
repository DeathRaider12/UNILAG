"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Film,
  Music,
  ImageIcon,
  MoreVertical,
  Play,
  Trash2,
  Copy,
  Info,
} from "lucide-react"
import type { VideoClip } from "@/lib/video-processing-service"

interface MediaLibraryProps {
  clips: VideoClip[]
  onClipSelect: (clip: VideoClip) => void
  onFileUpload: (files: FileList) => void
  selectedClip: VideoClip | null
}

export function MediaLibrary({ clips, onClipSelect, onFileUpload, selectedClip }: MediaLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = useState<"all" | "video" | "audio" | "image">("all")

  const filteredClips = clips.filter((clip) => {
    const matchesSearch = clip.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || clip.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileUpload(files)
    }
  }

  const getClipIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Film className="h-6 w-6 text-blue-500" />
      case "audio":
        return <Music className="h-6 w-6 text-green-500" />
      case "image":
        return <ImageIcon className="h-6 w-6 text-purple-500" />
      default:
        return <Film className="h-6 w-6 text-gray-500" />
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"]
    if (bytes === 0) return "0 B"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Media Library</h3>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant={viewMode === "grid" ? "default" : "ghost"} onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant={viewMode === "list" ? "default" : "ghost"} onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex space-x-2">
            {["all", "video", "audio", "image"].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={filterType === type ? "default" : "ghost"}
                onClick={() => setFilterType(type as any)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.multiple = true
            input.accept = "video/*,audio/*,image/*"
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files
              if (files) onFileUpload(files)
            }
            input.click()
          }}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Drag & drop files here or click to browse</p>
          <p className="text-xs text-gray-500 mt-1">Supports video, audio, and image files</p>
        </div>
      </div>

      {/* Media Grid/List */}
      <ScrollArea className="flex-1">
        {filteredClips.length === 0 ? (
          <div className="text-center py-8">
            <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No media files found</p>
            <p className="text-sm text-gray-500">Upload some files to get started</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredClips.map((clip) => (
              <Card
                key={clip.id}
                className={`cursor-pointer transition-all hover:bg-gray-700 ${
                  selectedClip?.id === clip.id ? "ring-2 ring-blue-500 bg-gray-700" : "bg-gray-800"
                }`}
                onClick={() => onClipSelect(clip)}
              >
                <CardContent className="p-3">
                  <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                    {getClipIcon(clip.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white truncate">{clip.name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDuration(clip.duration)}</span>
                      <Badge variant="outline" className="text-xs">
                        {clip.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClips.map((clip) => (
              <div
                key={clip.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-700 ${
                  selectedClip?.id === clip.id ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-800"
                }`}
                onClick={() => onClipSelect(clip)}
              >
                <div className="flex-shrink-0">{getClipIcon(clip.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{clip.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDuration(clip.duration)} • {clip.type}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Track {clip.track + 1}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Info className="h-4 w-4 mr-2" />
                        Properties
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Stats */}
      <div className="text-xs text-gray-400 text-center">
        {filteredClips.length} of {clips.length} files
      </div>
    </div>
  )
}
